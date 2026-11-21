"""Follow (#15, Pessoa D). Divide o prefixo /usuarios com users.py.

Rotas previstas:
- POST/DELETE /usuarios/{username}/follow (testes do núcleo)
"""

from fastapi import APIRouter

router = APIRouter(prefix="/usuarios", tags=["follows"])
