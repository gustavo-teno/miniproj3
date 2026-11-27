"""Testes do seed (#13, Pessoa C), além do test_seed_fake_popula_a_rede do núcleo.

Conferem o que a banca vai ver: as turmas com gente, o usuário de
demonstração entrando e a ofensiva aparecendo de todos os jeitos.
"""

from datetime import datetime, timezone

import pytest
from sqlalchemy import func, select

from app.constantes import CURSOS, TAGS, TAG_PADRAO, VESTIBULARES
from app.core.ofensiva import calcular, dia_em_brasilia, hoje_em_brasilia
from app.db import SessionLocal
from app.models.comment import Comment
from app.models.curtida_comentario import CurtidaComentario
from app.models.post import Post
from app.models.user import User

from scripts import seed
from scripts.seed_dados import CONVERSA_DEMO, CONVERSAS_DEMO, FIRME, QUEBROU, VESTIBULANDOS

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


def test_conversas_tem_respostas_e_curtidas(db):
    respostas = list(db.scalars(select(Comment).where(Comment.parent_id.is_not(None))))
    assert respostas, "a conversa dos posts precisa ter respostas para a demo"
    for resposta in respostas:
        pai = db.get(Comment, resposta.parent_id)
        # A resposta vem depois do comentário que ela responde, no mesmo post.
        assert resposta.post_id == pai.post_id
        assert pai.created_at <= resposta.created_at <= AGORA
    assert db.scalar(select(func.count()).select_from(CurtidaComentario)) > 0


def test_demo_tem_uma_conversa_recolhida(db, client):
    # Um post da Ada tem uma conversa com mais de 3 respostas, para o "Ver
    # conversa" aparecer no vídeo sem ninguém precisar responder antes.
    token = client.post(
        "/auth/login", json={"username": "ada", "password": seed.SENHA_SEED}
    ).json()["token"]
    ada = db.scalar(select(User).where(User.username == "ada"))
    primeira = db.scalar(select(Comment).where(Comment.texto == CONVERSA_DEMO[0][1]))
    assert db.get(Post, primeira.post_id).autor_id == ada.id

    r = client.get(f"/posts/{primeira.post_id}/comentarios/{primeira.id}",
                   headers={"Authorization": f"Bearer {token}"})
    falas, atual = [], r.json()
    while True:
        falas.append(atual["texto"])
        if not atual["respostas"]:
            break
        atual = atual["respostas"][0]
    assert falas == [texto for _quem, texto in CONVERSA_DEMO]


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


def test_demo_tem_conversas_com_mutuos_e_nao_lidas(db, client):
    token = client.post(
        "/auth/login", json={"username": "ada", "password": seed.SENHA_SEED}
    ).json()["token"]
    ada = {"Authorization": f"Bearer {token}"}

    conversas = client.get("/dms", headers=ada).json()
    esperadas = {c["com"]: c["nao_lidas"] for c in CONVERSAS_DEMO}
    assert {c["pessoa"]["username"]: c["nao_lidas"] for c in conversas} == esperadas
    # a conversa com a mensagem mais recente vem primeiro, e nada está no futuro
    assert conversas[0]["pessoa"]["username"] == "manu"
    assert all(datetime.fromisoformat(c["ultima"]["created_at"]) <= AGORA for c in conversas)
    assert client.get("/dms/nao-lidas", headers=ada).json() == {"total": sum(esperadas.values())}

    # são mútuos, então a Ada pode responder
    for com in esperadas:
        assert client.get(f"/dms/{com}", headers=ada).json()["pode_responder"]


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


def test_fotos_vao_para_posts_do_mesmo_assunto(db):
    # Imagem nos posts (#105): cada foto de FOTOS vai para um post de matéria do
    # mesmo assunto, uma por post, e cabe no limite da rota de imagem.
    from app.constantes import TAG_PADRAO
    from app.models.imagem_post import ImagemPost
    from app.services.imagens import TAMANHO_MAXIMO, formato
    from scripts.seed_dados import FOTOS

    imagens = list(db.scalars(select(ImagemPost)))
    assert len(imagens) == len(FOTOS)
    assert len({i.post_id for i in imagens}) == len(FOTOS)
    por_bytes = {(seed.PASTA_FOTOS / f["arquivo"]).read_bytes(): f for f in FOTOS}
    for imagem in imagens:
        foto = por_bytes[imagem.dados]
        post = db.get(Post, imagem.post_id)
        assert post.tag != TAG_PADRAO
        assert post.tag == foto["tag"]
        if "vestibular" in foto:
            assert db.get(User, post.autor_id).vestibular == foto["vestibular"]
        if "texto" in foto:
            assert post.texto == foto["texto"]
        else:
            assert all(trecho in post.texto for trecho in foto["contem"])
        assert imagem.tipo == formato(imagem.dados) is not None
        assert len(imagem.dados) <= TAMANHO_MAXIMO


def test_post_de_foto_que_pergunta_tem_a_resposta(db):
    # Os posts de foto que fazem uma pergunta não ficam sem resposta: cada "fa"
    # é um comentário de quem segue o autor, e "autor" responde ao último "fa".
    from app.models.follow import Follow
    from app.models.imagem_post import ImagemPost
    from scripts.seed_dados import FOTOS

    for foto in (f for f in FOTOS if "comentarios" in f):
        dados = (seed.PASTA_FOTOS / foto["arquivo"]).read_bytes()
        post = db.get(Post, db.scalar(select(ImagemPost.post_id).where(ImagemPost.dados == dados)))
        comentarios = {c.texto: c for c in db.scalars(select(Comment).where(Comment.post_id == post.id))}
        fas, ultimo_fa, antes = set(), None, post.created_at
        for quem, texto in foto["comentarios"]:
            c = comentarios[texto]
            if quem == "fa":
                assert c.parent_id is None and c.autor_id != post.autor_id
                assert db.scalar(select(Follow).where(Follow.seguidor_id == c.autor_id,
                                                      Follow.seguido_id == post.autor_id))
                fas.add(c.autor_id)
                ultimo_fa = c
            else:
                assert c.autor_id == post.autor_id and c.parent_id == ultimo_fa.id
            # Cada fala depois da anterior, e nunca no futuro.
            assert antes < c.created_at <= AGORA
            antes = c.created_at
        assert len(fas) == sum(quem == "fa" for quem, _ in foto["comentarios"])
