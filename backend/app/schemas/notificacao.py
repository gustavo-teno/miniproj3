from datetime import datetime
from typing import Literal

from pydantic import BaseModel

from app.schemas.post import AutorOut

# O que aconteceu. A tela escolhe a frase e para onde a linha leva.
TipoNotificacao = Literal["curtida", "comentario", "resposta", "curtida_comentario", "seguiu"]


class NotificacaoOut(BaseModel):
    """Uma linha de GET /notificacoes."""

    tipo: TipoNotificacao
    # Quem fez a ação. Nas curtidas, que vêm agrupadas por post ou por
    # comentário, é a pessoa mais recente; `outros` diz quantas além dela.
    pessoa: AutorOut
    outros: int = 0
    quando: datetime
    # Se chegou depois da última vez que a pessoa abriu a página.
    nova: bool
    # Para onde a linha leva: o post (com o comentário, quando houver). No
    # "seguiu", os dois ficam vazios e a linha leva ao perfil de quem seguiu.
    post_id: int | None = None
    comentario_id: int | None = None
    # O começo do texto: do comentário (comentou, respondeu, curtiu seu
    # comentário) ou do post (curtiu seu post).
    trecho: str = ""


class NovasOut(BaseModel):
    """GET /notificacoes/novas: o número no sino do topo."""

    total: int
