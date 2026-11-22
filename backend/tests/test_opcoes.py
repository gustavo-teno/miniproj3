"""As telas montam os menus com GET /opcoes: as listas precisam bater com o contrato."""


def test_opcoes_trazem_as_listas_do_contrato(client):
    r = client.get("/opcoes")
    assert r.status_code == 200
    corpo = r.json()

    tags = [t["valor"] for t in corpo["tags"]]
    assert len(tags) == 14
    assert "bate-papo" in tags

    vestibulares = [v["valor"] for v in corpo["vestibulares"]]
    cursos = [c["valor"] for c in corpo["cursos"]]
    assert vestibulares[0] == "enem"
    # "outro" também forma turma, e fica por último no menu
    assert vestibulares[-1] == "outro"
    assert cursos[-1] == "outro"
    assert {"valor": "ita-ime", "nome": "ITA/IME"} in corpo["vestibulares"]
