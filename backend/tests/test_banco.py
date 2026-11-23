"""Testes do que vale para todas as tabelas e do autor no post (#28, Pessoa A)."""

from datetime import datetime, timedelta, timezone

import pytest
from sqlalchemy import event

from app.db import DataHoraUTC

BRASILIA = timezone(timedelta(hours=-3))


def test_hora_vai_para_o_banco_em_utc():
    # 21h de Brasília é meia-noite em UTC, já no dia seguinte.
    as_21h_em_brasilia = datetime(2026, 11, 22, 21, 0, tzinfo=BRASILIA)
    gravada = DataHoraUTC().process_bind_param(as_21h_em_brasilia, None)
    assert gravada == datetime(2026, 11, 23, 0, 0)


def test_hora_volta_do_banco_marcada_como_utc():
    lida = DataHoraUTC().process_result_value(datetime(2026, 11, 23, 0, 0), None)
    assert lida.tzinfo == timezone.utc


def test_created_at_sai_com_fuso_em_outra_tabela(client):
    # O post já tinha teste (test_posts.py); aqui, a tabela de usuários.
    r = client.post("/usuarios", json={"username": "ana", "name": "Ana"})
    assert r.status_code == 201
    # sem o "Z" (UTC), o navegador erraria a hora em 3 h
    assert r.json()["created_at"].endswith("Z")


@pytest.fixture()
def contar_consultas():
    """Conta as consultas ao banco feitas dentro do bloco `with`."""
    from app.db import engine

    class Contador:
        total = 0

        def __enter__(self):
            event.listen(engine, "before_cursor_execute", self._somar)
            return self

        def __exit__(self, *erro):
            event.remove(engine, "before_cursor_execute", self._somar)

        def _somar(self, *args):
            self.total += 1

    return Contador()


def test_post_traz_o_autor_na_mesma_consulta(client, monkeypatch, contar_consultas):
    monkeypatch.setenv("DEBUG", "true")
    ana = client.post("/usuarios", json={"username": "ana", "name": "Ana"}).json()
    bia = client.post("/usuarios", json={"username": "bia", "name": "Bia"}).json()
    post = client.post(
        "/posts", json={"texto": "funções"}, headers={"X-User-Id": str(ana["id"])}
    ).json()

    with contar_consultas:
        r = client.get(f"/posts/{post['id']}", headers={"X-User-Id": str(bia["id"])})

    assert r.json()["autor"]["username"] == "ana"
    # 1 consulta para saber quem pediu (bia) e 1 para o post com o autor.
    # Antes eram 3: o autor era buscado à parte, um por post.
    assert contar_consultas.total == 2
