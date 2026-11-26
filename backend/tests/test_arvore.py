"""A árvore dos comentários (core/arvore.py), sem servidor nem banco."""

from dataclasses import dataclass, field

from app.core.arvore import pendurar_respostas


@dataclass
class No:
    id: int
    pai: int | None = None
    filhos: list["No"] = field(default_factory=list)


def _pendurar(raizes, respostas):
    pendurar_respostas(
        raizes, respostas, id_de=lambda n: n.id, pai_de=lambda n: n.pai,
        guardar=lambda n, filhos: setattr(n, "filhos", filhos),
    )


def test_respostas_penduradas_em_varios_niveis_e_na_ordem():
    a, b = No(1), No(2)
    r3, r4, r5 = No(3, pai=1), No(4, pai=3), No(5, pai=1)
    _pendurar([a, b], [r3, r4, r5])
    assert [n.id for n in a.filhos] == [3, 5]
    assert [n.id for n in r3.filhos] == [4]
    assert r4.filhos == [] and b.filhos == []


def test_resposta_de_raiz_fora_da_pagina_nao_aparece():
    a = No(1)
    _pendurar([a], [No(9, pai=7)])
    assert a.filhos == []
