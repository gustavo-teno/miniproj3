from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String, func, select
from sqlalchemy.orm import Mapped, column_property, mapped_column, relationship

from app.constantes import TAG_PADRAO
from app.db import Base, CriadoEm
from app.models.comment import Comment
from app.models.like import Like

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
    # Quantas curtidas o post tem (#11, Pessoa C). Não é uma coluna da tabela:
    # é uma contagem calculada na mesma consulta que busca o post, então o
    # PostOut lê o número sozinho e ele nunca fica desatualizado.
    curtidas: Mapped[int] = column_property(
        select(func.count(Like.id))
        .where(Like.post_id == id)
        .correlate_except(Like)
        .scalar_subquery()
    )
    # Quantos comentários o post tem (#12, Pessoa C), do mesmo jeito.
    comentarios: Mapped[int] = column_property(
        select(func.count(Comment.id))
        .where(Comment.post_id == id)
        .correlate_except(Comment)
        .scalar_subquery()
    )
