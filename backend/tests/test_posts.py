"""Testes dos posts (#9, Pessoa B).

Usam o atalho de desenvolvimento (DEBUG=true + header X-User-Id) para não
depender do login. O test_posts_crud do núcleo confere o mesmo caminho com a
auth de verdade, quando ela existir.
"""

import pytest


@pytest.fixture()
def como(client, monkeypatch):
    """Fábrica: cria um usuário e devolve o header para agir como ele."""
    monkeypatch.setenv("DEBUG", "true")

    def _como(username: str) -> dict:
        r = client.post("/usuarios", json={"username": username, "name": username})
        assert r.status_code == 201
        return {"X-User-Id": str(r.json()["id"])}

    return _como


def test_criar_post_com_tag_e_duracao(client, como):
    ana = como("ana")
    r = client.post(
        "/posts",
        json={"texto": "2 h de funções", "tag": "matematica", "minutos": 120},
        headers=ana,
    )
    assert r.status_code == 201
    post = r.json()
    assert post["tag"] == "matematica"
    assert post["minutos"] == 120
    # o card mostra o autor sem precisar de outra chamada
    assert post["autor"]["username"] == "ana"
    # a data sai em UTC; sem o "Z", o navegador erraria a hora em 3 h
    assert post["created_at"].endswith("Z")


def test_tag_e_duracao_tem_padrao(client, como):
    r = client.post("/posts", json={"texto": "oi, turma"}, headers=como("ana"))
    assert r.status_code == 201
    assert r.json()["tag"] == "bate-papo"
    assert r.json()["minutos"] is None


@pytest.mark.parametrize(
    "corpo",
    [
        {"texto": "x", "tag": "astrologia"},  # tag fora da lista do contrato
        {"texto": "   "},  # só espaços
        {"texto": ""},
        {"texto": "x", "minutos": 0},
        {"texto": "x", "minutos": 1441},  # mais de 24 h
    ],
)
def test_post_invalido_e_recusado(client, como, corpo):
    assert client.post("/posts", json=corpo, headers=como("ana")).status_code == 422


def test_postar_exige_login(client, como):
    como("ana")  # liga o DEBUG, mas sem mandar o header
    assert client.post("/posts", json={"texto": "x"}).status_code == 401


def test_editar_muda_so_o_que_veio(client, como):
    ana = como("ana")
    post_id = client.post(
        "/posts",
        json={"texto": "antes", "tag": "fisica", "minutos": 30},
        headers=ana,
    ).json()["id"]

    r = client.patch(f"/posts/{post_id}", json={"texto": "depois"}, headers=ana)
    assert r.status_code == 200
    assert r.json()["texto"] == "depois"
    assert r.json()["tag"] == "fisica"
    assert r.json()["minutos"] == 30

    # minutos: null tira a duração
    r = client.patch(f"/posts/{post_id}", json={"minutos": None}, headers=ana)
    assert r.json()["minutos"] is None


@pytest.mark.parametrize(
    "corpo",
    [
        {"tag": "astrologia"},  # a edição usa a mesma lista do contrato
        {"texto": "   "},
        {"minutos": 0},
    ],
)
def test_edicao_invalida_e_recusada(client, como, corpo):
    ana = como("ana")
    post_id = client.post(
        "/posts", json={"texto": "antes", "tag": "fisica"}, headers=ana
    ).json()["id"]

    r = client.patch(f"/posts/{post_id}", json=corpo, headers=ana)
    assert r.status_code == 422
    # e o post continua como estava
    post = client.get(f"/posts/{post_id}", headers=ana).json()
    assert post["texto"] == "antes"
    assert post["tag"] == "fisica"


def test_so_o_autor_edita_e_apaga(client, como):
    ana, bia = como("ana"), como("bia")
    post_id = client.post("/posts", json={"texto": "meu"}, headers=ana).json()["id"]

    assert client.get(f"/posts/{post_id}", headers=bia).status_code == 200
    r = client.patch(f"/posts/{post_id}", json={"texto": "invadi"}, headers=bia)
    assert r.status_code == 403
    assert client.delete(f"/posts/{post_id}", headers=bia).status_code == 403
    assert client.get(f"/posts/{post_id}", headers=ana).json()["texto"] == "meu"


def test_apagar_leva_curtidas_e_comentarios(client, como):
    from app.db import SessionLocal
    from app.models.comment import Comment
    from app.models.like import Like

    ana, bia = como("ana"), como("bia")
    post_id = client.post("/posts", json={"texto": "x"}, headers=ana).json()["id"]
    bia_id = int(bia["X-User-Id"])

    # As rotas de curtir e comentar são da Pessoa C e ainda não existem:
    # por isso as linhas entram direto no banco.
    with SessionLocal() as db:
        db.add_all(
            [
                Like(user_id=bia_id, post_id=post_id),
                Comment(autor_id=bia_id, post_id=post_id, texto="boa!"),
            ]
        )
        db.commit()

    assert client.delete(f"/posts/{post_id}", headers=ana).status_code == 204
    assert client.get(f"/posts/{post_id}", headers=ana).status_code == 404
    with SessionLocal() as db:
        assert db.query(Like).filter_by(post_id=post_id).count() == 0
        assert db.query(Comment).filter_by(post_id=post_id).count() == 0


def test_post_que_nao_existe_da_404(client, como):
    ana = como("ana")
    assert client.get("/posts/999", headers=ana).status_code == 404
    r = client.patch("/posts/999", json={"texto": "x"}, headers=ana)
    assert r.status_code == 404
    assert client.delete("/posts/999", headers=ana).status_code == 404
