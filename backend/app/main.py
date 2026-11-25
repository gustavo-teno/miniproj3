from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from app.core.contadores import contador_iniciais
from app.db import Base, SessionLocal, engine
from app.models import User
from app.routers import (
    auth,
    busca,
    comentarios,
    curtidas,
    dms,
    feed,
    follows,
    ofensiva,
    opcoes,
    posts,
    turmas,
    users,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(engine)
    # Reconstrói as estruturas do core/ a partir do banco (memória zera a cada
    # restart — inclusive no --reload; ver core/README.md).
    with SessionLocal() as db:
        usernames = list(db.scalars(select(User.username)))
    contador_iniciais.reconstruir(usernames)
    yield


app = FastAPI(title="Rede Social da Trilha", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    # A 3001 é para quando a 3000 já está ocupada e o Next sobe na seguinte.
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1 linha por feature — registre o seu router aqui.
app.include_router(users.router)
app.include_router(auth.router)
app.include_router(busca.router)
app.include_router(posts.router)
app.include_router(follows.router)
app.include_router(curtidas.router)
app.include_router(comentarios.router)
app.include_router(feed.router)
app.include_router(ofensiva.router)
app.include_router(turmas.router)
app.include_router(dms.router)
app.include_router(opcoes.router)
