"""Regras da auth (#6, Pessoa A). Guia 01."""

import secrets

import bcrypt
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.contadores import contador_iniciais
from app.models.session import Session as Sessao
from app.models.user import User
from app.schemas.auth import LoginIn, RegistroIn


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


def login(db: Session, dados: LoginIn) -> str:
    user = db.scalar(select(User).where(User.username == dados.username))
    # Mesmo 401 para usuário que não existe e senha errada: responder "usuário
    # não existe" contaria a quem está chutando quais usuários existem.
    # Hash vazio (usuário criado sem senha) faria o checkpw explodir em 500.
    if not user or not user.password_hash or not bcrypt.checkpw(
        dados.password.encode(), user.password_hash.encode()
    ):
        raise HTTPException(status_code=401, detail="usuário ou senha inválidos")

    sessao = Sessao(token=secrets.token_urlsafe(32), user_id=user.id)
    db.add(sessao)
    db.commit()
    return sessao.token


def logout(db: Session, token: str) -> None:
    """Sair é apagar a sessão: o token para de valer na hora."""
    sessao = db.get(Sessao, token)
    if sessao:
        db.delete(sessao)
        db.commit()
