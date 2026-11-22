"""Auth (#6, Pessoa A): cadastro, login e sair. Guia 01, Passos 1 a 3.

Rotas previstas:
- POST /auth/registro, POST /auth/login, GET /auth/eu (testes do núcleo)
- POST /auth/logout: apaga a sessão do token enviado
"""

from fastapi import APIRouter, Depends
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import bearer, get_current_user
from app.models.user import User
from app.schemas.auth import LoginIn, RegistroIn, TokenOut
from app.schemas.user import UserOut
from app.services import auth as service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/registro", response_model=UserOut, status_code=201)
def registro(dados: RegistroIn, db: Session = Depends(get_db)):
    return service.registrar(db, dados)


@router.post("/login", response_model=TokenOut)
def login(dados: LoginIn, db: Session = Depends(get_db)):
    return TokenOut(token=service.login(db, dados))


@router.get("/eu", response_model=UserOut)
def eu(user: User = Depends(get_current_user)):
    return user


@router.post("/logout", status_code=204)
def logout(
    credenciais: HTTPAuthorizationCredentials | None = Depends(bearer),
    _user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Com o bypass de DEBUG não há token: não há sessão a apagar.
    if credenciais:
        service.logout(db, credenciais.credentials)
