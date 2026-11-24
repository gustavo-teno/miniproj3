"""Busca de pessoas e de posts (#38, Pessoa A)."""

from app.core.texto import sem_acento


def test_sem_acento_iguala_as_grafias():
    assert sem_acento("Cálculo") == sem_acento("calculo") == sem_acento("CÁLCULO") == "calculo"
    assert sem_acento("Redação nota 1000") == "redacao nota 1000"
    assert sem_acento("") == ""
    assert sem_acento(None) == ""


def postar(client, quem, texto, tag="matematica"):
    r = client.post("/posts", json={"texto": texto, "tag": tag}, headers=quem)
    assert r.status_code == 201


def test_busca_posts_sem_diferenca_de_acento_nem_maiuscula(client, logar):
    ana = logar("ana")
    postar(client, ana, "Cálculo de logaritmo: finalmente entendi")
    postar(client, ana, "Lista de geometria")

    for termo in ("calculo", "CÁLCULO", "Calculo", "LOGARITMO"):
        r = client.get(f"/busca/posts?q={termo}", headers=ana).json()
        assert r["total"] == 1, termo
        assert r["items"][0]["texto"].startswith("Cálculo")

    # e o contrário: o texto sem acento acha o termo com acento
    postar(client, ana, "redacao nota mil")
    assert client.get("/busca/posts?q=redação", headers=ana).json()["total"] == 1


def test_busca_posts_do_mais_novo_e_no_formato_do_card(client, logar):
    ana = logar("ana", "Ana")
    postar(client, ana, "física 1")
    postar(client, ana, "física 2")

    r = client.get("/busca/posts?q=fisica", headers=ana).json()
    assert [p["texto"] for p in r["items"]] == ["física 2", "física 1"]
    assert r["items"][0]["autor"]["name"] == "Ana"


def test_busca_pessoas_pelo_nome_ou_pelo_arroba(client, logar):
    ana = logar("ana_enem", "Ana Júlia")
    logar("bia", "Beatriz Souza")
    logar("joao", "João Pedro")

    pelo_nome = client.get("/busca/pessoas?q=julia", headers=ana).json()
    assert [u["username"] for u in pelo_nome["items"]] == ["ana_enem"]

    pelo_arroba = client.get("/busca/pessoas?q=bia", headers=ana).json()
    assert [u["username"] for u in pelo_arroba["items"]] == ["bia"]

    # "joao" acha "João" pelo nome (e pelo @)
    nomes = [u["name"] for u in client.get("/busca/pessoas?q=joão", headers=ana).json()["items"]]
    assert nomes == ["João Pedro"]

    # uma letra só: quase tudo bateria
    assert client.get("/busca/pessoas?q=j", headers=ana).status_code == 422


def test_busca_pessoas_em_ordem_alfabetica(client, logar):
    ana = logar("ana", "Zuleica Santos")
    logar("bia", "Ágata Santos")
    logar("cris", "Bruno Santos")

    r = client.get("/busca/pessoas?q=santos", headers=ana).json()
    # "Ágata" conta como "agata": vem primeiro, e não no fim por causa do acento
    assert [u["name"] for u in r["items"]] == ["Ágata Santos", "Bruno Santos", "Zuleica Santos"]


def test_curinga_do_like_vira_texto_comum(client, logar):
    ana = logar("ana")
    postar(client, ana, "acertei 100% do simulado")
    postar(client, ana, "acertei 10 questões")

    r = client.get("/busca/posts?q=100%25", headers=ana).json()  # %25 é o % na URL
    assert [p["texto"] for p in r["items"]] == ["acertei 100% do simulado"]
    # "_" também não vira curinga
    assert client.get("/busca/posts?q=a_e", headers=ana).json()["total"] == 0


def test_busca_pagina(client, logar):
    ana = logar("ana")
    for i in range(3):
        postar(client, ana, f"enem {i}")

    r = client.get("/busca/posts?q=enem&limit=2", headers=ana).json()
    assert r["total"] == 3 and len(r["items"]) == 2
    resto = client.get("/busca/posts?q=enem&limit=2&offset=2", headers=ana).json()
    assert [p["texto"] for p in resto["items"]] == ["enem 0"]


def test_busca_exige_login(client):
    assert client.get("/busca/pessoas?q=ana").status_code == 401
    assert client.get("/busca/posts?q=ana").status_code == 401
