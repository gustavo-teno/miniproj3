"""Ofensiva que perdoa (#7, Pessoa A). Decisão 4 do DECISIONS.md.

Python puro: recebe os dias em que a pessoa postou matéria e devolve a
ofensiva atual e o recorde. Nada de banco aqui: quem chama (a rota) busca os
posts e passa só as datas.

As regras:
- Só dia com post de matéria conta (bate-papo não). Vários posts no mesmo dia
  contam como um dia.
- Os dias são do horário de Brasília: um post às 23h50 de lá é daquele dia,
  mesmo que em UTC já seja o dia seguinte.
- Dia sem estudo gasta uma folga automaticamente: a ofensiva continua, mas o
  dia não soma ao número.
- São 2 folgas por semana (segunda a domingo); elas renovam toda segunda.
- No máximo 2 dias seguidos sem estudar: o terceiro quebra a ofensiva, mesmo
  com folga sobrando (decisão do Gustavo em 22/11, para a semana virando não
  permitir 4 dias parados).
- Hoje fica em aberto: se a pessoa ainda não postou, o dia não gasta folga
  nem quebra nada até acabar.
- O recorde é a maior ofensiva que a pessoa já teve, inclusive a atual.

Custo: O(D), em que D é o número de dias entre o primeiro post de matéria e
hoje. Cada dia é olhado uma vez, e "estudou neste dia?" é consulta num set,
O(1).
"""

from collections.abc import Iterable
from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone

FOLGAS_POR_SEMANA = 2
MAX_DIAS_SEGUIDOS_SEM_ESTUDO = 2

# O Brasil não tem horário de verão desde 2019, então Brasília é sempre UTC-3.
# Fuso fixo em vez de zoneinfo: no Windows, zoneinfo precisa de um pacote extra.
BRASILIA = timezone(timedelta(hours=-3), "Brasília")


@dataclass(frozen=True)
class Ofensiva:
    atual: int
    recorde: int
    # Folgas que a ofensiva atual já gastou nesta semana (0 se não há ofensiva).
    folgas_usadas_na_semana: int


def dia_em_brasilia(momento: datetime) -> date:
    """O dia (em Brasília) de um instante. Sem fuso, o instante é tratado como
    UTC, que é como o banco guarda o created_at."""
    if momento.tzinfo is None:
        momento = momento.replace(tzinfo=timezone.utc)
    return momento.astimezone(BRASILIA).date()


def calcular(dias_com_estudo: Iterable[date], hoje: date) -> Ofensiva:
    dias = set(dias_com_estudo)
    if not dias:
        return Ofensiva(atual=0, recorde=0, folgas_usadas_na_semana=0)

    # Hoje sem post ainda está em aberto: a conta vai só até ontem.
    ultimo = hoje if hoje in dias else hoje - timedelta(days=1)

    atual = recorde = 0
    folgas_na_semana = 0
    sem_estudo_seguidos = 0

    dia = min(dias)
    while dia <= ultimo:
        if dia.weekday() == 0:  # segunda: as folgas renovam
            folgas_na_semana = 0

        if dia in dias:
            atual += 1
            sem_estudo_seguidos = 0
            recorde = max(recorde, atual)
        elif atual > 0:
            # Só gasta folga quem tem ofensiva para proteger.
            sem_estudo_seguidos += 1
            if (
                folgas_na_semana < FOLGAS_POR_SEMANA
                and sem_estudo_seguidos <= MAX_DIAS_SEGUIDOS_SEM_ESTUDO
            ):
                folgas_na_semana += 1
            else:
                atual = 0
                sem_estudo_seguidos = 0

        dia += timedelta(days=1)

    # Segunda de manhã sem post: a conta parou no domingo, mas a semana de
    # hoje já começou com as folgas zeradas.
    segunda_desta_semana = hoje - timedelta(days=hoje.weekday())
    if ultimo < segunda_desta_semana:
        folgas_na_semana = 0
    folgas = folgas_na_semana if atual > 0 else 0
    return Ofensiva(atual=atual, recorde=recorde, folgas_usadas_na_semana=folgas)
