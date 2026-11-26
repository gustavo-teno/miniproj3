"""Notificações (#103, Pessoa A): curtidas, comentários, respostas, curtidas
em comentário e novos seguidores, montadas a partir do que já existe."""


def postar(client, quem, texto="lista de logaritmo resolvida"):
    r = client.post("/posts", json={"texto": texto, "tag": "matematica"}, headers=quem)
    assert r.status_code == 201
    return r.json()["id"]


def comentar(client, quem, post_id, texto="boa!", parent_id=None):
    corpo = {"texto": texto} if parent_id is None else {"texto": texto, "parent_id": parent_id}
    r = client.post(f"/posts/{post_id}/comentarios", json=corpo, headers=quem)
    assert r.status_code == 201
    return r.json()["id"]


def notificacoes(client, quem):
    r = client.get("/notificacoes", headers=quem)
    assert r.status_code == 200
    return r.json()


def novas(client, quem):
    r = client.get("/notificacoes/novas", headers=quem)
    assert r.status_code == 200
    return r.json()["total"]


def test_curtida_comentario_e_follow_viram_notificacao(client, logar):
    ana, bia = logar("ana"), logar("bia", name="Bia")
    post_id = postar(client, ana, "revisei a lista de óptica")

    client.post(f"/posts/{post_id}/curtir", headers=bia)
    comentar(client, bia, post_id, "manda a lista!")
    client.post("/usuarios/ana/follow", headers=bia)

    lista = notificacoes(client, ana)
    # Da mais nova para a mais antiga.
    assert [n["tipo"] for n in lista] == ["seguiu", "comentario", "curtida"]
    assert all(n["pessoa"]["username"] == "bia" for n in lista)
    assert lista[1]["trecho"] == "manda a lista!"
    assert lista[1]["post_id"] == post_id
    assert lista[2]["trecho"] == "revisei a lista de óptica"


def test_curtidas_no_mesmo_post_viram_uma_linha(client, logar):
    ana = logar("ana")
    post_id = postar(client, ana)
    for nome in ("bia", "caio", "duda"):
        client.post(f"/posts/{post_id}/curtir", headers=logar(nome))

    lista = notificacoes(client, ana)
    assert len(lista) == 1
    # Quem curtiu por último aparece, com os outros contados.
    assert lista[0]["pessoa"]["username"] == "duda"
    assert lista[0]["outros"] == 2


def test_resposta_ao_meu_comentario(client, logar):
    ana, bia = logar("ana"), logar("bia")
    post_id = postar(client, bia)
    meu = comentar(client, ana, post_id, "como resolveu a 3?")
    comentar(client, bia, post_id, "por substituição", parent_id=meu)
    client.post(f"/posts/{post_id}/comentarios/{meu}/curtir", headers=bia)

    lista = notificacoes(client, ana)
    assert [n["tipo"] for n in lista] == ["curtida_comentario", "resposta"]
    # As duas abrem a conversa do comentário da ana ("Ver conversa").
    assert [n["conversa_id"] for n in lista] == [meu, meu]


def test_comentario_no_post_abre_o_post(client, logar):
    ana, bia = logar("ana"), logar("bia")
    post_id = postar(client, ana)
    comentar(client, bia, post_id)

    assert notificacoes(client, ana)[0]["conversa_id"] is None


def test_resposta_no_meu_post_nao_vira_dois_avisos(client, logar):
    ana, bia = logar("ana"), logar("bia")
    post_id = postar(client, ana)
    meu = comentar(client, ana, post_id, "alguém fez a 5?")
    comentar(client, bia, post_id, "fiz!", parent_id=meu)

    assert [n["tipo"] for n in notificacoes(client, ana)] == ["resposta"]


def test_quem_fez_a_acao_nao_recebe_aviso(client, logar):
    ana = logar("ana")
    post_id = postar(client, ana)
    client.post(f"/posts/{post_id}/curtir", headers=ana)
    meu = comentar(client, ana, post_id)
    comentar(client, ana, post_id, "eu mesma", parent_id=meu)

    assert notificacoes(client, ana) == []
    assert novas(client, ana) == 0


def test_desfazer_tira_o_aviso(client, logar):
    ana, bia = logar("ana"), logar("bia")
    post_id = postar(client, ana)
    client.post(f"/posts/{post_id}/curtir", headers=bia)
    client.post("/usuarios/ana/follow", headers=bia)
    assert novas(client, ana) == 2

    client.delete(f"/posts/{post_id}/curtir", headers=bia)
    client.delete("/usuarios/ana/follow", headers=bia)
    assert novas(client, ana) == 0
    assert notificacoes(client, ana) == []


def test_post_apagado_leva_os_avisos_junto(client, logar):
    ana, bia = logar("ana"), logar("bia")
    post_id = postar(client, ana)
    client.post(f"/posts/{post_id}/curtir", headers=bia)
    comentar(client, bia, post_id)

    assert client.delete(f"/posts/{post_id}", headers=ana).status_code == 204
    assert notificacoes(client, ana) == []


def test_abrir_a_pagina_zera_o_contador(client, logar):
    ana, bia = logar("ana"), logar("bia")
    post_id = postar(client, ana)
    client.post(f"/posts/{post_id}/curtir", headers=bia)
    comentar(client, bia, post_id)
    assert novas(client, ana) == 2

    primeira = notificacoes(client, ana)
    assert all(n["nova"] for n in primeira)
    assert novas(client, ana) == 0

    # O que chega depois volta a contar, e só isso aparece como nova.
    client.post("/usuarios/ana/follow", headers=bia)
    assert novas(client, ana) == 1
    segunda = notificacoes(client, ana)
    assert [n["nova"] for n in segunda] == [True, False, False]


def test_contador_conta_linhas_e_nao_curtidas(client, logar):
    ana = logar("ana")
    post_id = postar(client, ana)
    for nome in ("bia", "caio", "duda"):
        client.post(f"/posts/{post_id}/curtir", headers=logar(nome))

    assert novas(client, ana) == 1


def test_contar_nao_marca_como_visto(client, logar):
    ana, bia = logar("ana"), logar("bia")
    client.post("/usuarios/ana/follow", headers=bia)
    assert novas(client, ana) == 1
    assert novas(client, ana) == 1


def test_cada_um_ve_so_as_suas(client, logar):
    ana, bia = logar("ana"), logar("bia")
    client.post("/usuarios/ana/follow", headers=bia)

    assert notificacoes(client, bia) == []
    assert len(notificacoes(client, ana)) == 1


def test_trecho_longo_e_cortado(client, logar):
    ana, bia = logar("ana"), logar("bia")
    post_id = postar(client, ana)
    comentar(client, bia, post_id, "a" * 200)

    trecho = notificacoes(client, ana)[0]["trecho"]
    assert len(trecho) == 80
    assert trecho.endswith("…")


def test_sem_login_da_401(client):
    assert client.get("/notificacoes").status_code == 401
    assert client.get("/notificacoes/novas").status_code == 401
