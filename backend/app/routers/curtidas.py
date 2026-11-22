"""Curtidas (#11, Pessoa C). Divide o prefixo /posts com posts.py.

Rotas previstas:
- POST/DELETE /posts/{id}/curtir (testes do núcleo)
"""

from fastapi import APIRouter

router = APIRouter(prefix="/posts", tags=["curtidas"])
