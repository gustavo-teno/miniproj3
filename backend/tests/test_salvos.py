"""Posts salvos (#64, Pessoa A): guardar um post para rever depois."""


def postar(client, quem, texto="lista de logaritmo resolvida"):
    r = client.post("/posts", json={"texto": texto, "tag": "matematica"}, headers=quem)
    assert r.status_code == 201
    return r.json()["id"]


def salvos(client, quem, **params):
    r = client.get("/salvos", params=params, headers=quem)
    assert r.status_code == 200
    return r.json()


def test_salvar_aparece_na_lista_e_no_post(client, logar):
    ana, bia = logar("ana"), logar("bia")
    post_id = postar(client, bia)

    assert client.post(f"/posts/{post_id}/salvar", headers=ana).status_code == 204

    lista = salvos(client, ana)
    assert lista["total"] == 1
    assert [p["id"] for p in lista["items"]] == [post_id]
    assert lista["items"][0]["salvo_por_mim"] is True
    assert client.get(f"/posts/{post_id}", headers=ana).json()["salvo_por_mim"] is True


def test_so_quem_salvou_ve(client, logar):
    ana, bia = logar("ana"), logar("bia")
    post_id = postar(client, bia)
    client.post(f"/posts/{post_id}/salvar", headers=ana)

    # A autora do post não fica sabendo, e a lista dela continua vazia.
    assert salvos(client, bia)["total"] == 0
    assert client.get(f"/posts/{post_id}", headers=bia).json()["salvo_por_mim"] is False


def test_salvar_duas_vezes_nao_duplica(client, logar):
    ana = logar("ana")
    post_id = postar(client, ana)

    for _ in range(2):
        assert client.post(f"/posts/{post_id}/salvar", headers=ana).status_code == 204

    assert salvos(client, ana)["total"] == 1


def test_tirar_dos_salvos_e_idempotente(client, logar):
    ana = logar("ana")
    post_id = postar(client, ana)
    client.post(f"/posts/{post_id}/salvar", headers=ana)

    for _ in range(2):
        assert client.delete(f"/posts/{post_id}/salvar", headers=ana).status_code == 204

    assert salvos(client, ana)["total"] == 0
    assert client.get(f"/posts/{post_id}", headers=ana).json()["salvo_por_mim"] is False


def test_lista_vem_do_salvo_mais_recente_e_paginada(client, logar):
    ana = logar("ana")
    primeiro, segundo, terceiro = (postar(client, ana, f"post {n}") for n in range(3))
    # A ordem é a de salvar, não a do post: o mais antigo foi salvo por último.
    for post_id in (segundo, terceiro, primeiro):
        client.post(f"/posts/{post_id}/salvar", headers=ana)

    pagina = salvos(client, ana, limit=2)
    assert pagina["total"] == 3
    assert [p["id"] for p in pagina["items"]] == [primeiro, terceiro]
    assert [p["id"] for p in salvos(client, ana, offset=2, limit=2)["items"]] == [segundo]


def test_post_apagado_some_dos_salvos(client, logar):
    ana, bia = logar("ana"), logar("bia")
    post_id = postar(client, bia)
    client.post(f"/posts/{post_id}/salvar", headers=ana)

    assert client.delete(f"/posts/{post_id}", headers=bia).status_code == 204

    assert salvos(client, ana) == {"items": [], "total": 0, "offset": 0, "limit": 20}


def test_salvar_post_que_nao_existe_da_404(client, logar):
    ana = logar("ana")
    assert client.post("/posts/999/salvar", headers=ana).status_code == 404
    assert client.delete("/posts/999/salvar", headers=ana).status_code == 404


def test_salvos_exige_login(client, logar):
    post_id = postar(client, logar("ana"))
    assert client.get("/salvos").status_code == 401
    assert client.post(f"/posts/{post_id}/salvar").status_code == 401


def test_busca_diz_o_que_voce_salvou_e_curtiu(client, logar):
    # Os posts da busca têm os botões de curtir e salvar, então vêm marcados.
    ana, bia = logar("ana"), logar("bia")
    salvo, outro = postar(client, bia, "logaritmo salvo"), postar(client, bia, "logaritmo outro")
    client.post(f"/posts/{salvo}/salvar", headers=ana)
    client.post(f"/posts/{salvo}/curtir", headers=ana)

    itens = client.get("/busca/posts?q=logaritmo", headers=ana).json()["items"]
    marcas = {p["id"]: (p["salvo_por_mim"], p["curtido_por_mim"]) for p in itens}
    assert marcas == {salvo: (True, True), outro: (False, False)}
