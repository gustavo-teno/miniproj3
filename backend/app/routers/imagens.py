"""Imagem nos posts (#105, Pessoa A). As regras ficam em services/imagens.py.

Rotas:
- PUT /posts/{id}/imagem: anexa ou troca a imagem. O corpo é o próprio
  arquivo (Content-Type image/jpeg, image/png ou image/webp), sem formulário,
  então o backend não precisa de nenhuma biblioteca nova. Responde 204.
- DELETE /posts/{id}/imagem: tira a imagem. Idempotente, 204.
- GET /posts/{id}/imagem: a imagem. Pede login, como o resto dos posts: a
  tela busca com o token e mostra o resultado.

Se o post tem imagem vem no próprio post (PostOut.tem_imagem).
"""

from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user
from app.models.user import User
from app.services import imagens as service

router = APIRouter(prefix="/posts", tags=["imagens"])


@router.put("/{post_id}/imagem", status_code=204)
async def anexar_imagem(
    post_id: int,
    request: Request,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service.guardar(db, user, post_id, await request.body())
    return Response(status_code=204)


@router.delete("/{post_id}/imagem", status_code=204)
def tirar_imagem(
    post_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service.tirar(db, user, post_id)
    return Response(status_code=204)


@router.get("/{post_id}/imagem")
def ver_imagem(
    post_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    imagem = service.ler(db, post_id)
    # private: só o navegador de quem pediu guarda, nunca um cache no caminho.
    # nosniff: o navegador usa o tipo que mandamos e não tenta adivinhar outro.
    return Response(
        content=imagem.dados,
        media_type=imagem.tipo,
        headers={"Cache-Control": "private, max-age=300", "X-Content-Type-Options": "nosniff"},
    )
