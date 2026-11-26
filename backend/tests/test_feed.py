"""Feed (#16, Pessoa D): os filtros do rascunho e o que o núcleo não cobre.

O básico (cronológico, só de quem você segue, paginado) está em
test_nucleo.py::test_feed_cronologico_dos_seguidos.
"""

import pytest


@pytest.fixture()
def feed_da_ana(client, logar):
    """A ana segue a bia, que postou de matéria e de bate-papo. O caio, que a
    ana não segue, também postou. Devolve o header da ana."""
    ana = logar("ana")
    bia = logar("bia")
    caio = logar("caio")
    client.post("/usuarios/bia/follow", headers=ana)

    for texto, tag in [
        ("física", "fisica"),
        ("alguém vai ao simulado?", "bate-papo"),
        ("química", "quimica"),
        ("matemática", "matematica"),
    ]:
        client.post("/posts", json={"texto": texto, "tag": tag}, headers=bia)
    client.post("/posts", json={"texto": "do caio", "tag": "fisica"}, headers=caio)
    # O próprio post não entra: o feed é de quem você segue (decisão 3).
    client.post("/posts", json={"texto": "da ana", "tag": "fisica"}, headers=ana)
    return ana


def _textos(client, ana, query: str = "") -> list[str]:
    r = client.get(f"/feed{query}", headers=ana)
    assert r.status_code == 200, r.text
    return [p["texto"] for p in r.json()["items"]]


def test_sem_filtro_traz_tudo_de_quem_sigo(client, feed_da_ana):
    assert _textos(client, feed_da_ana) == [
        "matemática",
        "química",
        "alguém vai ao simulado?",
        "física",
    ]


def test_esconder_bate_papo(client, feed_da_ana):
    assert _textos(client, feed_da_ana, "?esconder_bate_papo=true") == [
        "matemática",
        "química",
        "física",
    ]


def test_filtro_por_materias_mantem_o_bate_papo(client, feed_da_ana):
    # Como no rascunho: marcar matérias não esconde o bate-papo.
    assert _textos(client, feed_da_ana, "?tag=fisica&tag=quimica") == [
        "química",
        "alguém vai ao simulado?",
        "física",
    ]
    assert _textos(client, feed_da_ana, "?tag=fisica&esconder_bate_papo=true") == ["física"]


def test_total_segue_os_filtros(client, feed_da_ana):
    r = client.get("/feed?esconder_bate_papo=true&limit=1", headers=feed_da_ana)
    assert r.json()["total"] == 3
    assert len(r.json()["items"]) == 1


def test_post_vem_no_formato_do_card(client, feed_da_ana):
    post = client.get("/feed", headers=feed_da_ana).json()["items"][0]
    assert post["autor"]["username"] == "bia"
    assert {"curtidas", "comentarios", "curtido_por_mim", "salvo_por_mim"} <= post.keys()


def test_curtido_por_mim_no_feed(client, feed_da_ana):
    post_id = client.get("/feed", headers=feed_da_ana).json()["items"][0]["id"]
    client.post(f"/posts/{post_id}/curtir", headers=feed_da_ana)
    assert client.get("/feed", headers=feed_da_ana).json()["items"][0]["curtido_por_mim"] is True


def test_feed_vazio_de_quem_nao_segue_ninguem(client, logar):
    novo = logar("novo")
    r = client.get("/feed", headers=novo)
    assert r.status_code == 200
    assert r.json() == {"items": [], "total": 0, "offset": 0, "limit": 20}


def test_deixar_de_seguir_tira_do_feed(client, feed_da_ana):
    client.delete("/usuarios/bia/follow", headers=feed_da_ana)
    assert _textos(client, feed_da_ana) == []


def test_tag_invalida_e_bate_papo_como_materia_dao_422(client, feed_da_ana):
    assert client.get("/feed?tag=xadrez", headers=feed_da_ana).status_code == 422
    assert client.get("/feed?tag=bate-papo", headers=feed_da_ana).status_code == 422


def test_feed_exige_login(client):
    assert client.get("/feed").status_code == 401
