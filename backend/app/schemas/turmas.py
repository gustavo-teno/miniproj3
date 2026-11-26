"""Formatos da API das Turmas (#17, Pessoa D). Decisão 5 do DECISIONS.md."""

from typing import Literal

from pydantic import BaseModel, ConfigDict

# O tipo vai no endereço: /turmas/vestibular/enem, /turmas/curso/medicina.
TipoTurma = Literal["vestibular", "curso"]


class TurmaOut(BaseModel):
    """Uma turma, como aparece na lista e no topo da página da turma."""

    tipo: TipoTurma
    chave: str  # chave de app/constantes.py, ex.: "enem" ou "outro"
    nome: str  # "ENEM", ou "Outros vestibulares" para a chave "outro"
    pessoas: int
    # Quantas pessoas da turma postaram de matéria hoje (dia de Brasília,
    # bate-papo não conta), a mesma regra da ofensiva.
    estudaram_hoje: int


class TurmasOut(BaseModel):
    """GET /turmas: a página da aba Turmas."""

    # As turmas de quem está vendo: a do vestibular e a do curso, nessa ordem.
    # Fica vazia (ou com uma só) se a pessoa não escolheu a meta.
    minhas: list[TurmaOut]
    vestibulares: list[TurmaOut]
    cursos: list[TurmaOut]


class MembroOut(BaseModel):
    """Uma pessoa na aba Chamada da turma."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    name: str
    avatar_url: str
    # A meta inteira, para o card mostrar a outra turma da pessoa.
    vestibular: str
    curso: str
    # Texto livre de quem marcou "Outro" ("Geografia"). Nas turmas "Outros",
    # é o que o card mostra ("quer Geografia"). Vazio nas outras escolhas.
    vestibular_outro: str
    curso_outro: str
    universidade: str
    # Depende de quem está vendo: preenchidos em services/turmas.py.
    estudou_hoje: bool = False
    segue_voce: bool = False


class MembroPage(BaseModel):
    """GET /turmas/{tipo}/{chave}/membros: o padrão de paginação do projeto."""

    items: list[MembroOut]
    total: int
    offset: int
    limit: int
