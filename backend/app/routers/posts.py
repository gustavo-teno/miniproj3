"""Posts com tag e duração (#9, Pessoa B).

Rotas: POST /posts e GET/PATCH/DELETE /posts/{id} (testes do núcleo). As regras
(só o autor mexe, apagar junto curtidas e comentários) ficam em services/posts.py.
"""

from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user
from app.models.user import User
from app.schemas.post import PostCriar, PostEditar, PostOut
from app.services import curtidas, salvos
from app.services import posts as service

router = APIRouter(prefix="/posts", tags=["posts"])


@router.post("", response_model=PostOut, status_code=201)
def criar_post(
    dados: PostCriar,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.criar(db, user, dados)


@router.get("/{post_id}", response_model=PostOut)
def ver_post(
    post_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = service.buscar(db, post_id)
    curtidas.marcar_curtidos(db, user, [post])
    salvos.marcar_salvos(db, user, [post])
    return post


@router.patch("/{post_id}", response_model=PostOut)
def editar_post(
    post_id: int,
    dados: PostEditar,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = service.editar(db, user, post_id, dados)
    curtidas.marcar_curtidos(db, user, [post])
    salvos.marcar_salvos(db, user, [post])
    return post


@router.delete("/{post_id}", status_code=204)
def apagar_post(
    post_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service.apagar(db, user, post_id)
    # 204 quer dizer "deu certo e não há nada para devolver".
    return Response(status_code=204)
