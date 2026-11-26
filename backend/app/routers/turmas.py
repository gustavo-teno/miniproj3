"""Turmas formadas pela meta (#17, Pessoa D). Listas em app/constantes.py.

Rotas (todas pedem login, como o resto da rede):
- GET /turmas: as turmas de quem está vendo e as listas de vestibulares e de
  cursos, cada turma com o número de pessoas e quantas estudaram hoje.
- GET /turmas/{tipo}/{chave}: o topo da página de uma turma.
  Ex.: /turmas/vestibular/enem, /turmas/curso/outro ("Outros cursos").
- GET /turmas/{tipo}/{chave}/membros: a aba Chamada, paginada.
- GET /turmas/{tipo}/{chave}/posts?tag=: a aba Posts, no formato PostOut,
  com filtro opcional por matéria.

As regras ficam em services/turmas.py.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.constantes import TAGS
from app.db import get_db
from app.deps import get_current_user
from app.models.user import User
from app.schemas.user import PostPage
from app.schemas.turmas import MembroPage, TipoTurma, TurmaOut, TurmasOut
from app.services import turmas as service

router = APIRouter(prefix="/turmas", tags=["turmas"])


@router.get("", response_model=TurmasOut)
def listar_turmas(
    eu: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.listar(db, eu)


@router.get("/{tipo}/{chave}", response_model=TurmaOut)
def ver_turma(
    tipo: TipoTurma,
    chave: str,
    _eu: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.ver(db, tipo, chave)


@router.get("/{tipo}/{chave}/membros", response_model=MembroPage)
def membros_da_turma(
    tipo: TipoTurma,
    chave: str,
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100),
    eu: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    pessoas, total = service.membros(db, eu, tipo, chave, offset, limit)
    return MembroPage(items=pessoas, total=total, offset=offset, limit=limit)


@router.get("/{tipo}/{chave}/posts", response_model=PostPage)
def posts_da_turma(
    tipo: TipoTurma,
    chave: str,
    # Filtro por matéria; sem tag, todos os posts dos membros.
    tag: str | None = None,
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    eu: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if tag is not None and tag not in TAGS:
        raise HTTPException(status_code=422, detail="Matéria desconhecida.")
    lista, total = service.posts(db, eu, tipo, chave, tag, offset, limit)
    return PostPage(items=lista, total=total, offset=offset, limit=limit)
