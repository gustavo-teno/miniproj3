from sqlalchemy import ForeignKey, LargeBinary, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base, CriadoEm


class ImagemPost(Base):
    """A imagem de um post de matéria (#105, Pessoa A): o caderno, o mapa
    mental, a lista resolvida. Uma por post.

    Os bytes ficam no banco, e não em disco, porque o disco do Render zera a
    cada reinício. A tela reduz a imagem antes de mandar (uns 300 KB), então o
    banco não incha. Fica numa tabela própria, e não numa coluna do Post, para
    o feed não carregar os bytes junto com cada post.

    A largura e a altura entraram depois (#127): o create_all não acrescenta
    coluna em tabela que já existe, então um banco local criado antes precisa
    ser apagado e refeito (rm backend/app.db && make seed)."""

    __tablename__ = "imagens_post"

    id: Mapped[int] = mapped_column(primary_key=True)
    post_id: Mapped[int] = mapped_column(ForeignKey("posts.id"), unique=True)
    dados: Mapped[bytes] = mapped_column(LargeBinary)
    # O formato, descoberto pelos primeiros bytes: image/jpeg, image/png ou image/webp.
    tipo: Mapped[str] = mapped_column(String(20))
    # Em pixels, lidas do cabeçalho do arquivo ao guardar (services/imagens.py).
    # A tela usa para montar a caixa da foto no formato dela antes de a foto
    # chegar (#127). None quando não deu para ler: a caixa fica em 4:3.
    largura: Mapped[int | None]
    altura: Mapped[int | None]
    created_at: Mapped[CriadoEm]
