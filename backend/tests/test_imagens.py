"""Imagem nos posts de matéria (#105, Pessoa A)."""

# Os primeiros bytes de cada formato bastam: o backend reconhece a imagem pela
# assinatura do arquivo, sem abrir a imagem inteira.
JPEG = b"\xff\xd8\xff\xe0" + b"\x00" * 200
PNG = b"\x89PNG\r\n\x1a\n" + b"\x00" * 200


def postar(client, quem, tag="matematica"):
    r = client.post("/posts", json={"texto": "lista de funções resolvida", "tag": tag}, headers=quem)
    assert r.status_code == 201
    return r.json()["id"]


def anexar(client, quem, post_id, dados=JPEG, tipo="image/jpeg"):
    return client.put(
        f"/posts/{post_id}/imagem", content=dados, headers={**quem, "Content-Type": tipo}
    )


def test_anexar_e_ver_a_imagem(client, logar):
    ana, bia = logar("ana"), logar("bia")
    post_id = postar(client, ana)
    assert client.get(f"/posts/{post_id}", headers=ana).json()["tem_imagem"] is False

    assert anexar(client, ana, post_id).status_code == 204

    assert client.get(f"/posts/{post_id}", headers=bia).json()["tem_imagem"] is True
    r = client.get(f"/posts/{post_id}/imagem", headers=bia)
    assert r.status_code == 200
    assert r.content == JPEG
    assert r.headers["content-type"] == "image/jpeg"


def test_tem_imagem_aparece_no_feed(client, logar):
    ana, bia = logar("ana"), logar("bia")
    client.post("/usuarios/ana/follow", headers=bia)
    com, sem = postar(client, ana), postar(client, ana)
    anexar(client, ana, com)

    itens = client.get("/feed", headers=bia).json()["items"]
    tem = {p["id"]: p["tem_imagem"] for p in itens}
    assert tem == {com: True, sem: False}


def test_mandar_outra_troca_a_anterior(client, logar):
    ana = logar("ana")
    post_id = postar(client, ana)
    anexar(client, ana, post_id, JPEG)
    assert anexar(client, ana, post_id, PNG, "image/png").status_code == 204

    r = client.get(f"/posts/{post_id}/imagem", headers=ana)
    assert r.content == PNG
    assert r.headers["content-type"] == "image/png"


def test_so_o_autor_anexa_e_tira(client, logar):
    ana, bia = logar("ana"), logar("bia")
    post_id = postar(client, ana)
    assert anexar(client, bia, post_id).status_code == 403

    anexar(client, ana, post_id)
    assert client.delete(f"/posts/{post_id}/imagem", headers=bia).status_code == 403
    assert client.get(f"/posts/{post_id}", headers=ana).json()["tem_imagem"] is True


def test_tirar_a_imagem(client, logar):
    ana = logar("ana")
    post_id = postar(client, ana)
    anexar(client, ana, post_id)

    assert client.delete(f"/posts/{post_id}/imagem", headers=ana).status_code == 204
    assert client.get(f"/posts/{post_id}", headers=ana).json()["tem_imagem"] is False
    assert client.get(f"/posts/{post_id}/imagem", headers=ana).status_code == 404
    # Tirar de novo não dá erro.
    assert client.delete(f"/posts/{post_id}/imagem", headers=ana).status_code == 204


def test_bate_papo_nao_leva_imagem(client, logar):
    ana = logar("ana")
    post_id = postar(client, ana, tag="bate-papo")
    assert anexar(client, ana, post_id).status_code == 422


def test_so_aceita_imagem_de_verdade(client, logar):
    ana = logar("ana")
    post_id = postar(client, ana)
    # O Content-Type diz imagem, mas os bytes são de outra coisa.
    assert anexar(client, ana, post_id, b"%PDF-1.4 nada de imagem").status_code == 415
    assert anexar(client, ana, post_id, b"").status_code == 422
    assert client.get(f"/posts/{post_id}", headers=ana).json()["tem_imagem"] is False


def test_imagem_grande_demais(client, logar):
    ana = logar("ana")
    post_id = postar(client, ana)
    grande = b"\xff\xd8\xff" + b"\x00" * (600 * 1024)
    assert anexar(client, ana, post_id, grande).status_code == 413


def test_apagar_o_post_apaga_a_imagem(client, logar):
    ana = logar("ana")
    post_id = postar(client, ana)
    anexar(client, ana, post_id)

    assert client.delete(f"/posts/{post_id}", headers=ana).status_code == 204
    assert client.get(f"/posts/{post_id}/imagem", headers=ana).status_code == 404


def test_post_que_nao_existe(client, logar):
    ana = logar("ana")
    assert anexar(client, ana, 999).status_code == 404
    assert client.get("/posts/999/imagem", headers=ana).status_code == 404


def test_sem_login_da_401(client, logar):
    ana = logar("ana")
    post_id = postar(client, ana)
    anexar(client, ana, post_id)
    assert client.get(f"/posts/{post_id}/imagem").status_code == 401
    assert client.put(f"/posts/{post_id}/imagem", content=JPEG).status_code == 401
