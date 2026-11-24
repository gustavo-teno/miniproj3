"""Busca de pessoas e de posts (#38, Pessoa A). As regras ficam em
services/busca.py.

Rotas: GET /busca/pessoas?q= e GET /busca/posts?q=, paginadas. São duas rotas
(e não uma com ?tipo=) porque cada uma devolve um formato: pessoas no
UserPage e posts no PostOut, que o card do post já sabe mostrar.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user
from app.models.user import User
from app.schemas.busca import ResultadoPosts
from app.schemas.user import UserPage
from app.services import busca as service

router = APIRouter(prefix="/busca", tags=["busca"])

# Com uma letra só, quase tudo bate: a busca começa na segunda.
TERMO = Query(min_length=2, max_length=100, description="o que procurar")


@router.get("/pessoas", response_model=UserPage)
def buscar_pessoas(
    q: str = TERMO,
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    # Só para exigir login, como em GET /posts/{id}.
    _user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    itens, total = service.pessoas(db, q, offset, limit)
    return UserPage(items=itens, total=total, offset=offset, limit=limit)


@router.get("/posts", response_model=ResultadoPosts)
def buscar_posts(
    q: str = TERMO,
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    _user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    itens, total = service.posts(db, q, offset, limit)
    return ResultadoPosts(items=itens, total=total, offset=offset, limit=limit)
