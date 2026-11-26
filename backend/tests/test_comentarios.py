"""Testes dos comentários (#12, Pessoa C), além do test_comentarios_planos_cronologicos do núcleo."""

from sqlalchemy import func, select

from app.db import SessionLocal
from app.models.comment import Comment
from app.models.curtida_comentario import CurtidaComentario


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


# ---------- RESPOSTAS (comentários em árvore, CONTRATO.md) ----------


def _post_com_comentario(client, logar):
    ana, bia = logar("ana"), logar("bia")
    post_id = client.post("/posts", json={"texto": "travei em física"}, headers=ana).json()["id"]
    pai = client.post(f"/posts/{post_id}/comentarios", json={"texto": "qual parte?"}, headers=bia).json()
    return ana, bia, post_id, pai["id"]


def test_responder_um_comentario_vem_dentro_dele(client, logar):
    ana, bia, post_id, pai_id = _post_com_comentario(client, logar)
    r = client.post(f"/posts/{post_id}/comentarios",
                    json={"texto": "cinemática", "parent_id": pai_id}, headers=ana)
    assert r.status_code == 201
    assert r.json()["parent_id"] == pai_id
    neto = r.json()["id"]
    client.post(f"/posts/{post_id}/comentarios", json={"texto": "MRUV?", "parent_id": neto}, headers=bia)
    client.post(f"/posts/{post_id}/comentarios", json={"texto": "valeu", "parent_id": pai_id}, headers=bia)

    pagina = client.get(f"/posts/{post_id}/comentarios", headers=ana).json()
    # A página conta só as raízes; as respostas vêm dentro, em ordem cronológica.
    assert pagina["total"] == 1
    assert pagina["total_com_respostas"] == 4
    [raiz] = pagina["items"]
    assert [c["texto"] for c in raiz["respostas"]] == ["cinemática", "valeu"]
    assert [c["texto"] for c in raiz["respostas"][0]["respostas"]] == ["MRUV?"]
    # O post conta todos, respostas incluídas.
    assert client.get(f"/posts/{post_id}", headers=ana).json()["comentarios"] == 4


def test_responder_comentario_inexistente_ou_de_outro_post_da_404(client, logar):
    ana, _bia, post_id, pai_id = _post_com_comentario(client, logar)
    outro = client.post("/posts", json={"texto": "outro post"}, headers=ana).json()["id"]
    r = client.post(f"/posts/{outro}/comentarios", json={"texto": "oi", "parent_id": pai_id}, headers=ana)
    assert r.status_code == 404
    r = client.post(f"/posts/{post_id}/comentarios", json={"texto": "oi", "parent_id": 999}, headers=ana)
    assert r.status_code == 404


# ---------- CURTIR COMENTÁRIO ----------


def test_curtir_e_descurtir_comentario(client, logar):
    ana, bia, post_id, pai_id = _post_com_comentario(client, logar)
    url = f"/posts/{post_id}/comentarios/{pai_id}/curtir"
    assert client.post(url, headers=ana).status_code == 204
    assert client.post(url, headers=ana).status_code == 204  # de novo não conta duas vezes

    [c] = client.get(f"/posts/{post_id}/comentarios", headers=ana).json()["items"]
    assert (c["curtidas"], c["curtido_por_mim"]) == (1, True)
    [c] = client.get(f"/posts/{post_id}/comentarios", headers=bia).json()["items"]
    assert (c["curtidas"], c["curtido_por_mim"]) == (1, False)

    assert client.delete(url, headers=ana).status_code == 204
    [c] = client.get(f"/posts/{post_id}/comentarios", headers=ana).json()["items"]
    assert (c["curtidas"], c["curtido_por_mim"]) == (0, False)


def test_curtir_resposta_marca_dentro_da_arvore(client, logar):
    ana, bia, post_id, pai_id = _post_com_comentario(client, logar)
    resposta = client.post(f"/posts/{post_id}/comentarios",
                           json={"texto": "cinemática", "parent_id": pai_id}, headers=ana).json()["id"]
    client.post(f"/posts/{post_id}/comentarios/{resposta}/curtir", headers=bia)
    [raiz] = client.get(f"/posts/{post_id}/comentarios", headers=bia).json()["items"]
    assert raiz["respostas"][0]["curtido_por_mim"] is True


