"""Feed cronológico de quem você segue (#16, Pessoa D).

Rota:
- GET /feed?offset=&limit= (testes do núcleo), com os filtros opcionais
  ?tag=matematica&tag=fisica (uma ou mais matérias) e ?esconder_bate_papo=true.

As regras ficam em services/feed.py.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.constantes import TAG_PADRAO, TAGS
from app.db import get_db
from app.deps import get_current_user
from app.models.user import User
from app.schemas.user import PostPage
from app.services import feed as service

router = APIRouter(prefix="/feed", tags=["feed"])


@router.get("", response_model=PostPage)
def ver_feed(
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    # Repetido na URL para várias matérias: ?tag=matematica&tag=fisica.
    # Sem nenhum, todas as matérias.
    tag: list[str] = Query(default=[]),
    esconder_bate_papo: bool = False,
    eu: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    for t in tag:
        # O bate-papo não é matéria: quem decide se ele aparece é o
        # esconder_bate_papo.
        if t not in TAGS or t == TAG_PADRAO:
            raise HTTPException(status_code=422, detail="Matéria desconhecida.")
    posts, total = service.listar(db, eu, tag, esconder_bate_papo, offset, limit)
    return PostPage(items=posts, total=total, offset=offset, limit=limit)
