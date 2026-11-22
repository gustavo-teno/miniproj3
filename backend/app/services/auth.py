"""Regras da auth (#6, Pessoa A). Guia 01."""

import secrets

import bcrypt
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.sessao import Sessao
from app.models.user import User
from app.schemas.auth import LoginIn, RegistroIn
from app.services.users import buscar_por_username, salvar_novo


def registrar(db: Session, dados: RegistroIn) -> User:
    # gensalt() embute um sal aleatório no hash: duas pessoas com a mesma
    # senha ficam com hashes diferentes.
    senha_hash = bcrypt.hashpw(dados.password.encode(), bcrypt.gensalt()).decode()
    user = User(**dados.model_dump(exclude={"password"}), password_hash=senha_hash)
    return salvar_novo(db, user)


def login(db: Session, dados: LoginIn) -> str:
    user = buscar_por_username(db, dados.username)
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


def usuario_do_token(db: Session, token: str) -> User | None:
    """Quem fez o login que entregou este token, ou None se ele não vale."""
    sessao = db.get(Sessao, token)
    return db.get(User, sessao.user_id) if sessao else None


def logout(db: Session, token: str) -> None:
    """Sair é apagar a sessão: o token para de valer na hora."""
    sessao = db.get(Sessao, token)
    if sessao:
        db.delete(sessao)
        db.commit()
