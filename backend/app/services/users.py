from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.contadores import contador_iniciais
from app.models.user import User
from app.schemas.user import UserCreate


def listar(db: Session, offset: int, limit: int) -> tuple[list[User], int]:
    total = db.scalar(select(func.count()).select_from(User)) or 0
    users = list(
        db.scalars(
            select(User).order_by(User.username).offset(offset).limit(limit)
        )
    )
    return users, total


def buscar_por_username(db: Session, username: str) -> User | None:
    return db.scalar(select(User).where(User.username == username))


def salvar_novo(db: Session, user: User) -> User:
    """Guarda um usuário novo. Usado pelo POST /usuarios e pelo cadastro da auth,
    para a regra do username repetido ficar num lugar só."""
    if buscar_por_username(db, user.username):
        raise HTTPException(status_code=409, detail="username já existe")

    db.add(user)
    db.commit()
    db.refresh(user)

    contador_iniciais.incrementar(user.username)
    return user


def criar(db: Session, dados: UserCreate) -> User:
    return salvar_novo(db, User(**dados.model_dump()))
