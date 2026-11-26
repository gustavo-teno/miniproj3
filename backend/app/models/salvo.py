from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base, CriadoEm


class Salvo(Base):
    """Um post que alguém guardou para rever depois (#64, Pessoa A): uma
    explicação boa, uma lista de questões. Só quem salvou vê. É uma tabela
    nova, e não uma coluna do Post: o create_all cria sozinho, então ninguém
    precisa apagar o banco."""

    __tablename__ = "salvos"
    # Salvar duas vezes não cria duas linhas.
    __table_args__ = (UniqueConstraint("user_id", "post_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    post_id: Mapped[int] = mapped_column(ForeignKey("posts.id"), index=True)
    created_at: Mapped[CriadoEm]
