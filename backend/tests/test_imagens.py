"""Imagem nos posts de matéria (#105, Pessoa A)."""

from app.services.imagens import dimensoes

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


def test_virar_bate_papo_tira_a_imagem(client, logar):
    ana = logar("ana")
    post_id = postar(client, ana)
    anexar(client, ana, post_id)

    r = client.patch(f"/posts/{post_id}", json={"tag": "bate-papo"}, headers=ana)
    assert r.status_code == 200
    assert r.json()["tem_imagem"] is False
    assert client.get(f"/posts/{post_id}/imagem", headers=ana).status_code == 404


def test_editar_o_texto_mantem_a_imagem(client, logar):
    ana = logar("ana")
    post_id = postar(client, ana)
    anexar(client, ana, post_id)

    r = client.patch(f"/posts/{post_id}", json={"texto": "lista revisada"}, headers=ana)
    assert r.json()["tem_imagem"] is True


def test_imagem_vai_com_nosniff(client, logar):
    ana = logar("ana")
    post_id = postar(client, ana)
    anexar(client, ana, post_id)
    r = client.get(f"/posts/{post_id}/imagem", headers=ana)
    assert r.headers["x-content-type-options"] == "nosniff"


# O tamanho da imagem (#127). Um JPEG com um bloco APP0 antes do SOF (como os
# de verdade) e um PNG com o IHDR, só com os cabeçalhos.
def jpeg_de(largura, altura):
    app0 = b"\xff\xe0" + (16).to_bytes(2, "big") + b"JFIF\x00" + b"\x00" * 9
    sof = b"\xff\xc0" + (17).to_bytes(2, "big") + b"\x08" + altura.to_bytes(2, "big") + largura.to_bytes(2, "big")
    return b"\xff\xd8" + app0 + sof + b"\x00" * 100


def png_de(largura, altura):
    return b"\x89PNG\r\n\x1a\n" + (13).to_bytes(4, "big") + b"IHDR" + largura.to_bytes(4, "big") + altura.to_bytes(4, "big")


def test_dimensoes_le_o_cabecalho():
    assert dimensoes(jpeg_de(1200, 1800)) == (1200, 1800)
    assert dimensoes(png_de(648, 610)) == (648, 610)
    # Cortado no meio do cabeçalho, ou sem SOF: não dá para saber.
    assert dimensoes(jpeg_de(1200, 1800)[:20]) is None
    assert dimensoes(JPEG) is None


def test_tamanho_da_imagem_vem_no_post(client, logar):
    ana, bia = logar("ana"), logar("bia")
    client.post("/usuarios/ana/follow", headers=bia)
    em_pe, sem_tamanho, sem_imagem = postar(client, ana), postar(client, ana), postar(client, ana)
    anexar(client, ana, em_pe, dados=jpeg_de(1200, 1800))
    anexar(client, ana, sem_tamanho)

    itens = {p["id"]: p for p in client.get("/feed", headers=bia).json()["items"]}
    tamanho = {i: (p["imagem_largura"], p["imagem_altura"]) for i, p in itens.items()}
    assert tamanho == {em_pe: (1200, 1800), sem_tamanho: (None, None), sem_imagem: (None, None)}

    # Trocar a imagem troca o tamanho junto.
    anexar(client, ana, em_pe, dados=png_de(800, 600))
    p = client.get(f"/posts/{em_pe}", headers=bia).json()
    assert (p["imagem_largura"], p["imagem_altura"]) == (800, 600)