def test_curtir_comentario_de_outro_post_da_404(client, logar):
    ana, _bia, _post_id, pai_id = _post_com_comentario(client, logar)
    outro = client.post("/posts", json={"texto": "outro post"}, headers=ana).json()["id"]
    assert client.post(f"/posts/{outro}/comentarios/{pai_id}/curtir", headers=ana).status_code == 404
    assert client.delete(f"/posts/{outro}/comentarios/999/curtir", headers=ana).status_code == 404


def test_apagar_post_apaga_respostas_e_curtidas_dos_comentarios(client, logar):
    ana, bia, post_id, pai_id = _post_com_comentario(client, logar)
    client.post(f"/posts/{post_id}/comentarios", json={"texto": "oi", "parent_id": pai_id}, headers=bia)
    client.post(f"/posts/{post_id}/comentarios/{pai_id}/curtir", headers=ana)

    assert client.delete(f"/posts/{post_id}", headers=ana).status_code == 204
    with SessionLocal() as db:
        assert db.scalar(select(func.count()).select_from(Comment)) == 0
        assert db.scalar(select(func.count()).select_from(CurtidaComentario)) == 0


# ---------- VER CONVERSA ----------


def test_ver_conversa_traz_o_comentario_com_toda_a_arvore(client, logar):
    ana, bia, post_id, pai_id = _post_com_comentario(client, logar)
    url = f"/posts/{post_id}/comentarios"
    filho = client.post(url, json={"texto": "a", "parent_id": pai_id}, headers=ana).json()["id"]
    neto = client.post(url, json={"texto": "b", "parent_id": filho}, headers=bia).json()["id"]
    client.post(url, json={"texto": "c", "parent_id": neto}, headers=ana)
    client.post(f"{url}/{neto}/curtir", headers=bia)
    # Outro comentário do post não entra na conversa.
    client.post(url, json={"texto": "solto"}, headers=ana)

    r = client.get(f"{url}/{pai_id}", headers=bia)
    assert r.status_code == 200
    c = r.json()
    assert c["texto"] == "qual parte?"
    assert c["respostas"][0]["texto"] == "a"
    neto_json = c["respostas"][0]["respostas"][0]
    assert (neto_json["texto"], neto_json["curtido_por_mim"]) == ("b", True)
    assert neto_json["respostas"][0]["texto"] == "c"

    # Abrir a conversa a partir de uma resposta também funciona.
    assert client.get(f"{url}/{neto}", headers=ana).json()["respostas"][0]["texto"] == "c"


def test_ver_conversa_de_outro_post_ou_inexistente_da_404(client, logar):
    ana, _bia, post_id, pai_id = _post_com_comentario(client, logar)
    outro = client.post("/posts", json={"texto": "outro post"}, headers=ana).json()["id"]
    assert client.get(f"/posts/{outro}/comentarios/{pai_id}", headers=ana).status_code == 404
    assert client.get(f"/posts/{post_id}/comentarios/999", headers=ana).status_code == 404
    assert client.get(f"/posts/{post_id}/comentarios/{pai_id}").status_code == 401


def test_respostas_param_no_limite_de_profundidade(client, logar):
    from app.services.comentarios import PROFUNDIDADE_MAXIMA

    ana, _bia, post_id, pai_id = _post_com_comentario(client, logar)
    url = f"/posts/{post_id}/comentarios"
    # O comentário direto é o nível 1; as respostas vão até o último nível permitido.
    for _ in range(PROFUNDIDADE_MAXIMA - 1):
        r = client.post(url, json={"texto": "mais uma", "parent_id": pai_id}, headers=ana)
        assert r.status_code == 201
        pai_id = r.json()["id"]

    r = client.post(url, json={"texto": "funda demais", "parent_id": pai_id}, headers=ana)
    assert r.status_code == 422
    assert "limite" in r.json()["detail"]
