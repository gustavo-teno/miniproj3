"""Comentários (#12, Pessoa C). Divide o prefixo /posts com posts.py.

Rotas: POST/GET /posts/{id}/comentarios (testes do núcleo). Comentários são
planos (sem respostas) e saem em ordem cronológica, paginados. O número de
comentários vem no próprio post (PostOut).
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user
from app.models.user import User
from app.schemas.comentario import ComentarioCriar, ComentarioOut, ComentarioPage
from app.services import comentarios as service

router = APIRouter(prefix="/posts", tags=["comentarios"])


@router.post("/{post_id}/comentarios", response_model=ComentarioOut, status_code=201)
def comentar(
    post_id: int,
    dados: ComentarioCriar,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.criar(db, user, post_id, dados)


@router.get("/{post_id}/comentarios", response_model=ComentarioPage)
def listar_comentarios(
    post_id: int,
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    # Não é usado aqui dentro: está só para exigir login, como em posts.py.
    _user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    comentarios, total = service.listar(db, post_id, offset, limit)
    return ComentarioPage(items=comentarios, total=total, offset=offset, limit=limit)
