"""Follow (#15, Pessoa D): seguir, deixar de seguir e o estado do botão.

O teste do núcleo (test_follow_unfollow_com_contadores) lê os contadores no
GET /usuarios/{username}, que é do perfil (Pessoa B). Estes testes conferem o
follow pela rota do próprio follow, para valerem antes de o perfil existir.
"""


def test_seguir_e_idempotente(client, logar):
    ana = logar("ana")
    bia = logar("bia")

    assert client.post("/usuarios/bia/follow", headers=ana).status_code == 204
    # seguir de novo não duplica nem dá erro
    assert client.post("/usuarios/bia/follow", headers=ana).status_code == 204

    estado = client.get("/usuarios/bia/follow", headers=ana).json()
    assert estado == {"seguindo": True, "seguidores": 1, "eu_mesmo": False}

    # quem é seguido não passa a seguir de volta sozinho
    assert client.get("/usuarios/ana/follow", headers=bia).json()["seguindo"] is False


def test_deixar_de_seguir_e_idempotente(client, logar):
    ana = logar("ana")
    logar("bia")
    client.post("/usuarios/bia/follow", headers=ana)

    assert client.delete("/usuarios/bia/follow", headers=ana).status_code == 204
    # deixar de seguir quem já não segue também é 204
    assert client.delete("/usuarios/bia/follow", headers=ana).status_code == 204

    estado = client.get("/usuarios/bia/follow", headers=ana).json()
    assert estado["seguindo"] is False
    assert estado["seguidores"] == 0


def test_nao_segue_a_si_mesmo(client, logar):
    ana = logar("ana")

    assert client.post("/usuarios/ana/follow", headers=ana).status_code == 400
    assert client.get("/usuarios/ana/follow", headers=ana).json() == {
        "seguindo": False,
        "seguidores": 0,
        "eu_mesmo": True,
    }


def test_usuario_inexistente_da_404(client, logar):
    ana = logar("ana")

    assert client.post("/usuarios/ninguem/follow", headers=ana).status_code == 404
    assert client.delete("/usuarios/ninguem/follow", headers=ana).status_code == 404
    assert client.get("/usuarios/ninguem/follow", headers=ana).status_code == 404


def test_follow_exige_login(client, logar):
    logar("bia")

    assert client.post("/usuarios/bia/follow").status_code == 401
    assert client.get("/usuarios/bia/follow").status_code == 401
