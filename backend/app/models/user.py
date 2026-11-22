from datetime import datetime, timezone

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(30), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(80))
    bio: Mapped[str] = mapped_column(String(280), default="")
    avatar_url: Mapped[str] = mapped_column(String(300), default="")
    # A senha nunca é guardada: só o hash bcrypt (guia 01). Nunca sai na API.
    password_hash: Mapped[str] = mapped_column(String(100), default="")
    # A meta (decisão 3). vestibular e curso são chaves de app/constantes.py,
    # ou "" se a pessoa não escolheu. Os campos *_outro só valem com "outro".
    vestibular: Mapped[str] = mapped_column(String(30), default="")
    curso: Mapped[str] = mapped_column(String(30), default="")
    vestibular_outro: Mapped[str] = mapped_column(String(60), default="")
    curso_outro: Mapped[str] = mapped_column(String(60), default="")
    universidade: Mapped[str] = mapped_column(String(80), default="")
    created_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc)
    )
