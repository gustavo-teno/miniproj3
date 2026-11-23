from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base, CriadoEm


class Sessao(Base):
    """Uma sessão de login (#6, guia 01): o token que o login entrega.

    O token é uma string aleatória, sem nada dentro. Quem o mostra no header
    Authorization é reconhecido como user_id. Sair é apagar a linha.
    """

    __tablename__ = "sessoes"

    token: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    created_at: Mapped[CriadoEm]
