"""Casos de borda da ofensiva (#7, Pessoa A). Python puro, sem servidor.

Os dias são de novembro de 2026: 16/11 é segunda e 22/11 é domingo.
"""

from datetime import date, datetime, timedelta, timezone

from app.core.ofensiva import calcular, dia_em_brasilia


def nov(*dias: int) -> list[date]:
    return [date(2026, 11, d) for d in dias]


SEG, TER, QUA, QUI, SEX, SAB, DOM = range(16, 23)
SEG2, TER2, QUA2 = 23, 24, 25  # semana seguinte


def test_sem_nenhum_estudo():
    o = calcular([], hoje=date(2026, 11, QUA))
    assert (o.atual, o.recorde, o.folgas_usadas_na_semana) == (0, 0, 0)


def test_dias_seguidos_somam():
    o = calcular(nov(SEG, TER, QUA), hoje=date(2026, 11, QUA))
    assert (o.atual, o.recorde) == (3, 3)


def test_varios_posts_no_mesmo_dia_contam_um():
    o = calcular(nov(SEG, SEG, TER), hoje=date(2026, 11, TER))
    assert o.atual == 2


def test_folga_mantem_mas_nao_soma():
    # seg, ter, (qua folga), qui → 3, não 4
    o = calcular(nov(SEG, TER, QUI), hoje=date(2026, 11, QUI))
    assert (o.atual, o.folgas_usadas_na_semana) == (3, 1)


def test_hoje_sem_post_fica_em_aberto():
    # qui de manhã, ainda sem post: nenhuma folga gasta
    o = calcular(nov(SEG, TER, QUA), hoje=date(2026, 11, QUI))
    assert (o.atual, o.folgas_usadas_na_semana) == (3, 0)


def test_dois_dias_seguidos_sem_estudo_ainda_salvam():
    o = calcular(nov(SEG, QUI), hoje=date(2026, 11, QUI))
    assert (o.atual, o.folgas_usadas_na_semana) == (2, 2)


def test_terceiro_dia_seguido_sem_estudo_quebra():
    # seg, (ter, qua, qui sem estudo), sex: a ofensiva recomeça na sexta
    o = calcular(nov(SEG, SEX), hoje=date(2026, 11, SEX))
    assert (o.atual, o.recorde) == (1, 1)


def test_terceira_folga_da_semana_quebra():
    # seg, (ter), qua, (qui), sex, (sab) → a terceira falta da semana quebra
    o = calcular(nov(SEG, QUA, SEX, DOM), hoje=date(2026, 11, DOM))
    assert o.atual == 1
    assert o.recorde == 3  # seg, qua, sex


def test_folgas_renovam_na_segunda():
    # semana 1: faltou ter e qui (2 folgas). Semana 2: faltou ter de novo.
    estudos = nov(SEG, QUA, SEX, SAB, DOM, SEG2, QUA2)
    o = calcular(estudos, hoje=date(2026, 11, QUA2))
    assert (o.atual, o.folgas_usadas_na_semana) == (7, 1)


def test_semana_virando_nao_libera_quatro_dias_parados():
    # estudou até sexta, parou sáb, dom, seg (3 seguidos): quebra, mesmo com a
    # folga da semana nova sobrando
    estudos = nov(SEG, TER, QUA, QUI, SEX, TER2)
    o = calcular(estudos, hoje=date(2026, 11, TER2))
    assert (o.atual, o.recorde) == (1, 5)


def test_segunda_de_manha_comeca_sem_folga_usada():
    # gastou as 2 folgas sáb e dom; segunda cedo, sem post, a semana é nova
    o = calcular(nov(QUA, QUI, SEX), hoje=date(2026, 11, SEG2))
    assert (o.atual, o.folgas_usadas_na_semana) == (3, 0)


def test_ofensiva_quebrada_mostra_zero_e_guarda_o_recorde():
    o = calcular(nov(SEG, TER, QUA), hoje=date(2026, 11, DOM))
    assert (o.atual, o.recorde, o.folgas_usadas_na_semana) == (0, 3, 0)


def test_post_perto_da_meia_noite_e_do_dia_de_brasilia():
    # 23h50 de segunda em Brasília = 02h50 de terça em UTC
    utc = datetime(2026, 11, 17, 2, 50, tzinfo=timezone.utc)
    assert dia_em_brasilia(utc) == date(2026, 11, SEG)
    # o banco devolve sem fuso: é tratado como UTC
    assert dia_em_brasilia(utc.replace(tzinfo=None)) == date(2026, 11, SEG)
    # 00h10 de terça em Brasília já é terça
    assert dia_em_brasilia(utc + timedelta(minutes=20)) == date(2026, 11, TER)
