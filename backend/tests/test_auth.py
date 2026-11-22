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


def test_login_usuario_inexistente_da_o_mesmo_401(client):
    registrar(client)
    errada = client.post("/auth/login", json={"username": "ana", "password": "errada"})
    sumido = client.post("/auth/login", json={"username": "ninguem", "password": SENHA})
    assert errada.status_code == sumido.status_code == 401
    assert errada.json() == sumido.json()


def test_login_de_usuario_sem_senha_da_401_e_nao_500(client):
    # POST /usuarios (slice de exemplo) cria usuário sem senha.
    client.post("/usuarios", json={"username": "semsenha", "name": "Sem Senha"})
    r = client.post("/auth/login", json={"username": "semsenha", "password": SENHA})
    assert r.status_code == 401


def test_cada_login_gera_um_token_diferente(client):
    registrar(client)
    corpo = {"username": "ana", "password": SENHA}
    t1 = client.post("/auth/login", json=corpo).json()["token"]
    t2 = client.post("/auth/login", json=corpo).json()["token"]
    assert t1 != t2


def test_logout_invalida_o_token(client, logar):
    ana = logar("ana")
    assert client.get("/auth/eu", headers=ana).status_code == 200
    assert client.post("/auth/logout", headers=ana).status_code == 204
    assert client.get("/auth/eu", headers=ana).status_code == 401


def test_token_inventado_ou_mal_formatado_da_401(client, logar):
    logar("ana")
    for header in ("Bearer inventado", "inventado", "Bearer ", "Basic abc"):
        assert client.get("/auth/eu", headers={"Authorization": header}).status_code == 401
