"""Testes do seed (#13, Pessoa C), além do test_seed_fake_popula_a_rede do núcleo.

Conferem o que a banca vai ver: as turmas com gente, o usuário de
demonstração entrando e a ofensiva aparecendo de todos os jeitos.
"""

from datetime import datetime, timezone

import pytest
from sqlalchemy import select

from app.constantes import CURSOS, TAGS, TAG_PADRAO, VESTIBULARES
from app.core.ofensiva import calcular, dia_em_brasilia, hoje_em_brasilia
from app.db import SessionLocal
from app.models.comment import Comment
from app.models.post import Post
from app.models.user import User

from scripts import seed
from scripts.seed_dados import FIRME, QUEBROU, VESTIBULANDOS

AGORA = datetime(2026, 11, 25, 15, 0, tzinfo=timezone.utc)


@pytest.fixture()
def db(client):
    """Banco limpo (o client recria as tabelas) já com o seed."""
    with SessionLocal() as sessao:
        seed.seed_fake(sessao, agora=AGORA)
        yield sessao


def test_toda_turma_tem_gente(db):
    usuarios = list(db.scalars(select(User)))
    assert {u.vestibular for u in usuarios} == set(VESTIBULARES)
    assert {u.curso for u in usuarios} == set(CURSOS)
    # quem escolheu "outro" escreveu qual é, e o card da turma mostra isso
    for u in usuarios:
        assert (u.vestibular == "outro") == bool(u.vestibular_outro)
        assert (u.curso == "outro") == bool(u.curso_outro)


def test_usuario_de_demonstracao_entra_com_a_senha_do_seed(db, client):
    r = client.post("/auth/login", json={"username": "ada", "password": seed.SENHA_SEED})
    assert r.status_code == 200


def test_posts_com_tag_valida_e_nada_no_futuro(db):
    posts = list(db.scalars(select(Post)))
    assert all(p.tag in TAGS for p in posts)
    assert all(p.created_at <= AGORA for p in posts)
    assert any(p.tag == TAG_PADRAO for p in posts)


def test_comentario_vem_depois_do_post(db):
    for comentario in db.scalars(select(Comment)):
        post = db.get(Post, comentario.post_id)
        assert post.created_at <= comentario.created_at <= AGORA


def test_ofensiva_aparece_de_todos_os_jeitos(db):
    hoje = hoje_em_brasilia(AGORA)
    rotina = {p["username"]: p["rotina"] for p in VESTIBULANDOS}
    for user in db.scalars(select(User)):
        dias = {
            dia_em_brasilia(p.created_at)
            for p in db.scalars(select(Post).where(Post.autor_id == user.id))
            if p.tag != TAG_PADRAO
        }
        ofensiva = calcular(dias, hoje)
        if rotina[user.username] == FIRME:
            # estuda quase todo dia: ofensiva de mais de duas semanas
            assert ofensiva.atual >= 14, user.username
        if rotina[user.username] == QUEBROU:
            # recomeçou há pouco: o perfil mostra o recorde ao lado
            assert 1 <= ofensiva.atual <= 3, user.username
            assert ofensiva.recorde > ofensiva.atual, user.username


def test_seed_on_boot_popula_a_rede_ao_ligar(monkeypatch):
    # No Render o disco zera a cada restart (guia 08): com SEED_ON_BOOT=true o
    # servidor já liga com a rede populada e a demo entra.
    from fastapi.testclient import TestClient

    from app.db import Base, engine
    from app.main import app

    monkeypatch.setenv("SEED_ON_BOOT", "true")
    Base.metadata.drop_all(engine)
    with TestClient(app) as client:
        r = client.post("/auth/login", json={"username": "ada", "password": seed.SENHA_SEED})
        assert r.status_code == 200
