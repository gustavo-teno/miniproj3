"""Curtidas (#11, Pessoa C). Divide o prefixo /posts com posts.py.

Rotas: POST/DELETE /posts/{id}/curtir (testes do núcleo). As duas são
idempotentes e respondem 204. O número de curtidas e o "eu curti?" vêm no
próprio post (PostOut).
"""

from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user
from app.models.user import User
from app.services import curtidas as service

router = APIRouter(prefix="/posts", tags=["curtidas"])


@router.post("/{post_id}/curtir", status_code=204)
def curtir(
    post_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service.curtir(db, user, post_id)
    return Response(status_code=204)


@router.delete("/{post_id}/curtir", status_code=204)
def descurtir(
    post_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service.descurtir(db, user, post_id)
    return Response(status_code=204)
