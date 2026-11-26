from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base, CriadoEm


class CurtidaComentario(Base):
    """Uma curtida num comentário (Pessoa C), como a curtida do post (Like),
    mas numa tabela só dela: o create_all cria sozinha."""

    __tablename__ = "curtidas_comentarios"
    # Curtir duas vezes não cria duas linhas.
    __table_args__ = (UniqueConstraint("user_id", "comentario_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    comentario_id: Mapped[int] = mapped_column(ForeignKey("comments.id"), index=True)
    created_at: Mapped[CriadoEm]
