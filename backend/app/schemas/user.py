from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.constantes import CURSOS, VESTIBULARES
from app.schemas.post import PostOut


def _foto_https(v: str | None) -> str | None:
    """A foto é um link que o navegador de quem visita vai buscar. Só https:
    sem o "s", a página publicada em https bloqueia a imagem, e outros
    esquemas (javascript:, data:) não têm por que entrar. "" tira a foto."""
    if v and not v.startswith("https://"):
        raise ValueError("a foto precisa ser um link que comece com https://")
    return v


class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=30, pattern=r"^[a-z0-9_]+$")
    name: str = Field(min_length=1, max_length=80)
    bio: str = Field(default="", max_length=280)
    avatar_url: str = Field(default="", max_length=300)

    _validar_foto = field_validator("avatar_url")(_foto_https)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    name: str
    bio: str
    avatar_url: str
    created_at: datetime


class UserPage(BaseModel):
    """Padrão de paginação do projeto: todo endpoint de listagem devolve isto."""

    items: list[UserOut]
    total: int
    offset: int
    limit: int


# ---- perfil-diário (#10, Pessoa B) ----


class CadernoOut(BaseModel):
    """Um caderno da estante do perfil: quantos posts a pessoa tem numa tag e
    quando foi o último. Só vêm as tags com post; a tela completa com as
    outras (vazias) a partir de GET /opcoes."""

    tag: str
    posts: int
    ultimo_post: datetime


class PerfilOut(UserOut):
    """GET /usuarios/{username}: o topo do diário e a estante de cadernos."""

    # A meta (decisão 3). Chaves de GET /opcoes, ou "" se não escolheu; os
    # *_outro só têm texto quando a escolha foi "outro".
    vestibular: str
    curso: str
    vestibular_outro: str
    curso_outro: str
    universidade: str
    # Contados na tabela de follows (o teste de follow da Pessoa D lê estes).
    seguidores: int
    seguindo: int
    # Se quem está vendo é a dona do perfil: a tela mostra "Editar perfil",
    # as horas da semana e o postar só nesse caso.
    meu_perfil: bool
    # Do caderno mais usado para o menos usado.
    cadernos: list[CadernoOut]


class PerfilEditar(BaseModel):
    """PATCH /usuarios/eu. Tudo opcional: só muda o que vier no corpo."""

    model_config = ConfigDict(str_strip_whitespace=True)

    name: str | None = Field(default=None, min_length=1, max_length=80)
    bio: str | None = Field(default=None, max_length=280)
    avatar_url: str | None = Field(default=None, max_length=300)
    vestibular: str | None = None
    curso: str | None = None
    vestibular_outro: str | None = Field(default=None, max_length=60)
    curso_outro: str | None = Field(default=None, max_length=60)
    universidade: str | None = Field(default=None, max_length=80)

    _validar_foto = field_validator("avatar_url")(_foto_https)

    # As mesmas listas do cadastro (constantes.py); "" tira a escolha.
    @field_validator("vestibular")
    @classmethod
    def vestibular_da_lista(cls, v: str | None) -> str | None:
        if v and v not in VESTIBULARES:
            raise ValueError("vestibular fora da lista de GET /opcoes")
        return v

    @field_validator("curso")
    @classmethod
    def curso_da_lista(cls, v: str | None) -> str | None:
        if v and v not in CURSOS:
            raise ValueError("curso fora da lista de GET /opcoes")
        return v


class PostPage(BaseModel):
    """GET /usuarios/{username}/posts: o padrão de paginação com o PostOut."""

    items: list[PostOut]
    total: int
    offset: int
    limit: int
