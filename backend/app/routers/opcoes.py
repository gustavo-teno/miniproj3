"""Entrega as listas fixas de app/constantes.py para as telas.

O cadastro, o formulário de post e o perfil montam os menus de escolha com
esta rota, em vez de copiar as listas para o frontend.
"""

from fastapi import APIRouter

from app.constantes import CURSOS, TAGS, VESTIBULARES

router = APIRouter(prefix="/opcoes", tags=["opcoes"])


def _como_lista(opcoes: dict[str, str]) -> list[dict[str, str]]:
    # Lista (e não dict) para a tela manter a ordem e iterar fácil.
    return [{"valor": valor, "nome": nome} for valor, nome in opcoes.items()]


@router.get("")
def listar_opcoes():
    return {
        "tags": _como_lista(TAGS),
        "vestibulares": _como_lista(VESTIBULARES),
        "cursos": _como_lista(CURSOS),
    }
