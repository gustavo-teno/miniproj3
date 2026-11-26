"""Comentários (#12, Pessoa C). Divide o prefixo /posts com posts.py.

Rotas:
- POST/GET /posts/{id}/comentarios (testes do núcleo). O GET pagina os
  comentários diretos no post, em ordem cronológica, e cada um traz as
  respostas dentro (comentários em árvore, CONTRATO.md). O POST aceita
  `parent_id` para responder a um comentário do mesmo post.
- GET /posts/{id}/comentarios/{comentario_id}: um comentário com toda a árvore
  de respostas dele (a tela "Ver conversa").
- POST/DELETE /posts/{id}/comentarios/{comentario_id}/curtir: curtir um
  comentário, como se curte um post.
O número de comentários (com as respostas) vem no próprio post (PostOut).
"""

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user
from app.models.user import User
from app.schemas.comentario import ComentarioCriar, ComentarioOut, ComentarioPage
from app.services import comentarios as service

router = APIRouter(prefix="/posts", tags=["comentarios"])


@router.post("/{post_id}/comentarios", response_model=ComentarioOut, status_code=201)
def comentar(
    post_id: int,
    dados: ComentarioCriar,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.criar(db, user, post_id, dados)


@router.get("/{post_id}/comentarios", response_model=ComentarioPage)
def listar_comentarios(
    post_id: int,
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    comentarios, total, total_com_respostas = service.listar(db, user, post_id, offset, limit)
    return ComentarioPage(
        items=comentarios,
        total=total,
        offset=offset,
        limit=limit,
        total_com_respostas=total_com_respostas,
    )


@router.get("/{post_id}/comentarios/{comentario_id}", response_model=ComentarioOut)
def ver_conversa(
    post_id: int,
    comentario_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.conversa(db, user, post_id, comentario_id)


@router.post("/{post_id}/comentarios/{comentario_id}/curtir", status_code=204)
def curtir_comentario(
    post_id: int,
    comentario_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service.curtir(db, user, post_id, comentario_id)
    return Response(status_code=204)


@router.delete("/{post_id}/comentarios/{comentario_id}/curtir", status_code=204)
def descurtir_comentario(
    post_id: int,
    comentario_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service.descurtir(db, user, post_id, comentario_id)
    return Response(status_code=204)
