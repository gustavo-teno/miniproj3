"""Comentários em árvore (Pessoa C): Python puro, sem banco.

A conversa de um post é uma floresta: cada comentário direto no post é uma
raiz, e cada resposta é filha do comentário que ela responde. O service busca
as respostas do post numa consulta só e esta função pendura cada uma no pai,
recursivamente.

Big O: O(n) no número de respostas do post. Um dict de filhos por pai é
montado numa passada, e a recursão visita cada comentário uma vez. A árvore
é montada a cada pedido (ver DECISIONS.md): a conversa de um post é pequena,
e assim ela nunca fica desatualizada.
"""

from collections import defaultdict
from collections.abc import Callable, Iterable
from typing import TypeVar

T = TypeVar("T")


def pendurar_respostas(
    raizes: Iterable[T],
    respostas: Iterable[T],
    id_de: Callable[[T], int],
    pai_de: Callable[[T], int | None],
    guardar: Callable[[T, list[T]], None],
) -> None:
    """Dá a cada raiz (e a cada resposta) a lista das respostas dela, na ordem
    em que `respostas` vieram: se vierem em ordem cronológica, cada nível da
    árvore fica em ordem cronológica."""
    filhos: dict[int, list[T]] = defaultdict(list)
    for resposta in respostas:
        pai = pai_de(resposta)
        if pai is not None:
            filhos[pai].append(resposta)

    def pendurar(comentario: T) -> None:
        dele = filhos.get(id_de(comentario), [])
        guardar(comentario, dele)
        for filho in dele:
            pendurar(filho)

    for raiz in raizes:
        pendurar(raiz)
