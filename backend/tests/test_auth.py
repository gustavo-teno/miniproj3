"""Testes da auth além do núcleo (#6, Pessoa A)."""

SENHA = "senha-forte-123"


def registrar(client, **extra):
    corpo = {"username": "ana", "name": "Ana", "password": SENHA, **extra}
    return client.post("/auth/registro", json=corpo)


def test_registro_recusa_usernames_reservados(client):
    # "eu" e "stats" são caminhos fixos de /usuarios.
    for nome in ("eu", "stats"):
        assert registrar(client, username=nome).status_code == 422


def test_registro_recusa_senha_curta(client):
    assert registrar(client, password="curta").status_code == 422


def test_registro_aceita_a_meta(client):
    r = registrar(client, vestibular="enem", curso="medicina", universidade="UFPB")
    assert r.status_code == 201


def test_registro_recusa_meta_fora_da_lista(client):
    assert registrar(client, vestibular="vestibular-inventado").status_code == 422
    assert registrar(client, curso="astronauta").status_code == 422


def test_registro_guarda_texto_de_outro_so_com_outro(client):
    from app.db import SessionLocal
    from app.models.user import User

    registrar(client, vestibular="enem", vestibular_outro="ignorado")
    registrar(client, username="bia", vestibular="outro", vestibular_outro="UFPE")
    with SessionLocal() as db:
        ana = db.query(User).filter_by(username="ana").one()
        bia = db.query(User).filter_by(username="bia").one()
    assert ana.vestibular_outro == ""
    assert bia.vestibular_outro == "UFPE"
    # a senha vira hash, nunca é guardada como foi digitada
    assert bia.password_hash.startswith("$2") and SENHA not in bia.password_hash
