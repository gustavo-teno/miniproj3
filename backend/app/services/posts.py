"""Regras dos posts (#9, Pessoa B). O router só recebe a chamada e chama daqui."""

from datetime import timezone

from fastapi import HTTPException
from sqlalchemy import delete
from sqlalchemy.orm import Session

from app.models.comment import Comment
from app.models.like import Like
from app.models.post import Post
from app.models.user import User
from app.schemas.post import AutorOut, PostCriar, PostEditar, PostOut


def para_out(db: Session, post: Post) -> PostOut:
    """Monta o PostOut com o autor dentro.

    O model Post só guarda o autor_id, então o autor é buscado à parte. Se um
    dia o Post ganhar `autor = relationship("User")`, isto fica mais simples.
    """
    autor = db.get(User, post.autor_id)
    # O SQLite não guarda o fuso: a hora volta sem ele, e o navegador acharia
    # que é horário local (3 h de diferença no Brasil). Ela foi gravada em UTC.
    criado = post.created_at
    if criado.tzinfo is None:
        criado = criado.replace(tzinfo=timezone.utc)
    return PostOut(
        id=post.id,
        texto=post.texto,
        tag=post.tag,
        minutos=post.minutos,
        created_at=criado,
        autor=AutorOut.model_validate(autor),
    )


def buscar(db: Session, post_id: int) -> Post:
    post = db.get(Post, post_id)
    if post is None:
        raise HTTPException(status_code=404, detail="post não encontrado")
    return post


def _do_autor(db: Session, user: User, post_id: int) -> Post:
    """Busca o post e confere que quem pediu é o autor (só ele edita e apaga)."""
    post = buscar(db, post_id)
    if post.autor_id != user.id:
        raise HTTPException(status_code=403, detail="só o autor mexe no post")
    return post


def criar(db: Session, user: User, dados: PostCriar) -> PostOut:
    post = Post(autor_id=user.id, **dados.model_dump())
    db.add(post)
    db.commit()
    db.refresh(post)
    return para_out(db, post)


def editar(db: Session, user: User, post_id: int, dados: PostEditar) -> PostOut:
    post = _do_autor(db, user, post_id)

    # exclude_unset: só o que veio no corpo do PATCH muda.
    mudancas = dados.model_dump(exclude_unset=True)
    # Texto e tag não podem ficar vazios; minutos pode (null tira a duração).
    for campo in ("texto", "tag"):
        if campo in mudancas and mudancas[campo] is None:
            del mudancas[campo]

    for campo, valor in mudancas.items():
        setattr(post, campo, valor)
    db.commit()
    db.refresh(post)
    return para_out(db, post)


def apagar(db: Session, user: User, post_id: int) -> None:
    post = _do_autor(db, user, post_id)
    # O SQLite não apaga em cascata sozinho: curtidas e comentários vão antes,
    # senão ficam apontando para um post que não existe mais.
    db.execute(delete(Like).where(Like.post_id == post.id))
    db.execute(delete(Comment).where(Comment.post_id == post.id))
    db.delete(post)
    db.commit()
