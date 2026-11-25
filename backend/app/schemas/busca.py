from pydantic import BaseModel

from app.schemas.post import PostOut


class ResultadoPosts(BaseModel):
    """GET /busca/posts: o padrão de paginação do projeto, com o PostOut. As
    pessoas usam o UserPage, que já existe (schemas/user.py)."""

    items: list[PostOut]
    total: int
    offset: int
    limit: int
