from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.post import AutorOut


class ComentarioCriar(BaseModel):
    # Tira os espaços das pontas antes de validar: "   " vira "" e é recusado.
    model_config = ConfigDict(str_strip_whitespace=True)

    texto: str = Field(min_length=1, max_length=500)
    # O comentário que este responde, do mesmo post. Sem ele, é direto no post.
    parent_id: int | None = None


class ComentarioOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    texto: str
    created_at: datetime
    autor: AutorOut
    parent_id: int | None = None
    curtidas: int = 0
    curtido_por_mim: bool = False
    # As respostas, cada uma com as respostas dela (comentários em árvore).
    respostas: list["ComentarioOut"] = []


class ComentarioPage(BaseModel):
    """Mesmo padrão de paginação do UserPage. A página conta só os comentários
    diretos no post (as raízes); as respostas vêm dentro de cada um."""

    items: list[ComentarioOut]
    total: int
    offset: int
    limit: int
    # Raízes e respostas juntas: o "N comentários" do topo da conversa.
    total_com_respostas: int = 0
