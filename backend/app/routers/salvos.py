"""Posts salvos (#64, Pessoa A). As regras ficam em services/salvos.py.

Rotas:
- POST/DELETE /posts/{id}/salvar: salvar e tirar dos salvos. Idempotentes,
  respondem 204, como o curtir.
- GET /salvos?offset=&limit=: os posts que você salvou, paginados. Só você vê
  os seus: a rota não recebe username.
"""

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user
from app.models.user import User
from app.schemas.salvo import PostsSalvos
from app.services import salvos as service

# Sem prefixo: as rotas de salvar ficam junto do post (/posts/{id}/salvar) e a
# lista tem endereço próprio (/salvos).
router = APIRouter(tags=["salvos"])


@router.post("/posts/{post_id}/salvar", status_code=204)
def salvar(
    post_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service.salvar(db, user, post_id)
    return Response(status_code=204)


@router.delete("/posts/{post_id}/salvar", status_code=204)
def tirar(
    post_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service.tirar(db, user, post_id)
    return Response(status_code=204)


@router.get("/salvos", response_model=PostsSalvos)
def listar(
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    itens, total = service.listar(db, user, offset, limit)
    return PostsSalvos(items=itens, total=total, offset=offset, limit=limit)
