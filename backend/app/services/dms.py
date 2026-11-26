"""DMs entre mútuos (#18, decisão 6, Pessoa A).

Só quem se segue nos dois sentidos troca mensagem. O follow é da Pessoa D:
aqui o model Follow só é lido. As não lidas ficam no model Leitura: até qual
mensagem cada pessoa já leu em cada conversa.
"""

from fastapi import HTTPException
from sqlalchemy import and_, case, delete, func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.dialects.sqlite import insert as sqlite_insert
from sqlalchemy.orm import Session

from app.models.curtida_mensagem import CurtidaMensagem
from app.models.follow import Follow
from app.models.leitura import Leitura
from app.models.mensagem import Mensagem
from app.models.user import User
from app.schemas.dm import (
    ConversaAberta,
    CurtidaOut,
    ConversaOut,
    MensagemCriar,
    MensagemOut,
)
from app.schemas.post import AutorOut
from app.services.users import buscar_por_username


def _pessoa_ou_404(db: Session, username: str) -> User:
    pessoa = buscar_por_username(db, username)
    if pessoa is None:
        raise HTTPException(status_code=404, detail="usuário não encontrado")
    return pessoa


def sao_mutuos(db: Session, a: User, b: User) -> bool:
    """As duas pessoas se seguem: os dois follows existem."""
    if a.id == b.id:
        return False
    follows = db.scalar(
        select(func.count())
        .select_from(Follow)
        .where(
            or_(
                and_(Follow.seguidor_id == a.id, Follow.seguido_id == b.id),
                and_(Follow.seguidor_id == b.id, Follow.seguido_id == a.id),
            )
        )
    )
    return follows == 2


def pode_mandar(db: Session, eu: User, username: str) -> bool:
    """Se eu posso mandar mensagem para essa pessoa (404 se ela não existe)."""
    return sao_mutuos(db, eu, _pessoa_ou_404(db, username))


def _para_out(mensagem: Mensagem, eu: User) -> MensagemOut:
    return MensagemOut(
        id=mensagem.id,
        texto=mensagem.texto,
        created_at=mensagem.created_at,
        minha=mensagem.remetente_id == eu.id,
    )


def _entre(a: User, b: User):
    """O filtro das mensagens de uma conversa, nos dois sentidos."""
    return or_(
        and_(Mensagem.remetente_id == a.id, Mensagem.destinatario_id == b.id),
        and_(Mensagem.remetente_id == b.id, Mensagem.destinatario_id == a.id),
    )


def enviar(db: Session, eu: User, username: str, dados: MensagemCriar) -> MensagemOut:
    outro = _pessoa_ou_404(db, username)
    if not sao_mutuos(db, eu, outro):
        raise HTTPException(
            status_code=403, detail="mensagens só entre quem se segue mutuamente"
        )
    mensagem = Mensagem(remetente_id=eu.id, destinatario_id=outro.id, texto=dados.texto)
    db.add(mensagem)
    db.commit()
    db.refresh(mensagem)
    return _para_out(mensagem, eu)


def _marcar_lida(db: Session, eu: User, outro: User, ate_id: int) -> None:
    """Avança a marca de leitura de "eu" nesta conversa. Nunca volta: abrir uma
    página antiga não faz mensagem lida virar não lida.

    Um comando só (INSERT ... ON CONFLICT): com duas abas abrindo a conversa ao
    mesmo tempo, ler e depois criar a linha deixava as duas criarem, e a
    segunda batia na UniqueConstraint (500). O max() de dois argumentos do
    SQLite fica com a marca maior, então ela também não volta nessa corrida.
    """
    novo = sqlite_insert(Leitura).values(
        leitor_id=eu.id, outro_id=outro.id, ultima_lida_id=ate_id
    )
    db.execute(
        novo.on_conflict_do_update(
            index_elements=[Leitura.leitor_id, Leitura.outro_id],
            set_={
                "ultima_lida_id": func.max(
                    Leitura.ultima_lida_id, novo.excluded.ultima_lida_id
                )
            },
        )
    )
    db.commit()


def abrir_conversa(
    db: Session, eu: User, username: str, depois_de: int | None, limite: int
) -> ConversaAberta:
    """As mensagens da conversa, da mais antiga para a mais nova.

    Sem depois_de: as últimas `limite` mensagens (a tela abrindo a conversa).
    Com depois_de: só as que vieram depois dessa (a tela perguntando se há
    novas). O id, e não a hora, separa as novas: não repete nem pula duas
    mensagens enviadas no mesmo segundo.
    """
    outro = _pessoa_ou_404(db, username)
    consulta = select(Mensagem).where(_entre(eu, outro))
    if depois_de is None:
        recentes = db.scalars(consulta.order_by(Mensagem.id.desc()).limit(limite))
        mensagens = list(reversed(list(recentes)))
    else:
        mensagens = list(
            db.scalars(
                consulta.where(Mensagem.id > depois_de)
                .order_by(Mensagem.id)
                .limit(limite)
            )
        )

    # Abrir a conversa lê o que chegou.
    if mensagens:
        _marcar_lida(db, eu, outro, mensagens[-1].id)

    return ConversaAberta(
        pessoa=AutorOut.model_validate(outro),
        pode_responder=sao_mutuos(db, eu, outro),
        mensagens=[_para_out(m, eu) for m in mensagens],
        curtidas=_curtidas_da_conversa(db, eu, outro),
    )


