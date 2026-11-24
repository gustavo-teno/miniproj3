"""DMs entre mútuos (#18, decisão 6, Pessoa A).

A rota de seguir é da Pessoa D e chega em outro PR, então aqui os follows são
criados direto no banco, com a função seguir().
"""

from app.db import SessionLocal
from app.models.follow import Follow
from app.services.users import buscar_por_username


def seguir(quem: str, quem_segue: str) -> None:
    with SessionLocal() as db:
        a = buscar_por_username(db, quem)
        b = buscar_por_username(db, quem_segue)
        db.add(Follow(seguidor_id=a.id, seguido_id=b.id))
        db.commit()


def mutuos(a: str, b: str) -> None:
    seguir(a, b)
    seguir(b, a)


def mandar(client, quem, para, texto="oi"):
    return client.post(f"/dms/{para}", json={"texto": texto}, headers=quem)


def test_mutuos_trocam_mensagem(client, logar):
    ana, bia = logar("ana", "Ana"), logar("bia", "Bia")
    mutuos("ana", "bia")

    r = mandar(client, ana, "bia", "bora estudar física às 19h?")
    assert r.status_code == 201
    assert r.json()["minha"] is True

    conversa = client.get("/dms/ana", headers=bia).json()
    assert conversa["pessoa"]["username"] == "ana"
    assert conversa["pode_responder"] is True
    assert [(m["texto"], m["minha"]) for m in conversa["mensagens"]] == [
        ("bora estudar física às 19h?", False)
    ]


def test_quem_nao_e_mutuo_recebe_403(client, logar):
    ana, _ = logar("ana"), logar("bia")
    assert mandar(client, ana, "bia").status_code == 403  # ninguém segue ninguém

    seguir("ana", "bia")  # só a Ana segue
    assert mandar(client, ana, "bia").status_code == 403

    seguir("bia", "ana")  # agora as duas
    assert mandar(client, ana, "bia").status_code == 201


def test_nao_manda_para_si_mesma_nem_para_quem_nao_existe(client, logar):
    ana = logar("ana")
    assert mandar(client, ana, "ana").status_code == 403
    assert mandar(client, ana, "ninguem").status_code == 404
    assert client.get("/dms/ninguem", headers=ana).status_code == 404


def test_mensagem_vazia_da_422(client, logar):
    ana, _ = logar("ana"), logar("bia")
    mutuos("ana", "bia")
    assert mandar(client, ana, "bia", "   ").status_code == 422


def test_conversa_so_aparece_para_as_duas(client, logar):
    ana, bia, cris = logar("ana"), logar("bia"), logar("cris")
    mutuos("ana", "bia")
    mandar(client, ana, "bia", "segredo do simulado")

    # A Cris não vê a conversa das duas: nem na lista, nem abrindo.
    assert client.get("/dms", headers=cris).json() == []
    assert client.get("/dms/ana", headers=cris).json()["mensagens"] == []
    assert len(client.get("/dms", headers=bia).json()) == 1


def test_depois_de_traz_so_as_novas(client, logar):
    ana, bia = logar("ana"), logar("bia")
    mutuos("ana", "bia")
    primeira = mandar(client, ana, "bia", "1").json()
    mandar(client, bia, "ana", "2")
    mandar(client, ana, "bia", "3")

    novas = client.get(f"/dms/bia?depois_de={primeira['id']}", headers=ana).json()
    assert [m["texto"] for m in novas["mensagens"]] == ["2", "3"]

    ultima = novas["mensagens"][-1]["id"]
    vazio = client.get(f"/dms/bia?depois_de={ultima}", headers=ana).json()
    assert vazio["mensagens"] == []


def test_abrir_sem_depois_de_traz_as_ultimas_em_ordem(client, logar):
    ana, _ = logar("ana"), logar("bia")
    mutuos("ana", "bia")
    for i in range(5):
        mandar(client, ana, "bia", str(i))

    conversa = client.get("/dms/bia?limite=3", headers=ana).json()
    # as 3 mais novas, da mais antiga para a mais nova
    assert [m["texto"] for m in conversa["mensagens"]] == ["2", "3", "4"]


def test_abrir_a_conversa_zera_as_nao_lidas(client, logar):
    ana, bia = logar("ana"), logar("bia")
    mutuos("ana", "bia")
    mandar(client, ana, "bia", "oi")
    mandar(client, ana, "bia", "tá aí?")

    assert client.get("/dms/nao-lidas", headers=bia).json() == {"total": 2}
    assert client.get("/dms", headers=bia).json()[0]["nao_lidas"] == 2
    # quem mandou não tem nada para ler
    assert client.get("/dms/nao-lidas", headers=ana).json() == {"total": 0}

    client.get("/dms/ana", headers=bia)
    assert client.get("/dms/nao-lidas", headers=bia).json() == {"total": 0}

    # e uma mensagem nova volta a contar
    mandar(client, ana, "bia", "?")
    assert client.get("/dms/nao-lidas", headers=bia).json() == {"total": 1}


def test_pagina_antiga_nao_desmarca_as_lidas(client, logar):
    ana, bia = logar("ana"), logar("bia")
    mutuos("ana", "bia")
    for texto in ("1", "2", "3"):
        mandar(client, ana, "bia", texto)

    client.get("/dms/ana", headers=bia)  # lê as três
    # Pedir de novo só a primeira (depois_de=0, limite=1) passa pela marca já
    # gravada e não a faz voltar.
    client.get("/dms/ana?depois_de=0&limite=1", headers=bia)
    assert client.get("/dms/nao-lidas", headers=bia).json() == {"total": 0}


def test_lista_de_conversas_da_mais_recente(client, logar):
    ana, bia, cris = logar("ana"), logar("bia"), logar("cris")
    mutuos("ana", "bia")
    mutuos("ana", "cris")
    mandar(client, ana, "bia", "primeiro com a bia")
    mandar(client, cris, "ana", "depois a cris")

    lista = client.get("/dms", headers=ana).json()
    assert [c["pessoa"]["username"] for c in lista] == ["cris", "bia"]
    assert lista[0]["ultima"]["texto"] == "depois a cris"
    assert lista[0]["ultima"]["minha"] is False
    assert lista[0]["nao_lidas"] == 1
    assert lista[1]["nao_lidas"] == 0  # a Ana mandou, a Bia não respondeu


def test_quem_deixou_de_seguir_ve_a_conversa_mas_nao_responde(client, logar):
    ana, bia = logar("ana"), logar("bia")
    mutuos("ana", "bia")
    mandar(client, ana, "bia", "oi")

    # A Ana deixa de seguir a Bia.
    with SessionLocal() as db:
        ana_id = buscar_por_username(db, "ana").id
        db.query(Follow).filter(Follow.seguidor_id == ana_id).delete()
        db.commit()

    conversa = client.get("/dms/ana", headers=bia).json()
    assert [m["texto"] for m in conversa["mensagens"]] == ["oi"]
    assert conversa["pode_responder"] is False
    assert mandar(client, bia, "ana").status_code == 403


def test_dms_exigem_login(client):
    assert client.get("/dms").status_code == 401
    assert client.get("/dms/nao-lidas").status_code == 401
    assert client.post("/dms/ana", json={"texto": "oi"}).status_code == 401
