"""Regras dos comentários (#12, Pessoa C). O router só recebe a chamada e chama daqui."""

from fastapi import HTTPException
from sqlalchemy import delete, func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.arvore import pendurar_respostas
from app.models.comment import Comment
from app.models.curtida_comentario import CurtidaComentario
from app.models.user import User
from app.schemas.comentario import ComentarioCriar
from app.services.posts import buscar


def _buscar(db: Session, post_id: int, comentario_id: int) -> Comment:
    """O comentário, se ele existe e é deste post; senão 404."""
    comentario = db.get(Comment, comentario_id)
    if comentario is None or comentario.post_id != post_id:
        raise HTTPException(status_code=404, detail="comentário não encontrado neste post")
    return comentario


def criar(db: Session, user: User, post_id: int, dados: ComentarioCriar) -> Comment:
    buscar(db, post_id)  # 404 se o post não existe
    if dados.parent_id is not None:
        _buscar(db, post_id, dados.parent_id)  # 404 se o pai não existe ou é de outro post
    comentario = Comment(
        autor_id=user.id, post_id=post_id, parent_id=dados.parent_id, texto=dados.texto
    )
    db.add(comentario)
    db.commit()
    db.refresh(comentario)
    return comentario


def listar(
    db: Session, user: User, post_id: int, offset: int, limit: int
) -> tuple[list[Comment], int, int]:
    """Os comentários diretos no post, do mais antigo para o mais novo e
    paginados, cada um com as suas respostas penduradas (também em ordem
    cronológica). Devolve a página, o total de raízes e o total geral."""
    buscar(db, post_id)
    do_post = Comment.post_id == post_id
    raiz = Comment.parent_id.is_(None)
    total = db.scalar(select(func.count()).select_from(Comment).where(do_post, raiz)) or 0
    total_geral = db.scalar(select(func.count()).select_from(Comment).where(do_post)) or 0
    # O id desempata comentários criados no mesmo instante.
    cronologica = (Comment.created_at, Comment.id)
    raizes = list(
        db.scalars(
            select(Comment).where(do_post, raiz).order_by(*cronologica).offset(offset).limit(limit)
        )
    )
    # Todas as respostas do post numa consulta só; a árvore é montada no core/.
    respostas = list(db.scalars(select(Comment).where(do_post, ~raiz).order_by(*cronologica)))
    pendurar_respostas(
        raizes,
        respostas,
        id_de=lambda c: c.id,
        pai_de=lambda c: c.parent_id,
        guardar=lambda c, filhos: setattr(c, "respostas", filhos),
    )
    _marcar_curtidos(db, user, raizes + respostas)
    return raizes, total, total_geral


def _marcar_curtidos(db: Session, user: User, comentarios: list[Comment]) -> None:
    """Preenche o `curtido_por_mim` de cada comentário numa consulta só."""
    ids = [c.id for c in comentarios]
    if not ids:
        return
    consulta = select(CurtidaComentario.comentario_id).where(
        CurtidaComentario.user_id == user.id, CurtidaComentario.comentario_id.in_(ids)
    )
    curtidos = set(db.scalars(consulta))
    for c in comentarios:
        c.curtido_por_mim = c.id in curtidos


def curtir(db: Session, user: User, post_id: int, comentario_id: int) -> None:
    """Idempotente, como curtir um post: curtir de novo não cria outra curtida."""
    _buscar(db, post_id, comentario_id)
    ja = select(CurtidaComentario.id).where(
        CurtidaComentario.user_id == user.id, CurtidaComentario.comentario_id == comentario_id
    )
    if db.scalar(ja) is not None:
        return
    db.add(CurtidaComentario(user_id=user.id, comentario_id=comentario_id))
    try:
        db.commit()
    except IntegrityError:
        # Dois pedidos ao mesmo tempo: a curtida já existe, que é o pedido.
        db.rollback()


def descurtir(db: Session, user: User, post_id: int, comentario_id: int) -> None:
    """Idempotente: descurtir o que não foi curtido não dá erro."""
    _buscar(db, post_id, comentario_id)
    db.execute(
        delete(CurtidaComentario).where(
            CurtidaComentario.user_id == user.id, CurtidaComentario.comentario_id == comentario_id
        )
    )
    db.commit()
