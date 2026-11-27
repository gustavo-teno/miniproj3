from sqlalchemy import ForeignKey, LargeBinary, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base, CriadoEm


class ImagemPost(Base):
    """A imagem de um post de matéria (#105, Pessoa A): o caderno, o mapa
    mental, a lista resolvida. Uma por post.

    Os bytes ficam no banco, e não em disco, porque o disco do Render zera a
    cada reinício. A tela reduz a imagem antes de mandar (uns 300 KB), então o
    banco não incha. Fica numa tabela própria, e não numa coluna do Post, por
    dois motivos: o create_all cria tabela nova sozinho (ninguém precisa apagar
    o banco), e o feed não carrega os bytes junto com cada post."""

    __tablename__ = "imagens_post"

    id: Mapped[int] = mapped_column(primary_key=True)
    post_id: Mapped[int] = mapped_column(ForeignKey("posts.id"), unique=True)
    dados: Mapped[bytes] = mapped_column(LargeBinary)
    # O formato, descoberto pelos primeiros bytes: image/jpeg, image/png ou image/webp.
    tipo: Mapped[str] = mapped_column(String(20))
    created_at: Mapped[CriadoEm]
