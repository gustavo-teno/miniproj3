"""Usuários e perfil-diário (#10, Pessoa B). Divide o prefixo /usuarios com
follows.py (D) e ofensiva.py (A).

Rotas: GET /usuarios/{username}, PATCH /usuarios/eu e
GET /usuarios/{username}/posts (testes do núcleo). GET /usuarios/{username}
vai DEPOIS de /stats e de /eu, senão captura esses caminhos.

Slice de exemplo completo: model → schema → service → router → página Next.

Toda feature nova imita este caminho. 1 arquivo por router — registre o seu
com uma linha em main.py.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.constantes import TAGS
from app.core.contadores import contador_iniciais
from app.db import get_db
from app.deps import get_current_user
from app.models.user import User
from app.schemas.user import (
    PerfilEditar,
    PerfilOut,
    PostPage,
    UserCreate,
    UserOut,
    UserPage,
)
from app.services import curtidas, salvos
from app.services import users as service

router = APIRouter(prefix="/usuarios", tags=["usuarios"])


@router.get("", response_model=UserPage)
def listar_usuarios(
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    users, total = service.listar(db, offset, limit)
    return UserPage(items=users, total=total, offset=offset, limit=limit)


@router.get("/stats")
def stats_por_inicial():
    """Endpoint que USA a estrutura do core/ — alvo do teste-sabotagem de exemplo."""
    return {"usuarios_por_inicial": contador_iniciais.contagem()}


@router.post("", response_model=UserOut, status_code=201)
def criar_usuario(dados: UserCreate, db: Session = Depends(get_db)):
    # ponytail: criação sem senha — o guia de auth evolui isto para o registro real
    return service.criar(db, dados)


# ---- perfil-diário (#10, Pessoa B) ----
# A ordem importa: as rotas fixas (/stats, /eu) vêm ANTES de /{username}, senão
# "eu" e "stats" seriam lidos como nome de usuário. Por isso esses dois nomes
# são reservados no cadastro (USERNAMES_RESERVADOS, em schemas/auth.py).


@router.patch("/eu", response_model=PerfilOut)
def editar_meu_perfil(
    dados: PerfilEditar,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Devolve o perfil inteiro, para a tela de editar atualizar o topo sem
    # pedir de novo.
    service.editar(db, user, dados)
    return service.perfil(db, user.username, quem_ve=user)


@router.get("/{username}", response_model=PerfilOut)
def ver_perfil(
    username: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.perfil(db, username, quem_ve=user)


@router.get("/{username}/posts", response_model=PostPage)
def posts_do_perfil(
    username: str,
    # Um caderno da estante; sem tag, todos os posts.
    tag: str | None = None,
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if tag is not None and tag not in TAGS:
        raise HTTPException(status_code=422, detail=f"tag desconhecida: {tag}")
    posts, total = service.posts_do_perfil(db, username, tag, offset, limit)
    # Sem isto, o coração e o Salvar dos posts do diário apareciam sempre
    # vazios, mesmo para quem já tinha curtido ou salvado.
    curtidas.marcar_curtidos(db, user, posts)
    salvos.marcar_salvos(db, user, posts)
    return PostPage(items=posts, total=total, offset=offset, limit=limit)
