from pydantic import BaseModel

from app.schemas.post import PostOut


class PostsSalvos(BaseModel):
    """GET /salvos: o padrão de paginação do projeto, com o PostOut."""

    items: list[PostOut]
    total: int
    offset: int
    limit: int
