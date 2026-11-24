from pydantic import BaseModel


class OfensivaOut(BaseModel):
    """GET /usuarios/{username}/ofensiva: o fogo do perfil e as horas da dona."""

    atual: int
    recorde: int
    folgas_usadas_na_semana: int
    folgas_por_semana: int
    precisa_estudar_hoje: bool
    # As horas são privadas (decisão 4): só vêm quando quem pede é a dona do
    # perfil. Para quem visita, ficam null, para não virarem comparação.
    # Em minutos; a tela transforma em horas ("12h30").
    minutos_esta_semana: int | None
    minutos_semana_passada: int | None
    # Os 7 dias desta semana, de segunda a domingo (as barras do diário).
    minutos_por_dia: list[int] | None
