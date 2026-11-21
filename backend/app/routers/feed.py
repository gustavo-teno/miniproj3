"""Feed cronológico de quem você segue (#16, Pessoa D).

Rotas previstas:
- GET /feed?offset=&limit= (testes do núcleo)
"""

from fastapi import APIRouter

router = APIRouter(prefix="/feed", tags=["feed"])
