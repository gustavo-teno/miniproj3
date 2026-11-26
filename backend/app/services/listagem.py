"""Uma página de posts em ordem cronológica (Pessoa D), usada pelo feed e pela
página da turma. Cada um monta o próprio filtro (de quem são os posts, quais
matérias) e esta função faz o resto, igual para os dois.
"""

from sqlalchemy import ColumnElement, func, select
from sqlalchemy.orm import Session

from app.models.post import Post
from app.models.user import User
from app.services.curtidas import marcar_curtidos
from app.services.salvos import marcar_salvos


def pagina_de_posts(
    db: Session,
    eu: User,
    filtro: list[ColumnElement[bool]],
    offset: int,
    limit: int,
) -> tuple[list[Post], int]:
    """Os posts que passam no filtro, do mais novo para o mais antigo, com o
    total (para o "carregar mais") e o curtido/salvo de quem está vendo."""
    total = db.scalar(select(func.count(Post.id)).where(*filtro)) or 0
    posts = list(
        db.scalars(
            select(Post)
            .where(*filtro)
            # id desempata posts do mesmo segundo, para o "carregar mais" não
            # repetir nem pular nenhum.
            .order_by(Post.created_at.desc(), Post.id.desc())
            .offset(offset)
            .limit(limit)
        )
    )
    marcar_curtidos(db, eu, posts)
    marcar_salvos(db, eu, posts)
    return posts, total
