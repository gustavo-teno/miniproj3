from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.constantes import TAG_PADRAO
from app.db import Base, CriadoEm

# Só para o editor conhecer o tipo: importar de verdade daria import circular.
if TYPE_CHECKING:
    from app.models.user import User


class Post(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(primary_key=True)
    autor_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    # O autor vem junto com o post, na mesma consulta ao banco (lazy="joined"):
    # um feed de 20 posts não faz 20 buscas a mais só para mostrar os nomes.
    autor: Mapped["User"] = relationship(lazy="joined")
    texto: Mapped[str] = mapped_column(String(1000))
    # Padrão bate-papo só na API (os testes do núcleo postam só com texto).
    # Na tela, escolher a tag é obrigatório (decisão 2).
    tag: Mapped[str] = mapped_column(String(20), default=TAG_PADRAO)
    # Duração da sessão de estudo, opcional. Soma no resumo da semana.
    minutos: Mapped[int | None] = mapped_column(default=None)
    created_at: Mapped[CriadoEm]
