"""Testes das curtidas (#11, Pessoa C), além do test_curtidas_idempotentes do núcleo."""

from sqlalchemy import func, select

from app.db import SessionLocal
from app.models.like import Like
from app.services import curtidas


def _curtidas_no_banco(post_id: int) -> int:
    with SessionLocal() as db:
        return db.scalar(select(func.count()).select_from(Like).where(Like.post_id == post_id))


def test_curtido_por_mim_depende_de_quem_ve(client, logar):
    ana = logar("ana")
    bia = logar("bia")
    post_id = client.post("/posts", json={"texto": "2 h de óptica"}, headers=bia).json()["id"]

    r = client.post(f"/posts/{post_id}/curtir", headers=ana)
    assert r.status_code == 204

    # a ana curtiu; a bia vê a mesma contagem, mas não curtiu
    assert client.get(f"/posts/{post_id}", headers=ana).json()["curtido_por_mim"] is True
    post_da_bia = client.get(f"/posts/{post_id}", headers=bia).json()
    assert post_da_bia["curtidas"] == 1
    assert post_da_bia["curtido_por_mim"] is False


def test_descurtir_sem_ter_curtido_nao_da_erro(client, logar):
    ana = logar("ana")
    post_id = client.post("/posts", json={"texto": "redação nota 900"}, headers=ana).json()["id"]

    assert client.delete(f"/posts/{post_id}/curtir", headers=ana).status_code == 204
    assert client.get(f"/posts/{post_id}", headers=ana).json()["curtidas"] == 0


def test_curtir_post_que_nao_existe_da_404(client, logar):
    ana = logar("ana")
    assert client.post("/posts/999/curtir", headers=ana).status_code == 404


def test_curtir_exige_login(client, logar):
    bia = logar("bia")
    post_id = client.post("/posts", json={"texto": "curte aí"}, headers=bia).json()["id"]
    assert client.post(f"/posts/{post_id}/curtir").status_code == 401


def test_apagar_post_curtido_apaga_as_curtidas(client, logar):
    ana = logar("ana")
    bia = logar("bia")
    post_id = client.post("/posts", json={"texto": "vou apagar"}, headers=bia).json()["id"]
    client.post(f"/posts/{post_id}/curtir", headers=ana)

    assert client.delete(f"/posts/{post_id}", headers=bia).status_code == 204
    assert client.get(f"/posts/{post_id}", headers=ana).status_code == 404
    # a curtida não fica apontando para um post que não existe mais
    assert _curtidas_no_banco(post_id) == 0


def test_curtidas_ao_mesmo_tempo_nao_dao_erro(client, logar, monkeypatch):
    ana = logar("ana")
    bia = logar("bia")
    post_id = client.post("/posts", json={"texto": "curte aí"}, headers=bia).json()["id"]
    client.post(f"/posts/{post_id}/curtir", headers=ana)

    # Imita o segundo de dois pedidos simultâneos: ele não vê a curtida do
    # primeiro na conferência e tenta gravar de novo.
    monkeypatch.setattr(curtidas, "_ja_curtiu", lambda *args: False)
    assert client.post(f"/posts/{post_id}/curtir", headers=ana).status_code == 204
    assert _curtidas_no_banco(post_id) == 1
