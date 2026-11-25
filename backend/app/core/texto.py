"""Texto para busca (#38, Pessoa A). Python puro, sem banco.

sem_acento() deixa duas grafias da mesma palavra iguais: "Cálculo",
"calculo" e "CÁLCULO" viram "calculo". A busca aplica a mesma função no que
a pessoa digitou e, dentro do banco, no texto guardado (ver app/db.py).
"""

import unicodedata


def sem_acento(texto: str | None) -> str:
    """Tira acentos e cedilha e põe tudo em minúsculas. O(n) no tamanho do texto.

    O NFD separa cada letra do seu acento ("á" vira "a" + "´"); os acentos
    soltos (categoria Mn) saem. casefold() é o lower() que também cobre
    letras como o "ß" alemão.
    """
    if not texto:
        return ""
    separado = unicodedata.normalize("NFD", texto)
    return "".join(c for c in separado if unicodedata.category(c) != "Mn").casefold()
