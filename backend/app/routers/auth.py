"""Auth (#6, Pessoa A): cadastro, login e sair. Guia 01, Passos 1 a 3.

Rotas previstas:
- POST /auth/registro, POST /auth/login, GET /auth/eu (testes do núcleo)
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas.auth import RegistroIn
from app.schemas.user import UserOut
from app.services import auth as service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/registro", response_model=UserOut, status_code=201)
def registro(dados: RegistroIn, db: Session = Depends(get_db)):
    return service.registrar(db, dados)
