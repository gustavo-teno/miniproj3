"""Regras da auth (#6, Pessoa A). Guia 01."""

import bcrypt
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.contadores import contador_iniciais
from app.models.user import User
from app.schemas.auth import RegistroIn


def registrar(db: Session, dados: RegistroIn) -> User:
    if db.scalar(select(User).where(User.username == dados.username)):
        raise HTTPException(status_code=409, detail="username já existe")

    # gensalt() embute um sal aleatório no hash: duas pessoas com a mesma
    # senha ficam com hashes diferentes.
    hash_ = bcrypt.hashpw(dados.password.encode(), bcrypt.gensalt()).decode()
    user = User(**dados.model_dump(exclude={"password"}), password_hash=hash_)
    db.add(user)
    db.commit()
    db.refresh(user)

    contador_iniciais.incrementar(user.username)
    return user
