"""Testes do perfil-diário (#10, Pessoa B).

Usam a auth de verdade (fixture logar), como o test_perfil_editavel do núcleo.
"""


def postar(client, quem, tag, texto="estudei", minutos=None):
    r = client.post("/posts", json={"texto": texto, "tag": tag, "minutos": minutos}, headers=quem)
    assert r.status_code == 201
    return r.json()


def test_perfil_tem_meta_contadores_e_meu_perfil(client, logar):
    ana = logar("ana", "Ana")
    bia = logar("bia", "Bia")
    client.patch(
        "/usuarios/eu",
        json={"vestibular": "fuvest", "curso": "outro", "curso_outro": "Geografia"},
        headers=ana,
    )

    perfil = client.get("/usuarios/ana", headers=ana).json()
    assert perfil["vestibular"] == "fuvest"
    assert perfil["curso"] == "outro"
    assert perfil["curso_outro"] == "Geografia"
    assert perfil["seguidores"] == 0 and perfil["seguindo"] == 0
    # a dona vê o próprio diário; a Bia, não
    assert perfil["meu_perfil"] is True
    assert client.get("/usuarios/ana", headers=bia).json()["meu_perfil"] is False
    # "no Caderno desde": a data sai em UTC, com o Z
    assert perfil["created_at"].endswith("Z")


def test_perfil_de_quem_nao_existe_da_404(client, logar):
    ana = logar("ana")
    assert client.get("/usuarios/ninguem", headers=ana).status_code == 404
    assert client.get("/usuarios/ninguem/posts", headers=ana).status_code == 404


def test_perfil_exige_login(client, logar):
    logar("ana")
    assert client.get("/usuarios/ana").status_code == 401
    assert client.patch("/usuarios/eu", json={"bio": "oi"}).status_code == 401


def test_cadernos_contam_posts_por_materia(client, logar):
    ana = logar("ana")
    postar(client, ana, "biologia")
    postar(client, ana, "biologia")
    postar(client, ana, "fisica")

    cadernos = client.get("/usuarios/ana", headers=ana).json()["cadernos"]
    # do mais usado para o menos usado, só as tags com post
    assert [(c["tag"], c["posts"]) for c in cadernos] == [("biologia", 2), ("fisica", 1)]
    assert cadernos[0]["ultimo_post"].endswith("Z")


def test_posts_do_perfil_filtram_por_tag_e_paginam(client, logar):
    ana = logar("ana")
    bia = logar("bia")
    for i in range(3):
        postar(client, ana, "biologia", texto=f"bio {i}")
    postar(client, ana, "fisica")
    postar(client, bia, "biologia")  # da Bia: não entra no diário da Ana

    todos = client.get("/usuarios/ana/posts", headers=ana).json()
    assert todos["total"] == 4

    bio = client.get("/usuarios/ana/posts?tag=biologia&limit=2", headers=ana).json()
    assert bio["total"] == 3
    assert len(bio["items"]) == 2
    assert {p["tag"] for p in bio["items"]} == {"biologia"}
    # do mais novo para o mais antigo
    assert bio["items"][0]["texto"] == "bio 2"

    resto = client.get("/usuarios/ana/posts?tag=biologia&limit=2&offset=2", headers=ana).json()
    assert [p["texto"] for p in resto["items"]] == ["bio 0"]


def test_posts_com_tag_desconhecida_da_422(client, logar):
    ana = logar("ana")
    assert client.get("/usuarios/ana/posts?tag=astrologia", headers=ana).status_code == 422


def test_editar_so_muda_o_que_veio(client, logar):
    ana = logar("ana", "Ana")
    r = client.patch("/usuarios/eu", json={"bio": "terceiro ano"}, headers=ana)
    # devolve o perfil inteiro, já atualizado
    assert r.json()["bio"] == "terceiro ano" and r.json()["meu_perfil"] is True
    client.patch("/usuarios/eu", json={"universidade": "USP"}, headers=ana)

    perfil = client.get("/usuarios/ana", headers=ana).json()
    assert perfil["bio"] == "terceiro ano"
    assert perfil["universidade"] == "USP"
    assert perfil["name"] == "Ana"


def test_editar_recusa_meta_fora_da_lista_e_nome_vazio(client, logar):
    ana = logar("ana")
    assert client.patch("/usuarios/eu", json={"vestibular": "harvard"}, headers=ana).status_code == 422
    assert client.patch("/usuarios/eu", json={"curso": "astronauta"}, headers=ana).status_code == 422
    assert client.patch("/usuarios/eu", json={"name": "   "}, headers=ana).status_code == 422


def test_texto_de_outro_some_quando_a_escolha_muda(client, logar):
    ana = logar("ana")
    client.patch("/usuarios/eu", json={"curso": "outro", "curso_outro": "Geografia"}, headers=ana)
    client.patch("/usuarios/eu", json={"curso": "medicina"}, headers=ana)

    perfil = client.get("/usuarios/ana", headers=ana).json()
    assert perfil["curso"] == "medicina"
    assert perfil["curso_outro"] == ""


def test_rotas_fixas_nao_viram_nome_de_usuario(client, logar):
    ana = logar("ana")
    # /stats continua sendo a rota de estatísticas, não o perfil de "stats"
    assert "usuarios_por_inicial" in client.get("/usuarios/stats", headers=ana).json()


def test_foto_so_aceita_https(client, logar):
    ana = logar("ana")
    for ruim in ("http://exemplo.com/a.png", "javascript:alert(1)", "minha foto"):
        r = client.patch("/usuarios/eu", json={"avatar_url": ruim}, headers=ana)
        assert r.status_code == 422, ruim

    ok = client.patch("/usuarios/eu", json={"avatar_url": "https://exemplo.com/a.png"}, headers=ana)
    assert ok.json()["avatar_url"] == "https://exemplo.com/a.png"
    # "" tira a foto
    assert client.patch("/usuarios/eu", json={"avatar_url": ""}, headers=ana).json()["avatar_url"] == ""
