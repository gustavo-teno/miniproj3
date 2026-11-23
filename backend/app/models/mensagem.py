from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base, CriadoEm

class Mensagem(Base):
    """DM entre mútuos (decisão 6, opcional). Se as DMs forem cortadas, sai."""

    __tablename__ = "mensagens"

    id: Mapped[int] = mapped_column(primary_key=True)
    remetente_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    destinatario_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    texto: Mapped[str] = mapped_column(String(1000))
    created_at: Mapped[CriadoEm]
