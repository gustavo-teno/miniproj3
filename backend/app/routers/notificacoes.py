"""Notificações (#103, Pessoa A). As regras ficam em
services/notificacoes.py.

Rotas:
- GET /notificacoes: as 50 mais recentes, com as novas marcadas. Abrir conta
  como ver tudo: depois dela, o contador zera.
- GET /notificacoes/novas: o número no sino do topo. Só conta, não marca.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user
from app.models.user import User
from app.schemas.notificacao import NotificacaoOut, NovasOut
from app.services import notificacoes as service

router = APIRouter(prefix="/notificacoes", tags=["notificacoes"])


@router.get("", response_model=list[NotificacaoOut])
def listar_notificacoes(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.listar(db, user)


@router.get("/novas", response_model=NovasOut)
def contar_novas(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return NovasOut(total=service.contar_novas(db, user))
