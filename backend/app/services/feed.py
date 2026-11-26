"""Regras do feed (#16, Pessoa D). O router só recebe a chamada e chama daqui.

Decisão 3: cronológico, só de quem você segue, sem algoritmo. Os filtros são
os do rascunho da Camila (/rascunho-feed): matérias marcadas e "Esconder
bate-papo". O bate-papo não é matéria, então só o "Esconder" decide se ele
aparece, qualquer que seja a matéria marcada.
"""

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.constantes import TAG_PADRAO
from app.models.follow import Follow
from app.models.post import Post
from app.models.user import User
from app.services.listagem import pagina_de_posts


def listar(
    db: Session,
    eu: User,
    materias: list[str],
    esconder_bate_papo: bool,
    offset: int,
    limit: int,
) -> tuple[list[Post], int]:
    """Os posts de quem eu sigo, do mais novo para o mais antigo."""
    quem_eu_sigo = select(Follow.seguido_id).where(Follow.seguidor_id == eu.id)
    filtro = [Post.autor_id.in_(quem_eu_sigo)]

    # A matéria só filtra os posts de matéria; o bate-papo segue o "Esconder".
    materia_ok = Post.tag.in_(materias) if materias else Post.tag != TAG_PADRAO
    if esconder_bate_papo:
        filtro.append(materia_ok)
    else:
        filtro.append(or_(Post.tag == TAG_PADRAO, materia_ok))

    return pagina_de_posts(db, eu, filtro, offset, limit)
