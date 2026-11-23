from pydantic import BaseModel


class OfensivaOut(BaseModel):
    """O que o componente <Ofensiva /> precisa para se desenhar."""

    atual: int
    recorde: int
    folgas_usadas_na_semana: int
    folgas_por_semana: int
    precisa_estudar_hoje: bool
    # Em minutos; a tela transforma em horas ("12h30").
    minutos_esta_semana: int
    minutos_semana_passada: int
