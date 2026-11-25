"""DMs entre mútuos (#18, decisão 6, Pessoa A). As regras ficam em
services/dms.py.

Rotas:
- GET /dms: as conversas, com a última mensagem e as não lidas.
- GET /dms/nao-lidas: o total, para o número na aba Mensagens.
- GET /dms/{username}: a conversa (?depois_de=<id> traz só as novas).
- POST /dms/{username}: manda uma mensagem (403 se não forem mútuos).

/dms/nao-lidas nunca vira conversa com alguém: nome de usuário não tem hífen.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user
from app.models.user import User
from app.schemas.dm import (
    ConversaAberta,
    ConversaOut,
    MensagemCriar,
    MensagemOut,
    NaoLidasOut,
)
from app.services import dms as service

router = APIRouter(prefix="/dms", tags=["dms"])


@router.get("", response_model=list[ConversaOut])
def listar_conversas(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.conversas(db, user)


@router.get("/nao-lidas", response_model=NaoLidasOut)
def contar_nao_lidas(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return NaoLidasOut(total=service.total_nao_lidas(db, user))


@router.get("/{username}", response_model=ConversaAberta)
def abrir_conversa(
    username: str,
    # O id da última mensagem que a tela já tem: vêm só as mais novas.
    depois_de: int | None = Query(default=None, ge=0),
    limite: int = Query(default=50, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.abrir_conversa(db, user, username, depois_de, limite)


@router.post("/{username}", response_model=MensagemOut, status_code=201)
def enviar_mensagem(
    username: str,
    dados: MensagemCriar,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.enviar(db, user, username, dados)
