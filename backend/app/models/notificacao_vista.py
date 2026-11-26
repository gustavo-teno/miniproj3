from datetime import datetime

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base, DataHoraUTC


class NotificacaoVista(Base):
    """Até quando cada pessoa já viu as notificações (#103). Uma linha por
    pessoa; abrir a página de notificações avança a marca, e o contador do
    topo conta só o que veio depois dela.

    As notificações em si não ficam guardadas: são montadas na hora a partir
    das curtidas, comentários e follows (services/notificacoes.py). Tabela
    nova o create_all cria sozinho: ninguém precisa apagar o banco."""

    __tablename__ = "notificacoes_vistas"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)
    visto_ate: Mapped[datetime] = mapped_column(DataHoraUTC)
