"""Regras dos posts (#9, Pessoa B). O router só recebe a chamada e chama daqui."""

from fastapi import HTTPException
from sqlalchemy import delete
from sqlalchemy.orm import Session

from app.models.comment import Comment
from app.models.like import Like
from app.models.post import Post
from app.models.salvo import Salvo
from app.models.user import User
from app.schemas.post import PostCriar, PostEditar


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


def criar(db: Session, user: User, dados: PostCriar) -> Post:
    post = Post(autor_id=user.id, **dados.model_dump())
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


def editar(db: Session, user: User, post_id: int, dados: PostEditar) -> Post:
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
    return post


def apagar(db: Session, user: User, post_id: int) -> None:
    post = _do_autor(db, user, post_id)
    # O SQLite não apaga em cascata sozinho: curtidas, comentários e salvos vão
    # antes, senão ficam apontando para um post que não existe mais.
    db.execute(delete(Like).where(Like.post_id == post.id))
    db.execute(delete(Comment).where(Comment.post_id == post.id))
    db.execute(delete(Salvo).where(Salvo.post_id == post.id))
    db.delete(post)
    db.commit()
