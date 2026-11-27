from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.constantes import TAG_PADRAO, TAGS


def _tag_valida(tag: str | None) -> str | None:
    # A lista vem de constantes.py: ninguém escreve a sua própria.
    if tag is not None and tag not in TAGS:
        raise ValueError(f"tag desconhecida: {tag}")
    return tag


class PostCriar(BaseModel):
    # Tira os espaços das pontas antes de validar: "   " vira "" e é recusado.
    model_config = ConfigDict(str_strip_whitespace=True)

    texto: str = Field(min_length=1, max_length=1000)
    # Padrão só na API, para os testes do núcleo. Na tela a tag é obrigatória.
    tag: str = TAG_PADRAO
    # Duração da sessão de estudo, opcional. Até 24 h.
    minutos: int | None = Field(default=None, ge=1, le=1440)

    _validar_tag = field_validator("tag")(_tag_valida)


class PostEditar(BaseModel):
    """Tudo opcional: só muda o que vier no corpo do PATCH."""

    model_config = ConfigDict(str_strip_whitespace=True)

    texto: str | None = Field(default=None, min_length=1, max_length=1000)
    tag: str | None = None
    minutos: int | None = Field(default=None, ge=1, le=1440)

    _validar_tag = field_validator("tag")(_tag_valida)


class AutorOut(BaseModel):
    """O pedaço do usuário que o card do post mostra."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    name: str
    avatar_url: str


class PostOut(BaseModel):
    """O formato do post que feed, perfil e turmas usam (contrato da Pessoa B).
    A Pessoa C acrescenta aqui as curtidas e o número de comentários."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    texto: str
    tag: str
    minutos: int | None
    created_at: datetime
    autor: AutorOut
    curtidas: int
    comentarios: int
    # Depende de quem está vendo: quem preenche é services/curtidas.py
    # (marcar_curtidos). Sem ele, sai False.
    curtido_por_mim: bool = False
    # Do mesmo jeito, para o botão Salvar (#64): services/salvos.py
    # (marcar_salvos).
    salvo_por_mim: bool = False
    # Se o post tem imagem (#105): a tela busca em GET /posts/{id}/imagem.
    tem_imagem: bool = False
    # O tamanho dela em pixels (#127), para a tela reservar o espaço no formato
    # certo. None se o post não tem imagem ou se não deu para ler.
    imagem_largura: int | None = None
    imagem_altura: int | None = None
