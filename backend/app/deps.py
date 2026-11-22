"""Dependências compartilhadas dos endpoints.

get_current_user é a porta de entrada da autenticação: toda rota protegida
declara `user: User = Depends(get_current_user)`.
"""

import os

from fastapi import Depends, Header, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.user import User
from app.services.auth import usuario_do_token

# Lê "Authorization: Bearer <token>" e liga o botão Authorize do Swagger
# (/docs). auto_error=False: sem token, quem decide o 401 é get_current_user,
# para o bypass de DEBUG continuar valendo.
bearer = HTTPBearer(
    auto_error=False, description="O token que POST /auth/login devolve."
)


def get_current_user(
    credenciais: HTTPAuthorizationCredentials | None = Depends(bearer),
    x_user_id: int | None = Header(default=None),
    db: Session = Depends(get_db),
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
    # "Authorization: Bearer <token>". Quem é o dono dele fica no service.
    if credenciais:
        user = usuario_do_token(db, credenciais.credentials)
        if user:
            return user
    raise HTTPException(status_code=401, detail="não autenticado")
