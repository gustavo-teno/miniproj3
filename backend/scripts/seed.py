"""Seed mínimo: 3 usuários para o slice de exemplo renderizar.

A versão de verdade (com faker, posts, follows, likes...) é FEATURE DO NÚCLEO —
é do time. Rode com: make seed
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import bcrypt
from sqlalchemy import select

from app.db import Base, SessionLocal, engine
from app.models.user import User

# A mesma senha para todo usuário do seed, para dar para logar como eles.
SENHA_SEED = "senha-forte-123"
HASH_SEED = bcrypt.hashpw(SENHA_SEED.encode(), bcrypt.gensalt()).decode()

USUARIOS = [
    User(username="ada", name="Ada Lovelace", bio="a primeira a programar",
         password_hash=HASH_SEED),
    User(username="linus", name="Linus Torvalds", bio="just for fun",
         password_hash=HASH_SEED),
    User(username="grace", name="Grace Hopper", bio="caçadora de bugs literais",
         password_hash=HASH_SEED),
]


def main() -> None:
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        if db.scalar(select(User).limit(1)):
            print("banco já tem dados — nada a fazer")
            return
        db.add_all(USUARIOS)
        db.commit()
        print(f"seed ok: {len(USUARIOS)} usuários criados")


if __name__ == "__main__":
    main()
