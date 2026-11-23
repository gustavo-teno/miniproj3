"""Casos de borda da ofensiva (#7, Pessoa A). Python puro, sem servidor.

Os dias são de novembro de 2026: 16/11 é segunda e 22/11 é domingo.
"""

from datetime import date, datetime, timedelta, timezone

from app.core.ofensiva import (
    Ofensiva,
    ResumoSemana,
    calcular,
    dia_em_brasilia,
    hoje_em_brasilia,
    resumo_da_semana,
)


def nov(*dias: int) -> list[date]:
    return [date(2026, 11, d) for d in dias]


SEG, TER, QUA, QUI, SEX, SAB, DOM = range(16, 23)
SEG2, TER2, QUA2 = 23, 24, 25  # semana seguinte


def test_sem_nenhum_estudo():
    ofensiva = calcular([], hoje=date(2026, 11, QUA))
    assert ofensiva == Ofensiva(atual=0, recorde=0, folgas_usadas_na_semana=0)


def test_dias_seguidos_somam():
    ofensiva = calcular(nov(SEG, TER, QUA), hoje=date(2026, 11, QUA))
    assert (ofensiva.atual, ofensiva.recorde) == (3, 3)


def test_varios_posts_no_mesmo_dia_contam_um():
    ofensiva = calcular(nov(SEG, SEG, TER), hoje=date(2026, 11, TER))
    assert ofensiva.atual == 2


def test_folga_mantem_mas_nao_soma():
    # seg, ter, (qua folga), qui → 3, não 4
    ofensiva = calcular(nov(SEG, TER, QUI), hoje=date(2026, 11, QUI))
    assert (ofensiva.atual, ofensiva.folgas_usadas_na_semana) == (3, 1)


def test_hoje_sem_post_fica_em_aberto():
    # qui de manhã, ainda sem post: nenhuma folga gasta
    ofensiva = calcular(nov(SEG, TER, QUA), hoje=date(2026, 11, QUI))
    assert (ofensiva.atual, ofensiva.folgas_usadas_na_semana) == (3, 0)


def test_dois_dias_seguidos_sem_estudo_ainda_salvam():
    ofensiva = calcular(nov(SEG, QUI), hoje=date(2026, 11, QUI))
    assert (ofensiva.atual, ofensiva.folgas_usadas_na_semana) == (2, 2)


def test_terceiro_dia_seguido_sem_estudo_quebra():
    # seg, (ter, qua, qui sem estudo), sex: a ofensiva recomeça na sexta
    ofensiva = calcular(nov(SEG, SEX), hoje=date(2026, 11, SEX))
    assert (ofensiva.atual, ofensiva.recorde) == (1, 1)


def test_terceira_folga_da_semana_quebra():
    # seg, (ter), qua, (qui), sex, (sab) → a terceira falta da semana quebra
    ofensiva = calcular(nov(SEG, QUA, SEX, DOM), hoje=date(2026, 11, DOM))
    assert ofensiva.atual == 1
    assert ofensiva.recorde == 3  # seg, qua, sex


def test_folgas_renovam_na_segunda():
    # semana 1: faltou ter e qui (2 folgas). Semana 2: faltou ter de novo.
    estudos = nov(SEG, QUA, SEX, SAB, DOM, SEG2, QUA2)
    ofensiva = calcular(estudos, hoje=date(2026, 11, QUA2))
    assert (ofensiva.atual, ofensiva.folgas_usadas_na_semana) == (7, 1)


def test_semana_virando_nao_libera_quatro_dias_parados():
    # estudou até sexta, parou sáb, dom, seg (3 seguidos): quebra, mesmo com a
    # folga da semana nova sobrando
    estudos = nov(SEG, TER, QUA, QUI, SEX, TER2)
    ofensiva = calcular(estudos, hoje=date(2026, 11, TER2))
    assert (ofensiva.atual, ofensiva.recorde) == (1, 5)


def test_segunda_de_manha_comeca_sem_folga_usada():
    # gastou as 2 folgas sáb e dom; segunda cedo, sem post, a semana é nova
    ofensiva = calcular(nov(QUA, QUI, SEX), hoje=date(2026, 11, SEG2))
    assert (ofensiva.atual, ofensiva.folgas_usadas_na_semana) == (3, 0)


def test_ofensiva_quebrada_mostra_zero_e_guarda_o_recorde():
    ofensiva = calcular(nov(SEG, TER, QUA), hoje=date(2026, 11, DOM))
    assert ofensiva == Ofensiva(atual=0, recorde=3, folgas_usadas_na_semana=0)


def test_post_perto_da_meia_noite_e_do_dia_de_brasilia():
    # 23h50 de segunda em Brasília = 02h50 de terça em UTC
    utc = datetime(2026, 11, 17, 2, 50, tzinfo=timezone.utc)
    assert dia_em_brasilia(utc) == date(2026, 11, SEG)
    # o banco devolve sem fuso: é tratado como UTC
    assert dia_em_brasilia(utc.replace(tzinfo=None)) == date(2026, 11, SEG)
    # 00h10 de terça em Brasília já é terça
    assert dia_em_brasilia(utc + timedelta(minutes=20)) == date(2026, 11, TER)


