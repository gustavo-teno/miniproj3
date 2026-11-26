"""Regras dos posts salvos (#64, Pessoa A). O router só recebe a chamada e
chama daqui. Segue o jeito das curtidas (services/curtidas.py): salvar e
tirar são idempotentes, e o "eu salvei?" vem no próprio post (PostOut)."""

from sqlalchemy import delete, func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.post import Post
from app.models.salvo import Salvo
from app.models.user import User
from app.services.curtidas import marcar_curtidos
from app.services.posts import buscar


def salvar(db: Session, user: User, post_id: int) -> None:
    """Idempotente: salvar de novo não cria um segundo salvo."""
    buscar(db, post_id)  # 404 se o post não existe
    ja_salvou = select(Salvo.id).where(Salvo.user_id == user.id, Salvo.post_id == post_id)
    if db.scalar(ja_salvou) is not None:
        return
    db.add(Salvo(user_id=user.id, post_id=post_id))
    try:
        db.commit()
    except IntegrityError:
        # Dois cliques ao mesmo tempo (ex.: duas abas): o segundo bate no par
        # único do model. O post já está salvo, que é o que foi pedido.
        db.rollback()


def tirar(db: Session, user: User, post_id: int) -> None:
    """Idempotente: tirar o que não estava salvo não dá erro."""
    buscar(db, post_id)
    db.execute(delete(Salvo).where(Salvo.user_id == user.id, Salvo.post_id == post_id))
    db.commit()


def listar(db: Session, user: User, offset: int, limit: int) -> tuple[list[Post], int]:
    """Os posts que a pessoa salvou, do salvo mais recente para o mais antigo
    (a ordem em que ela salvou, não a data do post)."""
    total = db.scalar(select(func.count()).where(Salvo.user_id == user.id)) or 0
    consulta = (
        select(Post)
        .join(Salvo, Salvo.post_id == Post.id)
        .where(Salvo.user_id == user.id)
        .order_by(Salvo.id.desc())
        .offset(offset)
        .limit(limit)
    )
    posts = list(db.scalars(consulta))
    marcar_curtidos(db, user, posts)
    for post in posts:
        post.salvo_por_mim = True
    return posts, total


def marcar_salvos(db: Session, user: User, posts: list[Post]) -> None:
    """Preenche o `salvo_por_mim` de cada post, numa consulta só para a lista
    inteira (como o marcar_curtidos)."""
    ids = [post.id for post in posts]
    if not ids:
        return
    consulta = select(Salvo.post_id).where(Salvo.user_id == user.id, Salvo.post_id.in_(ids))
    salvos = set(db.scalars(consulta))
    for post in posts:
        post.salvo_por_mim = post.id in salvos
