from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class Leitura(Base):
    """Até qual mensagem cada pessoa já leu em cada conversa (as não lidas das
    DMs, decisão 6). Uma linha por pessoa e conversa; abrir a conversa avança
    a marca. Fica numa tabela própria, e não numa coluna da Mensagem, porque
    tabela nova o create_all cria sozinho: ninguém precisa apagar o banco."""

    __tablename__ = "leituras"
    __table_args__ = (UniqueConstraint("leitor_id", "outro_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    # Quem leu e com quem é a conversa.
    leitor_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    outro_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    # O id da última mensagem lida. Os ids só crescem, então "não lida" é
    # toda mensagem da outra pessoa com id maior que este.
    ultima_lida_id: Mapped[int] = mapped_column(default=0)
