"""Regras das curtidas (#11, Pessoa C). O router só recebe a chamada e chama daqui."""

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.models.like import Like
from app.models.post import Post
from app.models.user import User
from app.services.posts import buscar


def _ja_curtiu(db: Session, user: User, post_id: int) -> bool:
    consulta = select(Like.id).where(Like.user_id == user.id, Like.post_id == post_id)
    return db.scalar(consulta) is not None


def curtir(db: Session, user: User, post_id: int) -> None:
    """Idempotente: curtir de novo não cria uma segunda curtida."""
    buscar(db, post_id)  # 404 se o post não existe
    if not _ja_curtiu(db, user, post_id):
        db.add(Like(user_id=user.id, post_id=post_id))
        db.commit()


def descurtir(db: Session, user: User, post_id: int) -> None:
    """Idempotente: descurtir o que não foi curtido não dá erro."""
    buscar(db, post_id)
    db.execute(delete(Like).where(Like.user_id == user.id, Like.post_id == post_id))
    db.commit()


def marcar_curtidos(db: Session, user: User, posts: list[Post]) -> None:
    """Preenche o `curtido_por_mim` de cada post, numa consulta só para a lista
    inteira. Feed, perfil e turmas chamam isto antes de devolver os posts."""
    ids = [post.id for post in posts]
    if not ids:
        return
    consulta = select(Like.post_id).where(Like.user_id == user.id, Like.post_id.in_(ids))
    curtidos = set(db.scalars(consulta))
    for post in posts:
        post.curtido_por_mim = post.id in curtidos
