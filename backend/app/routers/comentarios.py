"""Comentários (#12, Pessoa C). Divide o prefixo /posts com posts.py.

Rotas previstas:
- POST/GET /posts/{id}/comentarios (testes do núcleo)
"""

from fastapi import APIRouter

router = APIRouter(prefix="/posts", tags=["comentarios"])
