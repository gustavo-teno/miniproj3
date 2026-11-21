"""Dependências compartilhadas dos endpoints.

get_current_user é a porta de entrada da autenticação: toda rota protegida
declara `user: User = Depends(get_current_user)`.
"""

import os

from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.user import User


def get_current_user(
    x_user_id: int | None = Header(default=None),
    db: Session = Depends(get_db),
) -> User:
    # Bypass de DESENVOLVIMENTO (guia 01, Passo 0): só funciona com DEBUG=true.
    # O header X-User-Id diz "finja que sou o usuário N", e assim todo mundo
    # trabalha antes da auth existir. Em produção não há DEBUG: sem a auth
    # real, rota protegida dá 401. A auth real (Passo 3) entra abaixo do if.
    if os.environ.get("DEBUG") == "true" and x_user_id is not None:
        user = db.get(User, x_user_id)
        if user:
            return user
    raise HTTPException(status_code=401, detail="não autenticado")
