import os
from datetime import datetime, timezone
from typing import Annotated

from sqlalchemy import DateTime, create_engine, event
from sqlalchemy.orm import DeclarativeBase, Session, mapped_column, sessionmaker
from sqlalchemy.types import TypeDecorator

from app.core.texto import sem_acento

# SQLite local, zero setup. O arquivo app.db NUNCA vai para o git (.gitignore).
# Os testes apontam DATABASE_URL para um banco descartável (ver tests/conftest.py).
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./app.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


@event.listens_for(engine, "connect")
def _funcoes_da_busca(conexao, _registro) -> None:
    """Ensina o SQLite a comparar sem acento (#38): a busca usa
    sem_acento(coluna) LIKE ..., e o SQLite sozinho só sabe tirar maiúscula
    das letras sem acento. Vale para toda conexão que o engine abrir."""
    conexao.create_function("sem_acento", 1, sem_acento, deterministic=True)


class Base(DeclarativeBase):
    pass


class DataHoraUTC(TypeDecorator):
    """Data e hora sempre em UTC e com o fuso marcado.

    O SQLite não guarda o fuso: a hora gravada em UTC voltava sem ele, e o
    navegador a lia como horário local (3 h de diferença no Brasil, #28).
    Na ida, converte para UTC; na volta, marca que é UTC.
    """

    impl = DateTime
    cache_ok = True

    def process_bind_param(self, valor: datetime | None, dialect) -> datetime | None:
        if valor is not None and valor.tzinfo is not None:
            valor = valor.astimezone(timezone.utc).replace(tzinfo=None)
        return valor

    def process_result_value(self, valor: datetime | None, dialect) -> datetime | None:
        if valor is not None:
            valor = valor.replace(tzinfo=timezone.utc)
        return valor


def agora_utc() -> datetime:
    return datetime.now(timezone.utc)


# O created_at de todas as tabelas: o momento em que a linha foi criada.
# Nos models: created_at: Mapped[CriadoEm]
CriadoEm = Annotated[datetime, mapped_column(DataHoraUTC, default=agora_utc)]


def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
