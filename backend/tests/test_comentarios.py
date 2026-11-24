"""Testes dos comentários (#12, Pessoa C), além do test_comentarios_planos_cronologicos do núcleo."""

from sqlalchemy import func, select

from app.db import SessionLocal
from app.models.comment import Comment


def test_comentario_traz_o_autor_e_conta_no_post(client, logar):
    ana = logar("ana")
    bia = logar("bia")
    post_id = client.post("/posts", json={"texto": "travei em logaritmo"}, headers=ana).json()["id"]

    r = client.post(
        f"/posts/{post_id}/comentarios", json={"texto": "tenta pelas propriedades"}, headers=bia
    )
    assert r.status_code == 201
    assert r.json()["autor"]["username"] == "bia"
    assert client.get(f"/posts/{post_id}", headers=ana).json()["comentarios"] == 1


def test_comentarios_paginados(client, logar):
    ana = logar("ana")
    post_id = client.post("/posts", json={"texto": "contem até 5"}, headers=ana).json()["id"]
    for n in range(5):
        client.post(f"/posts/{post_id}/comentarios", json={"texto": str(n)}, headers=ana)

    r = client.get(f"/posts/{post_id}/comentarios?offset=2&limit=2", headers=ana).json()
    assert [c["texto"] for c in r["items"]] == ["2", "3"]
    assert r["total"] == 5


def test_comentario_vazio_e_recusado(client, logar):
    ana = logar("ana")
    post_id = client.post("/posts", json={"texto": "oi"}, headers=ana).json()["id"]
    r = client.post(f"/posts/{post_id}/comentarios", json={"texto": "   "}, headers=ana)
    assert r.status_code == 422


def test_comentar_post_que_nao_existe_da_404(client, logar):
    ana = logar("ana")
    assert client.post("/posts/999/comentarios", json={"texto": "oi"}, headers=ana).status_code == 404
    assert client.get("/posts/999/comentarios", headers=ana).status_code == 404


def test_comentar_exige_login(client, logar):
    ana = logar("ana")
    post_id = client.post("/posts", json={"texto": "oi"}, headers=ana).json()["id"]
    assert client.post(f"/posts/{post_id}/comentarios", json={"texto": "oi"}).status_code == 401


def test_apagar_post_comentado_apaga_os_comentarios(client, logar):
    ana = logar("ana")
    bia = logar("bia")
    post_id = client.post("/posts", json={"texto": "vou apagar"}, headers=bia).json()["id"]
    client.post(f"/posts/{post_id}/comentarios", json={"texto": "boa!"}, headers=ana)

    assert client.delete(f"/posts/{post_id}", headers=bia).status_code == 204
    # o comentário não fica apontando para um post que não existe mais
    with SessionLocal() as db:
        restantes = db.scalar(select(func.count()).select_from(Comment).where(Comment.post_id == post_id))
    assert restantes == 0
