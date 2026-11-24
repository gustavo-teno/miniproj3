from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.post import AutorOut


class ComentarioCriar(BaseModel):
    # Tira os espaços das pontas antes de validar: "   " vira "" e é recusado.
    model_config = ConfigDict(str_strip_whitespace=True)

    texto: str = Field(min_length=1, max_length=500)


class ComentarioOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    texto: str
    created_at: datetime
    autor: AutorOut


class ComentarioPage(BaseModel):
    """Mesmo padrão de paginação do UserPage."""

    items: list[ComentarioOut]
    total: int
    offset: int
    limit: int
