"""Turmas (#17, Pessoa D): formadas pela meta do perfil (decisão 5)."""

from datetime import datetime, timedelta, timezone

import pytest


@pytest.fixture()
def turma(client, logar):
    """Fábrica: cria alguém logado já com a meta escolhida."""

    def _criar(username: str, name: str = "Alguém", **meta) -> dict:
        h = logar(username, name)
        if meta:
            r = client.patch("/usuarios/eu", json=meta, headers=h)
            assert r.status_code == 200, r.text
        return h

    return _criar


def _achar(turmas: list[dict], chave: str) -> dict:
    return next(t for t in turmas if t["chave"] == chave)


def test_lista_todas_as_turmas_com_contagens(client, turma):
    ana = turma("ana", vestibular="enem", curso="medicina")
    bia = turma("bia", vestibular="enem", curso="direito")
    turma("caio")  # sem meta: não entra em turma nenhuma

    # Só a ana estudou hoje (post de matéria); o bate-papo da bia não conta.
    client.post("/posts", json={"texto": "funções", "tag": "matematica"}, headers=ana)
    client.post("/posts", json={"texto": "bora?", "tag": "bate-papo"}, headers=bia)

    r = client.get("/turmas", headers=ana)
    assert r.status_code == 200
    corpo = r.json()

    # Toda opção de constantes.py vira turma, mesmo vazia, na mesma ordem.
    assert [t["chave"] for t in corpo["vestibulares"]][0] == "enem"
    assert corpo["vestibulares"][-1]["chave"] == "outro"
    assert _achar(corpo["vestibulares"], "fuvest")["pessoas"] == 0

    enem = _achar(corpo["vestibulares"], "enem")
    assert enem == {
        "tipo": "vestibular",
        "chave": "enem",
        "nome": "ENEM",
        "pessoas": 2,
        "estudaram_hoje": 1,
    }
    assert _achar(corpo["cursos"], "medicina")["pessoas"] == 1


def test_bate_papo_nao_conta_como_estudo(client, turma):
    ana = turma("ana", vestibular="enem")
    client.post("/posts", json={"texto": "alguém nervoso?", "tag": "bate-papo"}, headers=ana)

    enem = _achar(client.get("/turmas", headers=ana).json()["vestibulares"], "enem")
    assert enem["estudaram_hoje"] == 0


def test_minhas_turmas(client, turma):
    ana = turma("ana", vestibular="ita-ime", curso="engenharias")
    caio = turma("caio")

    minhas = client.get("/turmas", headers=ana).json()["minhas"]
    assert [(t["tipo"], t["chave"]) for t in minhas] == [
        ("vestibular", "ita-ime"),
        ("curso", "engenharias"),
    ]
    # Sem meta, sem turma: a tela pode convidar a escolher no perfil.
    assert client.get("/turmas", headers=caio).json()["minhas"] == []


def test_turma_outro_tem_nome_proprio_e_mostra_o_texto(client, turma):
    ana = turma("ana", curso="outro", curso_outro="Geografia")

    r = client.get("/turmas/curso/outro", headers=ana)
    assert r.status_code == 200
    assert r.json()["nome"] == "Outros cursos"
    assert _achar(client.get("/turmas", headers=ana).json()["vestibulares"], "outro")[
        "nome"
    ] == "Outros vestibulares"

    membro = client.get("/turmas/curso/outro/membros", headers=ana).json()["items"][0]
    assert membro["curso_outro"] == "Geografia"


def test_membros_com_estudou_hoje_e_segue_voce(client, turma):
    ana = turma("ana", "Ana", vestibular="fuvest")
    bia = turma("bia", "Bia", vestibular="fuvest")
    turma("caio", "Caio", vestibular="enem")  # outra turma

    client.post("/usuarios/ana/follow", headers=bia)
    client.post("/posts", json={"texto": "redação", "tag": "redacao"}, headers=bia)

    r = client.get("/turmas/vestibular/fuvest/membros", headers=ana)
    assert r.status_code == 200
    corpo = r.json()
    assert corpo["total"] == 2
    # Em ordem de nome, com a meta e os campos que dependem de quem vê.
    assert [(m["username"], m["estudou_hoje"], m["segue_voce"]) for m in corpo["items"]] == [
        ("ana", False, False),
        ("bia", True, True),
    ]
    assert corpo["items"][0]["vestibular"] == "fuvest"


def test_posts_dos_membros_com_filtro_por_materia(client, turma):
    ana = turma("ana", vestibular="unicamp")
    bia = turma("bia", vestibular="unicamp")
    caio = turma("caio", vestibular="enem")

    client.post("/posts", json={"texto": "química 1", "tag": "quimica"}, headers=ana)
    client.post("/posts", json={"texto": "física 1", "tag": "fisica"}, headers=bia)
    client.post("/posts", json={"texto": "química 2", "tag": "quimica"}, headers=bia)
    client.post("/posts", json={"texto": "do enem", "tag": "quimica"}, headers=caio)

    r = client.get("/turmas/vestibular/unicamp/posts", headers=ana)
    assert r.status_code == 200
    corpo = r.json()
    assert corpo["total"] == 3
    # Do mais novo para o mais antigo, só de quem é da turma.
    assert [p["texto"] for p in corpo["items"]] == ["química 2", "física 1", "química 1"]
    # O mesmo formato do feed e do perfil (PostOut).
    assert {"autor", "curtidas", "comentarios", "curtido_por_mim"} <= corpo["items"][0].keys()

    r = client.get("/turmas/vestibular/unicamp/posts?tag=quimica", headers=ana)
    assert [p["texto"] for p in r.json()["items"]] == ["química 2", "química 1"]

    # paginação
    r = client.get("/turmas/vestibular/unicamp/posts?offset=1&limit=1", headers=ana)
    assert [p["texto"] for p in r.json()["items"]] == ["física 1"]


def test_post_de_ontem_nao_conta_como_estudo_de_hoje(client, turma):
    """O dia é o de Brasília, como na ofensiva: 1 h antes da meia-noite de
    hoje em Brasília já é ontem."""
    from app.core.ofensiva import BRASILIA, hoje_em_brasilia
    from app.db import SessionLocal
    from app.models.post import Post

    ana = turma("ana", vestibular="enem")
    post_id = client.post(
        "/posts", json={"texto": "ontem", "tag": "historia"}, headers=ana
    ).json()["id"]

    meia_noite = datetime.combine(hoje_em_brasilia(), datetime.min.time(), tzinfo=BRASILIA)
    with SessionLocal() as db:
        db.get(Post, post_id).created_at = (meia_noite - timedelta(hours=1)).astimezone(
            timezone.utc
        )
        db.commit()

    enem = client.get("/turmas/vestibular/enem", headers=ana).json()
    assert enem["pessoas"] == 1
    assert enem["estudaram_hoje"] == 0


def test_turma_inexistente_e_tag_invalida(client, turma):
    ana = turma("ana")

    assert client.get("/turmas/vestibular/harvard", headers=ana).status_code == 404
    assert client.get("/turmas/curso/harvard/membros", headers=ana).status_code == 404
    # tipo fora de vestibular/curso: o FastAPI recusa o endereço
    assert client.get("/turmas/escola/enem", headers=ana).status_code == 422
    assert client.get("/turmas/vestibular/enem/posts?tag=xadrez", headers=ana).status_code == 422


def test_turmas_exigem_login(client):
    assert client.get("/turmas").status_code == 401
    assert client.get("/turmas/vestibular/enem/posts").status_code == 401
