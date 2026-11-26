from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String, func, select
from sqlalchemy.orm import Mapped, column_property, mapped_column, relationship

from app.db import Base, CriadoEm
from app.models.curtida_comentario import CurtidaComentario

# Só para o editor conhecer o tipo: importar de verdade daria import circular.
if TYPE_CHECKING:
    from app.models.user import User


class Comment(Base):
    __tablename__ = "comments"

    id: Mapped[int] = mapped_column(primary_key=True)
    autor_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    # O autor vem na mesma consulta, como no Post: uma página de 20
    # comentários não faz 20 buscas a mais só para mostrar os nomes.
    autor: Mapped["User"] = relationship(lazy="joined")
    post_id: Mapped[int] = mapped_column(ForeignKey("posts.id"), index=True)
    # A quem este comentário responde (comentários em árvore). Sem pai, é um
    # comentário direto no post, como os do núcleo.
    parent_id: Mapped[int | None] = mapped_column(ForeignKey("comments.id"), index=True, default=None)
    texto: Mapped[str] = mapped_column(String(500))
    created_at: Mapped[CriadoEm]
    # Quantas curtidas o comentário tem: a mesma contagem calculada do Post.
    curtidas: Mapped[int] = column_property(
        select(func.count(CurtidaComentario.id))
        .where(CurtidaComentario.comentario_id == id)
        .correlate_except(CurtidaComentario)
        .scalar_subquery()
    )
