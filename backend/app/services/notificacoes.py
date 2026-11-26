"""Regras das notificações (#103, Pessoa A). O router só recebe a chamada e
chama daqui.

As notificações não ficam guardadas numa tabela: são montadas na hora a
partir do que já existe no banco (curtidas, comentários e follows). Assim,
desfazer a ação (descurtir, deixar de seguir, apagar o post) tira o aviso
sozinho, e nenhuma rota de outra pessoa precisa avisar este arquivo.

Regras:
- Quem fez a ação nunca recebe aviso dela (curtir o próprio post, responder
  o próprio comentário).
- Curtidas vêm agrupadas: uma linha por post ("ana e mais 3 curtiram") e uma
  por comentário, com a hora da curtida mais recente. Comentários, respostas
  e follows vêm um por linha.
- Uma resposta ao seu comentário aparece como "respondeu", mesmo no seu post,
  para não virar dois avisos da mesma coisa.
- DMs ficam de fora: já têm o contador próprio na aba Mensagens.
- "Nova" é o que chegou depois da última vez que a pessoa abriu a página.
"""

from datetime import datetime

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.db import agora_utc
from app.models.comment import Comment
from app.models.curtida_comentario import CurtidaComentario
from app.models.follow import Follow
from app.models.like import Like
from app.models.notificacao_vista import NotificacaoVista
from app.models.post import Post
from app.models.user import User
from app.schemas.notificacao import NotificacaoOut
from app.schemas.post import AutorOut

# Quantas linhas a página mostra: as mais recentes.
LIMITE = 50
# O tamanho do começo do texto que a linha mostra.
TAMANHO_TRECHO = 80


def _trecho(texto: str) -> str:
    texto = " ".join(texto.split())  # quebras de linha viram espaço
    if len(texto) <= TAMANHO_TRECHO:
        return texto
    return texto[: TAMANHO_TRECHO - 1].rstrip() + "…"


def _agrupar(
    linhas: list[tuple[int, datetime, User]],
) -> dict[int, tuple[User, datetime, int]]:
    """Curtidas (alvo, quando, quem), da mais nova para a mais antiga, viram
    uma linha por alvo: quem curtiu por último, quando e quantos além dele."""
    grupos: dict[int, tuple[User, datetime, int]] = {}
    for alvo, quando, quem in linhas:
        if alvo in grupos:
            ultimo, hora, outros = grupos[alvo]
            grupos[alvo] = (ultimo, hora, outros + 1)
        else:
            grupos[alvo] = (quem, quando, 0)
    return grupos


def _visto_ate(db: Session, eu: User) -> datetime | None:
    return db.scalar(select(NotificacaoVista.visto_ate).where(NotificacaoVista.user_id == eu.id))


def _montar(db: Session, eu: User) -> list[NotificacaoOut]:
    """Todas as notificações de `eu`, da mais nova para a mais antiga."""
    visto_ate = _visto_ate(db, eu)

    def nova(quando: datetime) -> bool:
        return visto_ate is None or quando > visto_ate

    meus_posts = select(Post.id).where(Post.autor_id == eu.id)
    meus_comentarios = select(Comment.id).where(Comment.autor_id == eu.id)
    avisos: list[NotificacaoOut] = []

    # Curtidas nos meus posts, uma linha por post.
    textos_dos_posts = dict(db.execute(select(Post.id, Post.texto).where(Post.autor_id == eu.id)).all())
    curtidas = db.execute(
        select(Like.post_id, Like.created_at, User)
        .join(User, User.id == Like.user_id)
        .where(Like.post_id.in_(meus_posts), Like.user_id != eu.id)
        .order_by(Like.created_at.desc(), Like.id.desc())
    ).all()
    for post_id, (quem, quando, outros) in _agrupar(curtidas).items():
        avisos.append(
            NotificacaoOut(
                tipo="curtida",
                pessoa=AutorOut.model_validate(quem),
                outros=outros,
                quando=quando,
                nova=nova(quando),
                post_id=post_id,
                trecho=_trecho(textos_dos_posts.get(post_id, "")),
            )
        )

    # Comentários nos meus posts e respostas aos meus comentários.
    ids_dos_meus_comentarios = set(db.scalars(meus_comentarios))
    comentarios = db.scalars(
        select(Comment).where(
            Comment.autor_id != eu.id,
            or_(Comment.post_id.in_(meus_posts), Comment.parent_id.in_(meus_comentarios)),
        )
    ).all()
    for c in comentarios:
        avisos.append(
            NotificacaoOut(
                tipo="resposta" if c.parent_id in ids_dos_meus_comentarios else "comentario",
                pessoa=AutorOut.model_validate(c.autor),
                quando=c.created_at,
                nova=nova(c.created_at),
                post_id=c.post_id,
                comentario_id=c.id,
                trecho=_trecho(c.texto),
            )
        )

    # Curtidas nos meus comentários, uma linha por comentário.
    meus = {
        id_: (post_id, texto)
        for id_, post_id, texto in db.execute(
            select(Comment.id, Comment.post_id, Comment.texto).where(Comment.autor_id == eu.id)
        )
    }
    curtidas_comentarios = db.execute(
        select(CurtidaComentario.comentario_id, CurtidaComentario.created_at, User)
        .join(User, User.id == CurtidaComentario.user_id)
        .where(
            CurtidaComentario.comentario_id.in_(meus_comentarios),
            CurtidaComentario.user_id != eu.id,
        )
        .order_by(CurtidaComentario.created_at.desc(), CurtidaComentario.id.desc())
    ).all()
    for comentario_id, (quem, quando, outros) in _agrupar(curtidas_comentarios).items():
        post_id, texto = meus[comentario_id]
        avisos.append(
            NotificacaoOut(
                tipo="curtida_comentario",
                pessoa=AutorOut.model_validate(quem),
                outros=outros,
                quando=quando,
                nova=nova(quando),
                post_id=post_id,
                comentario_id=comentario_id,
                trecho=_trecho(texto),
            )
        )

    # Quem começou a me seguir.
    follows = db.execute(
        select(Follow.created_at, User)
        .join(User, User.id == Follow.seguidor_id)
        .where(Follow.seguido_id == eu.id, Follow.seguidor_id != eu.id)
    ).all()
    for quando, quem in follows:
        avisos.append(
            NotificacaoOut(
                tipo="seguiu",
                pessoa=AutorOut.model_validate(quem),
                quando=quando,
                nova=nova(quando),
            )
        )

    avisos.sort(key=lambda a: a.quando, reverse=True)
    return avisos


def listar(db: Session, eu: User) -> list[NotificacaoOut]:
    """As mais recentes, com as novas marcadas. Abrir a página conta como ver
    tudo: a marca avança e o contador do topo zera."""
    avisos = _montar(db, eu)[:LIMITE]
    marca = db.scalar(select(NotificacaoVista).where(NotificacaoVista.user_id == eu.id))
    if marca is None:
        db.add(NotificacaoVista(user_id=eu.id, visto_ate=agora_utc()))
    else:
        marca.visto_ate = agora_utc()
    db.commit()
    return avisos


def contar_novas(db: Session, eu: User) -> int:
    """O número no sino: as linhas novas, não as ações (uma linha de "ana e
    mais 3 curtiram" conta uma vez)."""
    return sum(1 for aviso in _montar(db, eu) if aviso.nova)
