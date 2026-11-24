"""Regras dos comentários (#12, Pessoa C). O router só recebe a chamada e chama daqui."""

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.comment import Comment
from app.models.user import User
from app.schemas.comentario import ComentarioCriar
from app.services.posts import buscar


def criar(db: Session, user: User, post_id: int, dados: ComentarioCriar) -> Comment:
    buscar(db, post_id)  # 404 se o post não existe
    comentario = Comment(autor_id=user.id, post_id=post_id, texto=dados.texto)
    db.add(comentario)
    db.commit()
    db.refresh(comentario)
    return comentario


def listar(db: Session, post_id: int, offset: int, limit: int) -> tuple[list[Comment], int]:
    """Comentários planos (sem respostas), do mais antigo para o mais novo,
    para a conversa ser lida de cima para baixo."""
    buscar(db, post_id)
    do_post = Comment.post_id == post_id
    total = db.scalar(select(func.count()).select_from(Comment).where(do_post)) or 0
    # O id desempata comentários criados no mesmo instante.
    consulta = (
        select(Comment)
        .where(do_post)
        .order_by(Comment.created_at, Comment.id)
        .offset(offset)
        .limit(limit)
    )
    return list(db.scalars(consulta)), total
