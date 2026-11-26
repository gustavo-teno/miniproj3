"""Regras das Turmas (#17, Pessoa D). O router só recebe a chamada e chama daqui.

Uma turma não é uma tabela: ela é formada pela meta do perfil (decisão 5).
Quem tem User.vestibular == "enem" está na turma vestibular/enem; quem tem
User.curso == "medicina", na turma curso/medicina. A lista de turmas é a das
constantes, então toda turma existe, mesmo vazia. Quem não escolheu (campo
vazio) não está em nenhuma turma daquele tipo.
"""

from datetime import datetime, time, timezone

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import InstrumentedAttribute, Session

from app.constantes import CURSOS, TAG_PADRAO, VESTIBULARES
from app.core.ofensiva import BRASILIA, hoje_em_brasilia
from app.models.follow import Follow
from app.models.post import Post
from app.models.user import User
from app.schemas.turmas import TipoTurma, TurmaOut, TurmasOut
from app.services.listagem import pagina_de_posts

# Para cada tipo: a lista de constantes.py, o campo do User que forma a turma e
# o nome da turma "outro".
_TIPOS: dict[str, tuple[dict[str, str], InstrumentedAttribute, str]] = {
    "vestibular": (VESTIBULARES, User.vestibular, "Outros vestibulares"),
    "curso": (CURSOS, User.curso, "Outros cursos"),
}


def _campo(tipo: TipoTurma) -> InstrumentedAttribute:
    return _TIPOS[tipo][1]


def _nome(tipo: TipoTurma, chave: str) -> str:
    lista, _, nome_outro = _TIPOS[tipo]
    return nome_outro if chave == "outro" else lista[chave]


def _conferir(tipo: TipoTurma, chave: str) -> None:
    """404 se a chave não está na lista daquele tipo."""
    if chave not in _TIPOS[tipo][0]:
        raise HTTPException(status_code=404, detail="Turma não encontrada.")


def _inicio_de_hoje() -> datetime:
    """Meia-noite de hoje em Brasília, como instante. O dia é o mesmo da
    ofensiva (core/ofensiva.py), para "estudou hoje" bater nas duas telas."""
    return datetime.combine(hoje_em_brasilia(), time.min, tzinfo=BRASILIA).astimezone(
        timezone.utc
    )


def _estudo_de_hoje():
    """Filtro dos posts que contam como estudo hoje: de matéria e de hoje."""
    return (Post.tag != TAG_PADRAO, Post.created_at >= _inicio_de_hoje())


def _contagens(db: Session, tipo: TipoTurma) -> tuple[dict[str, int], dict[str, int]]:
    """Pessoas e quem estudou hoje em cada turma do tipo, em duas consultas
    para a lista inteira (em vez de duas por turma)."""
    campo = _campo(tipo)
    pessoas = dict(
        db.execute(select(campo, func.count(User.id)).where(campo != "").group_by(campo)).all()
    )
    estudaram = dict(
        db.execute(
            select(campo, func.count(func.distinct(User.id)))
            .join(Post, Post.autor_id == User.id)
            .where(campo != "", *_estudo_de_hoje())
            .group_by(campo)
        ).all()
    )
    return pessoas, estudaram


def _turmas_do_tipo(db: Session, tipo: TipoTurma) -> list[TurmaOut]:
    pessoas, estudaram = _contagens(db, tipo)
    # Na ordem de constantes.py, com "Outro" no fim, como no cadastro.
    return [
        TurmaOut(
            tipo=tipo,
            chave=chave,
            nome=_nome(tipo, chave),
            pessoas=pessoas.get(chave, 0),
            estudaram_hoje=estudaram.get(chave, 0),
        )
        for chave in _TIPOS[tipo][0]
    ]


def listar(db: Session, eu: User) -> TurmasOut:
    vestibulares = _turmas_do_tipo(db, "vestibular")
    cursos = _turmas_do_tipo(db, "curso")
    minhas = [t for t in vestibulares if t.chave == eu.vestibular] + [
        t for t in cursos if t.chave == eu.curso
    ]
    return TurmasOut(minhas=minhas, vestibulares=vestibulares, cursos=cursos)


def ver(db: Session, tipo: TipoTurma, chave: str) -> TurmaOut:
    _conferir(tipo, chave)
    pessoas, estudaram = _contagens(db, tipo)
    return TurmaOut(
        tipo=tipo,
        chave=chave,
        nome=_nome(tipo, chave),
        pessoas=pessoas.get(chave, 0),
        estudaram_hoje=estudaram.get(chave, 0),
    )


def membros(
    db: Session, eu: User, tipo: TipoTurma, chave: str, offset: int, limit: int
) -> tuple[list[User], int]:
    """As pessoas da turma, em ordem de nome, com estudou_hoje e segue_voce."""
    _conferir(tipo, chave)
    filtro = _campo(tipo) == chave
    total = db.scalar(select(func.count(User.id)).where(filtro)) or 0
    pessoas = list(
        db.scalars(
            select(User)
            .where(filtro)
            # username desempata nomes iguais, para a página não repetir ninguém.
            .order_by(User.name, User.username)
            .offset(offset)
            .limit(limit)
        )
    )

    ids = [p.id for p in pessoas]
    if ids:
        # Uma consulta para a página inteira em cada campo, como o marcar_curtidos.
        estudaram = set(
            db.scalars(
                select(Post.autor_id).where(Post.autor_id.in_(ids), *_estudo_de_hoje())
            )
        )
        me_seguem = set(
            db.scalars(
                select(Follow.seguidor_id).where(
                    Follow.seguido_id == eu.id, Follow.seguidor_id.in_(ids)
                )
            )
        )
        for p in pessoas:
            # Atributos soltos no objeto, só para a resposta (o MembroOut os lê).
            p.estudou_hoje = p.id in estudaram
            p.segue_voce = p.id in me_seguem
    return pessoas, total


def posts(
    db: Session,
    eu: User,
    tipo: TipoTurma,
    chave: str,
    tag: str | None,
    offset: int,
    limit: int,
) -> tuple[list[Post], int]:
    """Os posts dos membros, do mais novo para o mais antigo, como o perfil."""
    _conferir(tipo, chave)
    membros_da_turma = select(User.id).where(_campo(tipo) == chave)
    filtro = [Post.autor_id.in_(membros_da_turma)]
    if tag is not None:
        filtro.append(Post.tag == tag)

    return pagina_de_posts(db, eu, filtro, offset, limit)
