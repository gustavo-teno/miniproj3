"""Posts com tag e duração (#9, Pessoa B).

Rotas previstas:
- POST /posts, GET/PATCH/DELETE /posts/{id} (testes do núcleo)
"""

from fastapi import APIRouter

router = APIRouter(prefix="/posts", tags=["posts"])
