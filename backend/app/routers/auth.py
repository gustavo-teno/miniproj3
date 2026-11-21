"""Auth (#6, Pessoa A): cadastro, login e sair. Guia 01, Passos 1 a 3.

Rotas previstas:
- POST /auth/registro, POST /auth/login, GET /auth/eu (testes do núcleo)
"""

from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["auth"])
