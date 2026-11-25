"""Follow (#15, Pessoa D). Divide o prefixo /usuarios com users.py.

Rotas:
- POST/DELETE /usuarios/{username}/follow (testes do núcleo): seguir e deixar
  de seguir, idempotentes, respondem 204.
- GET /usuarios/{username}/follow: o estado do botão de seguir (se eu sigo
  essa pessoa e quantos seguidores ela tem).

Os contadores do perfil (seguidores e seguindo) ficam no GET /usuarios/{username}
da Pessoa B, que usa as funções de contagem de services/follows.py.
"""

from fastapi import APIRouter, Depends, Response
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user
from app.models.user import User
from app.services import follows as service

router = APIRouter(prefix="/usuarios", tags=["follows"])


class EstadoFollow(BaseModel):
    """O que o <BotaoSeguir> precisa para se desenhar."""

    seguindo: bool  # eu sigo essa pessoa?
    seguidores: int  # quantas pessoas seguem essa pessoa
    eu_mesmo: bool  # é o meu próprio perfil? (aí o botão não aparece)


@router.get("/{username}/follow", response_model=EstadoFollow)
def estado_follow(
    username: str,
    eu: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    alvo = service.buscar_alvo(db, username)
    return EstadoFollow(
        seguindo=service.segue(db, eu.id, alvo.id),
        seguidores=service.contar_seguidores(db, alvo.id),
        eu_mesmo=alvo.id == eu.id,
    )


@router.post("/{username}/follow", status_code=204)
def seguir(
    username: str,
    eu: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service.seguir(db, eu, username)
    # 204: deu certo e não há corpo para devolver.
    return Response(status_code=204)


@router.delete("/{username}/follow", status_code=204)
def deixar_de_seguir(
    username: str,
    eu: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service.deixar_de_seguir(db, eu, username)
    return Response(status_code=204)
