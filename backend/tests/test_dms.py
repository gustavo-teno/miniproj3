"""DMs entre mútuos (#18, decisão 6, Pessoa A).

Os follows passam pela rota de seguir da Pessoa D (#33), e não direto pelo
banco: assim os testes também conferem que as DMs funcionam com o Follow real.
"""


def seguir(client, quem: dict, quem_segue: str) -> None:
    assert client.post(f"/usuarios/{quem_segue}/follow", headers=quem).status_code == 204


def deixar_de_seguir(client, quem: dict, quem_segue: str) -> None:
    assert client.delete(f"/usuarios/{quem_segue}/follow", headers=quem).status_code == 204


def mutuos(client, a: dict, b: dict) -> None:
    nome = lambda quem: client.get("/auth/eu", headers=quem).json()["username"]
    seguir(client, a, nome(b))
    seguir(client, b, nome(a))


def mandar(client, quem, para, texto="oi"):
    return client.post(f"/dms/{para}", json={"texto": texto}, headers=quem)


def test_mutuos_trocam_mensagem(client, logar):
    ana, bia = logar("ana", "Ana"), logar("bia", "Bia")
    mutuos(client, ana, bia)

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
    ana, bia = logar("ana"), logar("bia")
    assert mandar(client, ana, "bia").status_code == 403  # ninguém segue ninguém

    seguir(client, ana, "bia")  # só a Ana segue
    assert mandar(client, ana, "bia").status_code == 403

    seguir(client, bia, "ana")  # agora as duas
    assert mandar(client, ana, "bia").status_code == 201


def test_nao_manda_para_si_mesma_nem_para_quem_nao_existe(client, logar):
    ana = logar("ana")
    assert mandar(client, ana, "ana").status_code == 403
    assert mandar(client, ana, "ninguem").status_code == 404
    assert client.get("/dms/ninguem", headers=ana).status_code == 404


def test_mensagem_vazia_da_422(client, logar):
    ana, bia = logar("ana"), logar("bia")
    mutuos(client, ana, bia)
    assert mandar(client, ana, "bia", "   ").status_code == 422


def test_conversa_so_aparece_para_as_duas(client, logar):
    ana, bia, cris = logar("ana"), logar("bia"), logar("cris")
    mutuos(client, ana, bia)
    mandar(client, ana, "bia", "segredo do simulado")

    # A Cris não vê a conversa das duas: nem na lista, nem abrindo.
    assert client.get("/dms", headers=cris).json() == []
    assert client.get("/dms/ana", headers=cris).json()["mensagens"] == []
    assert len(client.get("/dms", headers=bia).json()) == 1


def test_depois_de_traz_so_as_novas(client, logar):
    ana, bia = logar("ana"), logar("bia")
    mutuos(client, ana, bia)
    primeira = mandar(client, ana, "bia", "1").json()
    mandar(client, bia, "ana", "2")
    mandar(client, ana, "bia", "3")

    novas = client.get(f"/dms/bia?depois_de={primeira['id']}", headers=ana).json()
    assert [m["texto"] for m in novas["mensagens"]] == ["2", "3"]

    ultima = novas["mensagens"][-1]["id"]
    vazio = client.get(f"/dms/bia?depois_de={ultima}", headers=ana).json()
    assert vazio["mensagens"] == []


def test_abrir_sem_depois_de_traz_as_ultimas_em_ordem(client, logar):
    ana, bia = logar("ana"), logar("bia")
    mutuos(client, ana, bia)
    for i in range(5):
        mandar(client, ana, "bia", str(i))

    conversa = client.get("/dms/bia?limite=3", headers=ana).json()
    # as 3 mais novas, da mais antiga para a mais nova
    assert [m["texto"] for m in conversa["mensagens"]] == ["2", "3", "4"]


def test_abrir_a_conversa_zera_as_nao_lidas(client, logar):
    ana, bia = logar("ana"), logar("bia")
    mutuos(client, ana, bia)
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
    mutuos(client, ana, bia)
    for texto in ("1", "2", "3"):
        mandar(client, ana, "bia", texto)

    client.get("/dms/ana", headers=bia)  # lê as três
    # Pedir de novo só a primeira (depois_de=0, limite=1) passa pela marca já
    # gravada e não a faz voltar.
    client.get("/dms/ana?depois_de=0&limite=1", headers=bia)
    assert client.get("/dms/nao-lidas", headers=bia).json() == {"total": 0}


def test_lista_de_conversas_da_mais_recente(client, logar):
    ana, bia, cris = logar("ana"), logar("bia"), logar("cris")
    mutuos(client, ana, bia)
    mutuos(client, ana, cris)
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
    mutuos(client, ana, bia)
    mandar(client, ana, "bia", "oi")

    deixar_de_seguir(client, ana, "bia")

    conversa = client.get("/dms/ana", headers=bia).json()
    assert [m["texto"] for m in conversa["mensagens"]] == ["oi"]
    assert conversa["pode_responder"] is False
    assert mandar(client, bia, "ana").status_code == 403


def test_dms_exigem_login(client):
    assert client.get("/dms").status_code == 401
    assert client.get("/dms/nao-lidas").status_code == 401
    assert client.post("/dms/ana", json={"texto": "oi"}).status_code == 401
