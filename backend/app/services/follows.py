"""Regras do follow (#15, Pessoa D). O router só recebe a chamada e chama daqui.

Seguir e deixar de seguir são idempotentes: repetir a mesma chamada não muda
nada nem dá erro. Assim, um clique duplo no botão não cria follow repetido, e
o botão não precisa saber o estado exato do banco para funcionar.
"""

from fastapi import HTTPException
from sqlalchemy import delete, func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.follow import Follow
from app.models.user import User
from app.services.users import buscar_por_username


def buscar_alvo(db: Session, username: str) -> User:
    """Busca quem vai ser seguido (ou deixado de seguir); 404 se não existe."""
    alvo = buscar_por_username(db, username)
    if alvo is None:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    return alvo


def segue(db: Session, seguidor_id: int, seguido_id: int) -> bool:
    """True se seguidor_id segue seguido_id."""
    return (
        db.scalar(
            select(Follow.id).where(
                Follow.seguidor_id == seguidor_id, Follow.seguido_id == seguido_id
            )
        )
        is not None
    )


def seguir(db: Session, eu: User, username: str) -> None:
    alvo = buscar_alvo(db, username)
    if alvo.id == eu.id:
        raise HTTPException(status_code=400, detail="Não é possível seguir a si mesmo.")
    # Já segue? Não faz nada.
    if segue(db, eu.id, alvo.id):
        return
    db.add(Follow(seguidor_id=eu.id, seguido_id=alvo.id))
    try:
        db.commit()
    except IntegrityError:
        # Dois pedidos ao mesmo tempo (clique duplo rápido, duas abas): os dois
        # passam pela conferência acima e o segundo bate no par único do model
        # Follow. O follow já existe, que é o resultado pedido, então não é
        # erro (mesmo padrão das curtidas, em services/curtidas.py).
        db.rollback()


def deixar_de_seguir(db: Session, eu: User, username: str) -> None:
    alvo = buscar_alvo(db, username)
    # Apagar um follow que não existe não é erro: o resultado já é o pedido.
    db.execute(
        delete(Follow).where(Follow.seguidor_id == eu.id, Follow.seguido_id == alvo.id)
    )
    db.commit()


# ---- contadores, para o GET /usuarios/{username} da Pessoa B ----
# Ficam aqui para a regra de "quem segue quem" morar num lugar só: o perfil
# (B) só chama estas funções em vez de escrever a própria contagem.


def contar_seguidores(db: Session, user_id: int) -> int:
    """Quantas pessoas seguem user_id."""
    return (
        db.scalar(select(func.count()).select_from(Follow).where(Follow.seguido_id == user_id))
        or 0
    )


def contar_seguindo(db: Session, user_id: int) -> int:
    """Quantas pessoas user_id segue."""
    return (
        db.scalar(select(func.count()).select_from(Follow).where(Follow.seguidor_id == user_id))
        or 0
    )
