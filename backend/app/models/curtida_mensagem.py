from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base, CriadoEm


class CurtidaMensagem(Base):
    """Um coração numa mensagem das DMs (#68, Pessoa A), com dois toques, como
    nos apps de mensagem. Tabela nova, e não coluna da Mensagem: o create_all
    cria sozinha, então ninguém precisa apagar o banco."""

    __tablename__ = "curtidas_mensagens"
    # Curtir duas vezes não cria duas linhas.
    __table_args__ = (UniqueConstraint("user_id", "mensagem_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    mensagem_id: Mapped[int] = mapped_column(ForeignKey("mensagens.id"), index=True)
    created_at: Mapped[CriadoEm]
