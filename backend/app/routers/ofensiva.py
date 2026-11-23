"""Ofensiva que perdoa (#7, Pessoa A). O cálculo fica em app/core/ofensiva.py
e a busca no banco em app/services/ofensiva.py.

Rota: GET /usuarios/{username}/ofensiva. Divide o prefixo /usuarios com
users.py (B) e follows.py (D).
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user
from app.models.user import User
from app.schemas.ofensiva import OfensivaOut
from app.services import ofensiva as service

router = APIRouter(prefix="/usuarios", tags=["ofensiva"])


@router.get("/{username}/ofensiva", response_model=OfensivaOut)
def ver_ofensiva(
    username: str,
    # Só para exigir login, como em GET /posts/{id}.
    _user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.da_pessoa(db, username)
