"""Busca de pessoas e de posts (#38, Pessoa A).

Compara sem acento e sem maiúscula dos dois lados: sem_acento() no que a
pessoa digitou (aqui) e no texto guardado (dentro do banco, a mesma função
registrada em app/db.py). "calculo" acha "Cálculo" e vice-versa.

Custo: o banco passa por todas as linhas da tabela a cada busca, O(N), porque
um LIKE com % no começo não usa índice. Para uma rede deste tamanho, é rápido;
numa rede grande, seria a hora de um índice de busca de texto (FTS).
"""

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.core.texto import sem_acento
from app.models.post import Post
from app.models.user import User


def _contendo(termo: str) -> str:
    """O padrão do LIKE para "contém o termo". % e _ são curingas no LIKE,
    então os que a pessoa digitou viram texto comum (escapados com \\)."""
    escapado = termo.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
    return f"%{escapado}%"


def _paginar(db: Session, consulta, offset: int, limit: int) -> tuple[list, int]:
    total = db.scalar(select(func.count()).select_from(consulta.subquery())) or 0
    itens = list(db.scalars(consulta.offset(offset).limit(limit)))
    return itens, total


def pessoas(db: Session, q: str, offset: int, limit: int) -> tuple[list[User], int]:
    """Pelo nome ou pelo @, em ordem alfabética do nome."""
    padrao = _contendo(sem_acento(q.strip()))
    consulta = (
        select(User)
        .where(
            or_(
                func.sem_acento(User.name).like(padrao, escape="\\"),
                User.username.like(padrao, escape="\\"),
            )
        )
        .order_by(func.sem_acento(User.name), User.id)
    )
    return _paginar(db, consulta, offset, limit)


def posts(db: Session, q: str, offset: int, limit: int) -> tuple[list[Post], int]:
    """Pelo texto do post, do mais novo para o mais antigo."""
    padrao = _contendo(sem_acento(q.strip()))
    consulta = (
        select(Post)
        .where(func.sem_acento(Post.texto).like(padrao, escape="\\"))
        # id desempata posts do mesmo segundo, para a página não repetir.
        .order_by(Post.created_at.desc(), Post.id.desc())
    )
    return _paginar(db, consulta, offset, limit)
