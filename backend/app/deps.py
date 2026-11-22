"""Dependências compartilhadas dos endpoints.

get_current_user é a porta de entrada da autenticação: toda rota protegida
declara `user: User = Depends(get_current_user)`.
"""

import os

from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session as DbSession

from app.db import get_db
from app.models.session import Session
from app.models.user import User


def get_current_user(
    authorization: str | None = Header(default=None),
    x_user_id: int | None = Header(default=None),
    db: DbSession = Depends(get_db),
) -> User:
    # Bypass de DESENVOLVIMENTO (guia 01, Passo 0): só funciona com DEBUG=true.
    # O header X-User-Id diz "finja que sou o usuário N", e assim todo mundo
    # trabalha antes da auth existir. Em produção não há DEBUG: sem a auth
    # real, rota protegida dá 401.
    if os.environ.get("DEBUG") == "true" and x_user_id is not None:
        user = db.get(User, x_user_id)
        if user:
            return user

    # A auth real (Passo 3): o token que o login entregou, no formato
    # "Authorization: Bearer <token>". Se ele está na tabela sessions, a
    # request é de quem fez aquele login.
    token = token_do_header(authorization)
    if token:
        sessao = db.get(Session, token)
        if sessao:
            return db.get(User, sessao.user_id)
    raise HTTPException(status_code=401, detail="não autenticado")


def token_do_header(authorization: str | None) -> str | None:
    """Tira o token de "Bearer <token>". Qualquer outro formato vira None."""
    if authorization and authorization.startswith("Bearer "):
        return authorization.removeprefix("Bearer ").strip() or None
    return None
