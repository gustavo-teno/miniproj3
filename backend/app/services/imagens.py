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
- Apagar o post, ou trocar a tag dele para bate-papo, tira a imagem junto
  (services/posts.py).
- A largura e a altura são lidas do cabeçalho do arquivo ao guardar (#127),
  para a tela reservar o espaço da foto no formato dela.
"""

import struct

from fastapi import HTTPException
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.constantes import TAG_PADRAO
from app.models.imagem_post import ImagemPost
from app.models.user import User
from app.services.posts import buscar

TAMANHO_MAXIMO = 600 * 1024


def formato(dados: bytes) -> str | None:
    """O formato da imagem pelos primeiros bytes ("assinatura" do arquivo)."""
    if dados.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if dados.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if dados[:4] == b"RIFF" and dados[8:12] == b"WEBP":
        return "image/webp"
    return None


# Marcadores do JPEG que trazem o tamanho da imagem (os "SOF", início do
# quadro). C4, C8 e CC ficam na mesma faixa, mas são outras coisas.
_SOF = set(range(0xC0, 0xD0)) - {0xC4, 0xC8, 0xCC}


def dimensoes(dados: bytes) -> tuple[int, int] | None:
    """(largura, altura) em pixels, lidas do cabeçalho, sem abrir a imagem.

    PNG: o tamanho está num lugar fixo, logo no começo. JPEG: o arquivo é uma
    fila de blocos (marcador FF xx + tamanho do bloco), e pulamos de bloco em
    bloco até o SOF. WebP, ou um arquivo que não dá para ler, volta None, e a
    tela usa a caixa 4:3 (a tela sempre manda JPEG; o WebP só chegaria por
    outro cliente). A orientação do EXIF não é lida: a foto reduzida na tela
    já sai de pé, e as do seed não giram.

    Custo: O(B) no pior caso, em que B são os blocos antes do SOF (poucos).
    """
    try:
        if dados.startswith(b"\x89PNG\r\n\x1a\n"):
            # Assinatura (8 bytes), tamanho do bloco IHDR (4) e nome dele (4).
            largura, altura = struct.unpack(">II", dados[16:24])
        elif dados.startswith(b"\xff\xd8"):
            i = 2
            while True:
                if dados[i] != 0xFF:
                    return None
                marcador = dados[i + 1]
                if marcador == 0xFF:  # enchimento antes do marcador
                    i += 1
                    continue
                if marcador in _SOF:
                    # Depois do marcador: tamanho do bloco (2), precisão (1),
                    # altura (2) e largura (2).
                    altura, largura = struct.unpack(">HH", dados[i + 5 : i + 9])
                    break
                (tamanho,) = struct.unpack(">H", dados[i + 2 : i + 4])
                i += 2 + tamanho
        else:
            return None
    except (IndexError, struct.error):  # arquivo cortado no meio do cabeçalho
        return None
    return (largura, altura) if largura and altura else None


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
    tipo = formato(dados)
    if tipo is None:
        raise HTTPException(status_code=415, detail="a imagem precisa ser JPEG, PNG ou WebP")

    largura, altura = dimensoes(dados) or (None, None)
    imagem = db.scalar(select(ImagemPost).where(ImagemPost.post_id == post_id))
    if imagem is None:
        imagem = ImagemPost(post_id=post_id)
        db.add(imagem)
    imagem.dados, imagem.tipo = dados, tipo
    imagem.largura, imagem.altura = largura, altura
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
