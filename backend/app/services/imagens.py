"""Regras da imagem nos posts (#105, Pessoa A). O router só recebe a chamada
e chama daqui.

Regras:
- Uma imagem por post. Mandar outra troca a anterior.
- Só o autor anexa ou tira (403 para os outros), como editar o post.
- Só post de matéria: bate-papo não leva imagem (422). A imagem é o registro
  do estudo (o caderno, a lista resolvida), não vitrine (decisão 1).
- Só JPEG, PNG ou WebP, reconhecidos pelos primeiros bytes do arquivo, e não
  pelo nome nem pelo que o navegador diz (415 para o resto).
- No máximo 600 KB (413). A tela reduz antes de mandar (uns 300 KB); o limite
  tem folga para não recusar uma foto que ficou um pouco maior.
- Apagar o post apaga a imagem junto (services/posts.py).
"""

from fastapi import HTTPException
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.constantes import TAG_PADRAO
from app.models.imagem_post import ImagemPost
from app.models.user import User
from app.services.posts import buscar

TAMANHO_MAXIMO = 600 * 1024


def _formato(dados: bytes) -> str | None:
    """O formato da imagem pelos primeiros bytes ("assinatura" do arquivo)."""
    if dados.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if dados.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if dados[:4] == b"RIFF" and dados[8:12] == b"WEBP":
        return "image/webp"
    return None


def guardar(db: Session, user: User, post_id: int, dados: bytes) -> None:
    post = buscar(db, post_id)  # 404 se o post não existe
    if post.autor_id != user.id:
        raise HTTPException(status_code=403, detail="só o autor mexe no post")
    if post.tag == TAG_PADRAO:
        raise HTTPException(status_code=422, detail="post de bate-papo não leva imagem")
    if not dados:
        raise HTTPException(status_code=422, detail="a imagem veio vazia")
    if len(dados) > TAMANHO_MAXIMO:
        raise HTTPException(status_code=413, detail="a imagem passa de 600 KB")
    tipo = _formato(dados)
    if tipo is None:
        raise HTTPException(status_code=415, detail="a imagem precisa ser JPEG, PNG ou WebP")

    imagem = db.scalar(select(ImagemPost).where(ImagemPost.post_id == post_id))
    if imagem is None:
        db.add(ImagemPost(post_id=post_id, dados=dados, tipo=tipo))
    else:
        imagem.dados, imagem.tipo = dados, tipo
    db.commit()


def tirar(db: Session, user: User, post_id: int) -> None:
    """Idempotente: tirar de um post sem imagem também responde 204."""
    post = buscar(db, post_id)
    if post.autor_id != user.id:
        raise HTTPException(status_code=403, detail="só o autor mexe no post")
    db.execute(delete(ImagemPost).where(ImagemPost.post_id == post_id))
    db.commit()


def ler(db: Session, post_id: int) -> ImagemPost:
    buscar(db, post_id)
    imagem = db.scalar(select(ImagemPost).where(ImagemPost.post_id == post_id))
    if imagem is None:
        raise HTTPException(status_code=404, detail="o post não tem imagem")
    return imagem