def _curtidas_da_conversa(db: Session, eu: User, outro: User) -> list[CurtidaOut]:
    """Todas as curtidas das mensagens desta conversa, numa consulta só."""
    linhas = db.execute(
        select(CurtidaMensagem.mensagem_id, CurtidaMensagem.user_id)
        .join(Mensagem, Mensagem.id == CurtidaMensagem.mensagem_id)
        .where(_entre(eu, outro))
        .order_by(CurtidaMensagem.mensagem_id)
    ).all()
    return [CurtidaOut(mensagem_id=m, minha=quem == eu.id) for m, quem in linhas]


def _mensagem_da_conversa(db: Session, eu: User, mensagem_id: int) -> Mensagem:
    """A mensagem, se "eu" estiver na conversa dela. Para quem está fora, 404,
    como se ela não existisse: não dá para descobrir mensagens dos outros."""
    mensagem = db.get(Mensagem, mensagem_id)
    if mensagem is None or eu.id not in (mensagem.remetente_id, mensagem.destinatario_id):
        raise HTTPException(status_code=404, detail="mensagem não encontrada")
    return mensagem


def curtir(db: Session, eu: User, mensagem_id: int) -> None:
    """Põe o coração. Idempotente, como curtir post. Só entre mútuos, como
    mandar mensagem: quem deixou de seguir vê a conversa, mas não mexe nela."""
    mensagem = _mensagem_da_conversa(db, eu, mensagem_id)
    outro_id = (
        mensagem.destinatario_id if mensagem.remetente_id == eu.id else mensagem.remetente_id
    )
    if not sao_mutuos(db, eu, db.get(User, outro_id)):
        raise HTTPException(
            status_code=403, detail="mensagens só entre quem se segue mutuamente"
        )
    ja_curtiu = select(CurtidaMensagem.id).where(
        CurtidaMensagem.user_id == eu.id, CurtidaMensagem.mensagem_id == mensagem_id
    )
    if db.scalar(ja_curtiu) is not None:
        return
    db.add(CurtidaMensagem(user_id=eu.id, mensagem_id=mensagem_id))
    try:
        db.commit()
    except IntegrityError:
        # Dois toques duplos ao mesmo tempo: o segundo bate no par único. A
        # curtida já existe, que é o que foi pedido.
        db.rollback()


def descurtir(db: Session, eu: User, mensagem_id: int) -> None:
    """Tira o coração. Idempotente; vale mesmo se deixaram de ser mútuos, para
    ninguém ficar preso a uma curtida."""
    _mensagem_da_conversa(db, eu, mensagem_id)
    db.execute(
        delete(CurtidaMensagem).where(
            CurtidaMensagem.user_id == eu.id, CurtidaMensagem.mensagem_id == mensagem_id
        )
    )
    db.commit()


def _nao_lidas_por_pessoa(db: Session, eu: User) -> dict[int, int]:
    """Quantas mensagens de cada pessoa "eu" ainda não leu, numa consulta só:
    as que chegaram com id maior que a marca de leitura daquela conversa."""
    linhas = db.execute(
        select(Mensagem.remetente_id, func.count())
        .outerjoin(
            Leitura,
            and_(Leitura.leitor_id == eu.id, Leitura.outro_id == Mensagem.remetente_id),
        )
        .where(
            Mensagem.destinatario_id == eu.id,
            Mensagem.id > func.coalesce(Leitura.ultima_lida_id, 0),
        )
        .group_by(Mensagem.remetente_id)
    ).all()
    return {remetente: n for remetente, n in linhas}


def conversas(db: Session, eu: User) -> list[ConversaOut]:
    """As conversas de "eu", da que teve mensagem mais recente para a mais
    antiga. Três consultas, qualquer que seja o número de conversas: a última
    mensagem de cada uma, as pessoas e as não lidas."""
    # Em cada mensagem, "a outra pessoa" é quem não sou eu.
    outro = case(
        (Mensagem.remetente_id == eu.id, Mensagem.destinatario_id),
        else_=Mensagem.remetente_id,
    )
    ultimas_ids = (
        select(func.max(Mensagem.id))
        .where(or_(Mensagem.remetente_id == eu.id, Mensagem.destinatario_id == eu.id))
        .group_by(outro)
    )
    ultimas = list(
        db.scalars(
            select(Mensagem).where(Mensagem.id.in_(ultimas_ids)).order_by(Mensagem.id.desc())
        )
    )

    def outro_de(m: Mensagem) -> int:
        return m.destinatario_id if m.remetente_id == eu.id else m.remetente_id

    pessoas = {
        p.id: p
        for p in db.scalars(select(User).where(User.id.in_([outro_de(m) for m in ultimas])))
    }
    nao_lidas = _nao_lidas_por_pessoa(db, eu)

    return [
        ConversaOut(
            pessoa=AutorOut.model_validate(pessoas[outro_de(m)]),
            ultima=_para_out(m, eu),
            nao_lidas=nao_lidas.get(outro_de(m), 0),
        )
        for m in ultimas
    ]


def total_nao_lidas(db: Session, eu: User) -> int:
    return sum(_nao_lidas_por_pessoa(db, eu).values())