def test_ofensiva_nova_nao_herda_folgas_da_que_quebrou():
    # seg, (ter, qua, qui: quebra na qui), sex recomeça, (sáb folga), dom
    ofensiva = calcular(nov(SEG, SEX, DOM), hoje=date(2026, 11, DOM))
    assert (ofensiva.atual, ofensiva.folgas_usadas_na_semana) == (2, 1)


def test_precisa_estudar_hoje_sem_folga_sobrando():
    # faltou só ter: quinta de manhã ainda sobra 1 folga
    ofensiva = calcular(nov(SEG, QUA), hoje=date(2026, 11, QUI))
    assert ofensiva.precisa_estudar_hoje is False
    # faltou ter e qui: sexta de manhã, sem folga, precisa postar
    ofensiva = calcular(nov(SEG, QUA), hoje=date(2026, 11, SEX))
    assert ofensiva.precisa_estudar_hoje is True


def test_segunda_depois_de_dois_dias_parados_precisa_estudar():
    # faltou sáb e dom: segunda tem folga nova, mas seria o 3º dia seguido
    ofensiva = calcular(nov(QUA, QUI, SEX), hoje=date(2026, 11, SEG2))
    assert ofensiva.folgas_usadas_na_semana == 0
    assert ofensiva.precisa_estudar_hoje is True


def test_quem_ja_postou_hoje_nao_precisa_estudar():
    ofensiva = calcular(nov(SEG, QUA, SEX, SAB), hoje=date(2026, 11, SAB))
    assert ofensiva.precisa_estudar_hoje is False


def test_hoje_em_brasilia_nao_usa_o_dia_do_servidor():
    # 22h de domingo em Brasília = 01h de segunda em UTC
    agora = datetime(2026, 11, 23, 1, 0, tzinfo=timezone.utc)
    assert hoje_em_brasilia(agora) == date(2026, 11, DOM)


def test_resumo_soma_esta_semana_e_a_passada():
    sessoes = [
        (date(2026, 11, SEG), 60),
        (date(2026, 11, DOM), 30),  # domingo ainda é da semana passada
        (date(2026, 11, SEG2), 90),  # segunda já é desta
        (date(2026, 11, TER2), None),  # post sem duração soma zero
        (date(2026, 11, 9), 500),  # duas semanas atrás: fica de fora
    ]
    resumo = resumo_da_semana(sessoes, hoje=date(2026, 11, TER2))
    assert resumo == ResumoSemana(minutos_esta_semana=90, minutos_semana_passada=90)


# --- A rota GET /usuarios/{username}/ofensiva -------------------------------
# Usa a fixture logar do conftest.py: cria a conta e entra de verdade.


def postar(client, quem, tag, minutos=None):
    corpo = {"texto": "estudei", "tag": tag, "minutos": minutos}
    assert client.post("/posts", json=corpo, headers=quem).status_code == 201


def test_rota_conta_post_de_materia_de_hoje(client, logar):
    ana = logar("ana")
    postar(client, ana, "fisica", minutos=45)
    postar(client, ana, "quimica", minutos=30)

    r = client.get("/usuarios/ana/ofensiva", headers=ana)
    assert r.status_code == 200
    corpo = r.json()
    assert corpo["atual"] == 1  # dois posts no mesmo dia contam um
    assert corpo["recorde"] == 1
    assert corpo["folgas_por_semana"] == 2
    assert corpo["minutos_esta_semana"] == 75
    assert corpo["minutos_semana_passada"] == 0


def test_rota_bate_papo_nao_conta(client, logar):
    ana = logar("ana")
    postar(client, ana, "bate-papo", minutos=60)

    corpo = client.get("/usuarios/ana/ofensiva", headers=ana).json()
    assert corpo["atual"] == 0
    assert corpo["minutos_esta_semana"] == 0


def test_rota_mostra_a_ofensiva_de_outra_pessoa(client, logar):
    ana, bia = logar("ana"), logar("bia")
    postar(client, bia, "historia")
    assert client.get("/usuarios/bia/ofensiva", headers=ana).json()["atual"] == 1


def test_rota_semana_passada(client, logar, monkeypatch):
    """Os posts de hoje viram "semana passada" quando hoje é daqui a 7 dias."""
    ana = logar("ana")
    postar(client, ana, "redacao", minutos=50)

    daqui_a_uma_semana = hoje_em_brasilia() + timedelta(days=7)
    monkeypatch.setattr(
        "app.services.ofensiva.calculo.hoje_em_brasilia", lambda: daqui_a_uma_semana
    )
    corpo = client.get("/usuarios/ana/ofensiva", headers=ana).json()
    assert corpo["minutos_semana_passada"] == 50
    assert corpo["minutos_esta_semana"] == 0
    assert corpo["atual"] == 0  # 6 dias sem estudo quebraram
    assert corpo["recorde"] == 1


def test_rota_usuario_que_nao_existe(client, logar):
    r = client.get("/usuarios/ninguem/ofensiva", headers=logar("ana"))
    assert r.status_code == 404


def test_rota_exige_login(client):
    assert client.get("/usuarios/ana/ofensiva").status_code == 401
