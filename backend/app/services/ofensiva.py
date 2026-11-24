"""Ofensiva que perdoa (#7, Pessoa A). Busca os posts no banco e passa só as
datas para o cálculo em app/core/ofensiva.py, que não conhece o banco."""

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.constantes import TAG_PADRAO
from app.core import ofensiva as calculo
from app.models.post import Post
from app.models.user import User
from app.schemas.ofensiva import OfensivaOut
from app.services.users import buscar_por_username


def da_pessoa(db: Session, username: str, quem_ve: User) -> OfensivaOut:
    user = buscar_por_username(db, username)
    if user is None:
        raise HTTPException(status_code=404, detail="usuário não encontrado")

    # Só as duas colunas que o cálculo usa, e só posts de matéria: bate-papo
    # não conta para a ofensiva nem para as horas de estudo (decisão 4).
    linhas = db.execute(
        select(Post.created_at, Post.minutos).where(
            Post.autor_id == user.id, Post.tag != TAG_PADRAO
        )
    ).all()
    sessoes = [
        (calculo.dia_em_brasilia(quando), minutos) for quando, minutos in linhas
    ]

    hoje = calculo.hoje_em_brasilia()
    ofensiva = calculo.calcular((dia for dia, _ in sessoes), hoje)
    resumo = calculo.resumo_da_semana(sessoes, hoje)
    # As horas são privadas (decisão 4): quem visita vê o fogo, não as horas.
    e_a_dona = quem_ve.id == user.id

    return OfensivaOut(
        atual=ofensiva.atual,
        recorde=ofensiva.recorde,
        folgas_usadas_na_semana=ofensiva.folgas_usadas_na_semana,
        folgas_por_semana=calculo.FOLGAS_POR_SEMANA,
        precisa_estudar_hoje=ofensiva.precisa_estudar_hoje,
        minutos_esta_semana=resumo.minutos_esta_semana if e_a_dona else None,
        minutos_semana_passada=resumo.minutos_semana_passada if e_a_dona else None,
        minutos_por_dia=list(resumo.minutos_por_dia) if e_a_dona else None,
    )
