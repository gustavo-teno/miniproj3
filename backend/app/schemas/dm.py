from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.post import AutorOut


class MensagemCriar(BaseModel):
    # Tira os espaços das pontas antes de validar: "   " vira "" e é recusado.
    model_config = ConfigDict(str_strip_whitespace=True)

    texto: str = Field(min_length=1, max_length=1000)


class MensagemOut(BaseModel):
    id: int
    texto: str
    created_at: datetime
    # Se quem está vendo mandou esta mensagem: a tela põe à direita.
    minha: bool


class ConversaOut(BaseModel):
    """Um item de GET /dms: com quem é, a última mensagem e as não lidas."""

    pessoa: AutorOut
    ultima: MensagemOut
    nao_lidas: int


class ConversaAberta(BaseModel):
    """GET /dms/{username}: as mensagens, da mais antiga para a mais nova."""

    pessoa: AutorOut
    # Só entre mútuos (decisão 6). Se alguém deixou de seguir, a conversa
    # continua visível, mas a caixa de escrever some.
    pode_responder: bool
    mensagens: list[MensagemOut]


class PodeMandarOut(BaseModel):
    """GET /dms/{username}/pode-mandar: o botão Mensagem do perfil só aparece
    entre mútuos (decisão 6)."""

    pode_mandar: bool


class NaoLidasOut(BaseModel):
    """GET /dms/nao-lidas: o número na aba Mensagens."""

    total: int
