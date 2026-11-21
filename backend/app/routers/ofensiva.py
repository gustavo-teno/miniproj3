"""Ofensiva que perdoa (#7, Pessoa A). O cálculo fica em app/core/.

Rotas previstas:
- GET /usuarios/{username}/ofensiva (sugestão do plano)
"""

from fastapi import APIRouter

router = APIRouter(prefix="/usuarios", tags=["ofensiva"])
