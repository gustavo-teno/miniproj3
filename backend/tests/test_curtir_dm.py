"""Curtir mensagem das DMs com dois toques (#68, Pessoa A).

Os follows passam pela rota de seguir (#33), como em test_dms.py.
"""


def nome(client, quem):
    return client.get("/auth/eu", headers=quem).json()["username"]


def mutuos(client, a, b):
    for quem, outro in ((a, b), (b, a)):
        assert client.post(f"/usuarios/{nome(client, outro)}/follow", headers=quem).status_code == 204


def mandar(client, quem, para, texto="oi"):
    r = client.post(f"/dms/{para}", json={"texto": texto}, headers=quem)
    assert r.status_code == 201
    return r.json()["id"]


def curtidas(client, quem, com, **params):
    r = client.get(f"/dms/{com}", params=params, headers=quem)
    assert r.status_code == 200
    return r.json()["curtidas"]


def test_curtir_aparece_para_os_dois(client, logar):
    ana, bia = logar("ana"), logar("bia")
    mutuos(client, ana, bia)
    mensagem = mandar(client, ana, "bia", "fechei a lista de genética")

    assert client.post(f"/dms/mensagens/{mensagem}/curtir", headers=bia).status_code == 204

    assert curtidas(client, bia, "ana") == [{"mensagem_id": mensagem, "minha": True}]
    assert curtidas(client, ana, "bia") == [{"mensagem_id": mensagem, "minha": False}]


def test_curtida_em_mensagem_antiga_chega_na_pergunta_por_novas(client, logar):
    # A tela pergunta só pelas mensagens novas (?depois_de=), mas a curtida de
    # uma mensagem antiga também precisa chegar.
    ana, bia = logar("ana"), logar("bia")
    mutuos(client, ana, bia)
    antiga = mandar(client, ana, "bia", "antiga")
    nova = mandar(client, ana, "bia", "nova")
    client.post(f"/dms/mensagens/{antiga}/curtir", headers=bia)

    r = client.get("/dms/bia", params={"depois_de": nova}, headers=ana).json()
    assert r["mensagens"] == []
    assert r["curtidas"] == [{"mensagem_id": antiga, "minha": False}]


def test_os_dois_podem_curtir_a_mesma_mensagem(client, logar):
    ana, bia = logar("ana"), logar("bia")
    mutuos(client, ana, bia)
    mensagem = mandar(client, ana, "bia")
    for quem in (ana, bia):
        client.post(f"/dms/mensagens/{mensagem}/curtir", headers=quem)

    assert sorted(c["minha"] for c in curtidas(client, ana, "bia")) == [False, True]


def test_curtir_e_descurtir_sao_idempotentes(client, logar):
    ana, bia = logar("ana"), logar("bia")
    mutuos(client, ana, bia)
    mensagem = mandar(client, ana, "bia")

    for _ in range(2):
        assert client.post(f"/dms/mensagens/{mensagem}/curtir", headers=bia).status_code == 204
    assert len(curtidas(client, bia, "ana")) == 1

    for _ in range(2):
        assert client.delete(f"/dms/mensagens/{mensagem}/curtir", headers=bia).status_code == 204
    assert curtidas(client, bia, "ana") == []


def test_quem_esta_fora_da_conversa_nao_curte(client, logar):
    ana, bia, caio = logar("ana"), logar("bia"), logar("caio")
    mutuos(client, ana, bia)
    mensagem = mandar(client, ana, "bia")

    # 404, como se a mensagem não existisse: não dá para descobrir mensagens dos outros.
    assert client.post(f"/dms/mensagens/{mensagem}/curtir", headers=caio).status_code == 404
    assert client.delete(f"/dms/mensagens/{mensagem}/curtir", headers=caio).status_code == 404
    assert client.post("/dms/mensagens/999/curtir", headers=ana).status_code == 404


def test_sem_ser_mutuos_nao_curte_mas_pode_tirar(client, logar):
    ana, bia = logar("ana"), logar("bia")
    mutuos(client, ana, bia)
    mensagem = mandar(client, ana, "bia")
    client.post(f"/dms/mensagens/{mensagem}/curtir", headers=bia)
    client.delete("/usuarios/ana/follow", headers=bia)

    assert client.post(f"/dms/mensagens/{mensagem}/curtir", headers=ana).status_code == 403
    # Tirar a própria curtida continua valendo, para ninguém ficar preso a ela.
    assert client.delete(f"/dms/mensagens/{mensagem}/curtir", headers=bia).status_code == 204
    assert curtidas(client, bia, "ana") == []


def test_curtir_exige_login(client, logar):
    assert client.post("/dms/mensagens/1/curtir").status_code == 401
