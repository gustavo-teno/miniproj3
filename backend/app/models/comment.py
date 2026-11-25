from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base, CriadoEm

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
    texto: Mapped[str] = mapped_column(String(500))
    created_at: Mapped[CriadoEm]
