"""Formatos de entrada e saída da auth (#6, Pessoa A). Guia 01."""

from typing import Annotated

from pydantic import (
    BaseModel,
    Field,
    StringConstraints,
    field_validator,
    model_validator,
)

from app.constantes import CURSOS, VESTIBULARES

# Caminhos fixos de /usuarios: um usuário com esse nome teria o perfil
# (/usuarios/{username}) engolido pela rota fixa.
USERNAMES_RESERVADOS = {"eu", "stats"}

# O bcrypt só olha os primeiros 72 bytes da senha: o resto seria ignorado, e
# "senha + qualquer final" entraria. Melhor recusar no cadastro.
SENHA_MAX_BYTES = 72


class RegistroIn(BaseModel):
    username: str = Field(min_length=3, max_length=30, pattern=r"^[a-z0-9_]+$")
    # Tira os espaços das pontas antes de medir: nome só de espaços é vazio.
    name: Annotated[
        str, StringConstraints(strip_whitespace=True, min_length=1, max_length=80)
    ]
    password: str = Field(min_length=8)
    # A meta (decisão 3), opcional no cadastro. Chaves de app/constantes.py.
    vestibular: str = ""
    curso: str = ""
    vestibular_outro: str = Field(default="", max_length=60)
    curso_outro: str = Field(default="", max_length=60)
    universidade: str = Field(default="", max_length=80)

    @field_validator("username")
    @classmethod
    def username_livre(cls, v: str) -> str:
        if v in USERNAMES_RESERVADOS:
            raise ValueError("esse nome de usuário é reservado")
        return v

    @field_validator("password")
    @classmethod
    def senha_cabe_no_bcrypt(cls, v: str) -> str:
        # Bytes, não letras: "ç" e "ã" ocupam 2 bytes cada.
        if len(v.encode()) > SENHA_MAX_BYTES:
            raise ValueError("senha longa demais (máximo de 72 caracteres sem acento)")
        return v

    @field_validator("vestibular")
    @classmethod
    def vestibular_da_lista(cls, v: str) -> str:
        if v and v not in VESTIBULARES:
            raise ValueError("vestibular fora da lista de GET /opcoes")
        return v

    @field_validator("curso")
    @classmethod
    def curso_da_lista(cls, v: str) -> str:
        if v and v not in CURSOS:
            raise ValueError("curso fora da lista de GET /opcoes")
        return v

    @model_validator(mode="after")
    def outro_so_com_outro(self) -> "RegistroIn":
        # O texto livre só vale quando a escolha foi "outro" (contrato do PLANO).
        if self.vestibular != "outro":
            self.vestibular_outro = ""
        if self.curso != "outro":
            self.curso_outro = ""
        return self


class LoginIn(BaseModel):
    username: str
    password: str


class TokenOut(BaseModel):
    token: str
