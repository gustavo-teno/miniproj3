from datetime import datetime, timezone

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.constantes import TAG_PADRAO
from app.db import Base


class Post(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(primary_key=True)
    autor_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    texto: Mapped[str] = mapped_column(String(1000))
    # Padrão bate-papo só na API (os testes do núcleo postam só com texto).
    # Na tela, escolher a tag é obrigatório (decisão 2).
    tag: Mapped[str] = mapped_column(String(20), default=TAG_PADRAO)
    # Duração da sessão de estudo, opcional. Soma no resumo da semana.
    minutos: Mapped[int | None] = mapped_column(default=None)
    created_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc)
    )
