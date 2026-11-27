"""Seed com cara de vestibulando (#13, Pessoa C). Rode com: make seed

Cria 25 vestibulandos com metas variadas (todas as turmas têm gente), três
semanas de sessões de estudo, conversas de bate-papo, follows entre quem tem
a mesma meta, curtidas, comentários (com respostas e curtidas) e as DMs do
usuário de demonstração. O conteúdo fica em seed_dados.py.

Todos entram com a senha SENHA_SEED. O usuário de demonstração, para o vídeo
e para a banca, é o "ada".

As datas são contadas a partir de hoje: a ofensiva de quem estuda todo dia
continua em dia, não importa quando o seed rode.
"""

import random
import sys
from datetime import date, datetime, time, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import bcrypt
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.ofensiva import BRASILIA, hoje_em_brasilia
from app.db import Base, SessionLocal, engine
from app.models.comment import Comment
from app.models.curtida_comentario import CurtidaComentario
from app.models.follow import Follow
from app.models.imagem_post import ImagemPost
from app.models.leitura import Leitura
from app.models.like import Like
from app.models.mensagem import Mensagem
from app.models.post import Post
from app.models.user import User
from app.services.imagens import dimensoes, formato
from scripts.seed_dados import (
    ASSUNTOS,
    BATE_PAPO,
    COMENTARIOS,
    CONVERSA_DEMO,
    CONVERSAS_DEMO,
    FIRME,
    FOTOS,
    QUEBROU,
    REFLEXOES,
    RESPOSTAS,
    SESSOES,
    USUARIO_DEMO,
    VESTIBULANDOS,
)

# A mesma senha para todo usuário do seed, para dar para logar como eles.
SENHA_SEED = "senha-forte-123"

# As fotos dos posts (FOTOS), com os créditos no CREDITOS.md de lá.
PASTA_FOTOS = Path(__file__).resolve().parent / "fotos_seed"

# Quantos dias para trás o seed cria sessões de estudo.
DIAS_DE_HISTORIA = 21

# A mesma semente gera sempre a mesma rede (só as datas andam com o hoje).
SEMENTE = 2026


def _dias_firmes(inicio: date, fim: date, rng: random.Random) -> list[date]:
    """Estuda quase todo dia. As folgas respeitam a ofensiva que perdoa: nunca
    dois dias seguidos e no máximo duas por semana, então ela não quebra."""
    dias = []
    folgas_por_semana: dict[date, int] = {}
    folgou_ontem = False
    dia = inicio
    while dia <= fim:
        segunda = dia - timedelta(days=dia.weekday())
        pode_folgar = not folgou_ontem and folgas_por_semana.get(segunda, 0) < 2
        if pode_folgar and rng.random() < 0.15:
            folgas_por_semana[segunda] = folgas_por_semana.get(segunda, 0) + 1
            folgou_ontem = True
        else:
            dias.append(dia)
            folgou_ontem = False
        dia += timedelta(days=1)
    return dias


def _dias_de_estudo(rotina: str, hoje: date, rng: random.Random) -> list[date]:
    inicio = hoje - timedelta(days=DIAS_DE_HISTORIA)
    ontem = hoje - timedelta(days=1)
    # Hoje fica em aberto (a ofensiva não quebra antes da meia-noite): uns já
    # estudaram, outros ainda não.
    estudou_hoje = rng.random() < 0.6

    if rotina == FIRME:
        dias = _dias_firmes(inicio, ontem, rng)
        # Ontem precisa ter estudo, senão a ofensiva "em dia" fica por um fio.
        if ontem not in dias:
            dias.append(ontem)
        return dias + ([hoje] if estudou_hoje else [])

    if rotina == QUEBROU:
        # Uma ofensiva longa até 9 dias atrás, seis dias parada (quebra) e a
        # volta nos últimos dois dias: o perfil mostra o recorde ao lado.
        antes = _dias_firmes(inicio, hoje - timedelta(days=9), rng)
        return antes + [hoje - timedelta(days=2), ontem] + ([hoje] if estudou_hoje else [])

    # SOLTA: dias espalhados.
    return [inicio + timedelta(days=n) for n in range(DIAS_DE_HISTORIA + 1) if rng.random() < 0.4]


def _momento(dia: date, agora: datetime, rng: random.Random) -> datetime:
    """Uma hora plausível de estudo naquele dia (em Brasília), nunca no futuro."""
    hora = time(rng.randint(7, 23), rng.randint(0, 59))
    momento = datetime.combine(dia, hora, tzinfo=BRASILIA).astimezone(timezone.utc)
    if momento > agora:
        momento = agora - timedelta(minutes=rng.randint(5, 90))
    return momento


def _texto_de_estudo(tag: str, rng: random.Random) -> str:
    n = rng.choice([10, 15, 20, 30, 45])
    sessao = rng.choice(SESSOES).format(
        assunto=rng.choice(ASSUNTOS[tag]), n=n, acertos=rng.randint(n // 2, n)
    )
    return f"{sessao} {rng.choice(REFLEXOES)}".strip()


def _criar_usuarios(db: Session) -> list[User]:
    senha_hash = bcrypt.hashpw(SENHA_SEED.encode(), bcrypt.gensalt()).decode()
    campos = ("username", "name", "bio", "vestibular", "curso", "vestibular_outro",
              "curso_outro", "universidade")
    usuarios = [
        User(**{c: pessoa.get(c, "") for c in campos}, password_hash=senha_hash)
        for pessoa in VESTIBULANDOS
    ]
    db.add_all(usuarios)
    db.flush()  # dá os ids, para os follows e os posts
    return usuarios


def _criar_follows(db: Session, usuarios: list[User], rng: random.Random) -> dict[int, list[User]]:
    """Cada um segue de 4 a 8 pessoas, de preferência com a mesma meta. Devolve
    os seguidores de cada pessoa, que são quem curte e comenta os posts dela."""
    pares: set[tuple[int, int]] = set()
    for user in usuarios:
        outros = [o for o in usuarios if o.id != user.id]
        # Mesma meta pesa mais: a rede junta quem quer a mesma coisa.
        pesos = [4 if (o.curso == user.curso or o.vestibular == user.vestibular) else 1 for o in outros]
        quantos = 10 if user.username == USUARIO_DEMO else rng.randint(4, 8)
        while sum(1 for p in pares if p[0] == user.id) < quantos:
            seguido = rng.choices(outros, weights=pesos)[0]
            pares.add((user.id, seguido.id))

    # O usuário de demonstração também é seguido, para o perfil dele ter
    # seguidores e os posts dele terem curtidas no vídeo.
    demo = next(u for u in usuarios if u.username == USUARIO_DEMO)
    for fa in rng.sample([u for u in usuarios if u.id != demo.id], 8):
        pares.add((fa.id, demo.id))
    # E é mútuo de quem conversa com ele: a DM só existe entre mútuos.
    por_username = {u.username: u for u in usuarios}
    for conversa in CONVERSAS_DEMO:
        colega = por_username[conversa["com"]]
        pares.update({(demo.id, colega.id), (colega.id, demo.id)})

    db.add_all(Follow(seguidor_id=a, seguido_id=b) for a, b in pares)
    por_id = {u.id: u for u in usuarios}
    seguidores: dict[int, list[User]] = {u.id: [] for u in usuarios}
    for seguidor_id, seguido_id in sorted(pares):
        seguidores[seguido_id].append(por_id[seguidor_id])
    return seguidores


def _criar_posts(db: Session, usuarios: list[User], agora: datetime, rng: random.Random) -> list[Post]:
    hoje = hoje_em_brasilia(agora)
    rotinas = {p["username"]: p for p in VESTIBULANDOS}
    conversas = rng.sample(BATE_PAPO, len(BATE_PAPO))
    posts = []
    for user in usuarios:
        pessoa = rotinas[user.username]
        dias = _dias_de_estudo(pessoa["rotina"], hoje, rng)
        for dia in dias:
            # Às vezes duas matérias no mesmo dia.
            materias = rng.sample(pessoa["materias"], 2 if rng.random() < 0.15 else 1)
            for tag in materias:
                minutos = rng.choice([25, 40, 50, 60, 90, 120, 150]) if rng.random() < 0.8 else None
                posts.append(Post(autor_id=user.id, tag=tag, minutos=minutos,
                                  texto=_texto_de_estudo(tag, rng),
                                  created_at=_momento(dia, agora, rng)))
        # Uma conversa de bate-papo para quem ainda tem texto na fila. Ela não
        # conta para a ofensiva (decisão 4), então pode cair em qualquer dia.
        if conversas and dias:
            posts.append(Post(autor_id=user.id, tag="bate-papo", texto=conversas.pop(),
                              created_at=_momento(rng.choice(dias), agora, rng)))
    db.add_all(posts)
    db.flush()
    return posts


def _criar_interacoes(db: Session, posts: list[Post], seguidores: dict[int, list[User]],
                      agora: datetime, rng: random.Random) -> None:
    """Quem segue o autor curte e comenta: é assim que a rede funciona."""
    for post in posts:
        fas = seguidores[post.autor_id]
        for fa in rng.sample(fas, rng.randint(0, min(5, len(fas)))):
            db.add(Like(user_id=fa.id, post_id=post.id))
        if fas and rng.random() < 0.35:
            # Os comentários vêm depois do post, em ordem, e nunca no futuro.
            momento = post.created_at
            for fa in rng.sample(fas, rng.randint(1, min(3, len(fas)))):
                momento = min(momento + timedelta(minutes=rng.randint(5, 600)), agora)
                db.add(Comment(autor_id=fa.id, post_id=post.id,
                               texto=rng.choice(COMENTARIOS), created_at=momento))


def _criar_conversas(db: Session, usuarios: list[User], agora: datetime) -> None:
    """As conversas do usuário de demonstração, com as últimas mensagens ainda
    não lidas por ele. As outras pessoas já leram tudo."""
    por_username = {u.username: u for u in usuarios}
    demo = por_username[USUARIO_DEMO]
    # As não lidas e a ordem da lista de conversas vêm do id das mensagens, então
    # elas entram no banco na ordem em que foram escritas, de todas as conversas.
    escritas = sorted(
        (agora - ha, autor, conversa["com"], texto)
        for conversa in CONVERSAS_DEMO
        for autor, ha, texto in conversa["mensagens"]
    )
    mensagens: dict[str, list[Mensagem]] = {c["com"]: [] for c in CONVERSAS_DEMO}
    for momento, autor, com, texto in escritas:
        colega = por_username[com]
        remetente, destinatario = (demo, colega) if autor == USUARIO_DEMO else (colega, demo)
        mensagem = Mensagem(remetente_id=remetente.id, destinatario_id=destinatario.id,
                            texto=texto, created_at=momento)
        db.add(mensagem)
        mensagens[com].append(mensagem)
    db.flush()  # dá os ids, que marcam até onde cada um leu

    for conversa in CONVERSAS_DEMO:
        colega = por_username[conversa["com"]]
        da_conversa = mensagens[conversa["com"]]
        lida_pelo_demo = da_conversa[-conversa["nao_lidas"] - 1]
        db.add_all([
            Leitura(leitor_id=demo.id, outro_id=colega.id, ultima_lida_id=lida_pelo_demo.id),
            Leitura(leitor_id=colega.id, outro_id=demo.id, ultima_lida_id=da_conversa[-1].id),
        ])


def _criar_respostas(db: Session, posts: list[Post], seguidores: dict[int, list[User]],
                     agora: datetime, rng: random.Random) -> None:
    """Quem postou responde a parte dos comentários e curte outros; quem segue
    o autor também curte alguns comentários (comentários em árvore)."""
    por_post = {post.id: post for post in posts}
    for comentario in list(db.scalars(select(Comment).order_by(Comment.id))):
        post = por_post[comentario.post_id]
        curtiram = set()
        if comentario.autor_id != post.autor_id and rng.random() < 0.5:
            curtiram.add(post.autor_id)
        for fa in rng.sample(seguidores[post.autor_id], rng.randint(0, 2)):
            if fa.id != comentario.autor_id:
                curtiram.add(fa.id)
        db.add_all(CurtidaComentario(user_id=quem, comentario_id=comentario.id) for quem in curtiram)
        if comentario.autor_id != post.autor_id and rng.random() < 0.3:
            # A resposta vem depois do comentário e nunca no futuro.
            momento = min(comentario.created_at + timedelta(minutes=rng.randint(10, 300)), agora)
            db.add(Comment(autor_id=post.autor_id, post_id=post.id, parent_id=comentario.id,
                           texto=rng.choice(RESPOSTAS), created_at=momento))


def _criar_conversa_demo(db: Session, usuarios: list[User], seguidores: dict[int, list[User]],
                         agora: datetime) -> None:
    """A CONVERSA_DEMO no post mais recente da Ada que tem pelo menos um dia:
    assim as falas cabem entre o post e agora, cada uma depois da anterior."""
    demo = next(u for u in usuarios if u.username == USUARIO_DEMO)
    fa = seguidores[demo.id][0]
    post = db.scalar(
        select(Post)
        .where(Post.autor_id == demo.id, Post.created_at <= agora - timedelta(days=1))
        .order_by(Post.created_at.desc())
    )
    pai_id, momento = None, post.created_at
    for quem, texto in CONVERSA_DEMO:
        momento += timedelta(minutes=40)
        fala = Comment(autor_id=(fa if quem == "fa" else demo).id, post_id=post.id,
                       parent_id=pai_id, texto=texto, created_at=momento)
        db.add(fala)
        db.flush()  # o id dela é o pai da próxima fala
        pai_id = fala.id


def _anexar_fotos(db: Session, usuarios: list[User], posts: list[Post],
                  seguidores: dict[int, list[User]], agora: datetime) -> None:
    """Põe cada foto de FOTOS num post do mesmo assunto. Entre os que servem,
    prefere os da Ada e de quem ela segue (aparecem no feed e no diário dela, no
    vídeo) e, depois, o mais recente. Foto com "texto" troca o texto do post,
    foto com "vestibular" só vai para quem presta aquela prova e foto com
    "comentarios" ganha essa conversa embaixo."""
    demo = next(u for u in usuarios if u.username == USUARIO_DEMO)
    # A Ada e quem ela segue (seguidores[x] é quem segue x).
    da_demo = {demo.id} | {u.id for u in usuarios if demo in seguidores[u.id]}
    vestibular = {u.id: u.vestibular for u in usuarios}
    com_foto: set[int] = set()
    for foto in FOTOS:
        def serve(post: Post) -> bool:
            if post.id in com_foto or post.tag != foto["tag"]:
                return False
            if "vestibular" in foto and vestibular[post.autor_id] != foto["vestibular"]:
                return False
            if "texto" in foto:
                return True
            return (all(trecho in post.texto for trecho in foto["contem"])
                    and post.texto.startswith(foto["sessoes"]))
        candidatos = sorted(filter(serve, posts),
                            key=lambda p: (p.autor_id in da_demo, p.created_at), reverse=True)
        if not candidatos:
            continue  # o seed mudou e nenhum post fala disso: o post fica sem foto
        post = candidatos[0]
        if "texto" in foto:
            post.texto = foto["texto"]
        dados = (PASTA_FOTOS / foto["arquivo"]).read_bytes()
        largura, altura = dimensoes(dados) or (None, None)
        db.add(ImagemPost(post_id=post.id, dados=dados, tipo=formato(dados),
                          largura=largura, altura=altura))
        com_foto.add(post.id)
        _comentar_foto(db, post, foto.get("comentarios", []), seguidores, agora)


def _comentar_foto(db: Session, post: Post, falas: list[tuple[str, str]],
                   seguidores: dict[int, list[User]], agora: datetime) -> None:
    """Os "comentarios" da foto: cada "fa" é um comentário de outra pessoa que
    segue o autor, e "autor" responde ao último "fa". As falas ficam entre o
    post e agora, cada uma depois da anterior."""
    fas = iter(seguidores[post.autor_id])
    passo = min(timedelta(minutes=40), (agora - post.created_at) / (len(falas) + 1))
    momento, ultimo_fa = post.created_at, None
    for quem, texto in falas:
        momento += passo
        if quem == "fa":
            ultimo_fa = Comment(autor_id=next(fas).id, post_id=post.id,
                                texto=texto, created_at=momento)
            db.add(ultimo_fa)
            db.flush()  # o id dele é o pai da resposta do autor
        else:
            db.add(Comment(autor_id=post.autor_id, post_id=post.id,
                           parent_id=ultimo_fa.id, texto=texto, created_at=momento))


def seed_fake(db: Session, agora: datetime | None = None) -> None:
    """Popula a rede: a demo nunca começa vazia (contrato do teste do núcleo)."""
    agora = agora or datetime.now(timezone.utc)
    rng = random.Random(SEMENTE)
    usuarios = _criar_usuarios(db)
    seguidores = _criar_follows(db, usuarios, rng)
    posts = _criar_posts(db, usuarios, agora, rng)
    _criar_interacoes(db, posts, seguidores, agora, rng)
    _criar_conversas(db, usuarios, agora)
    db.flush()  # dá os ids dos comentários, para as respostas e as curtidas
    # Outra semente: assim o resto da rede continua igual ao de antes das respostas.
    _criar_respostas(db, posts, seguidores, agora, random.Random(SEMENTE + 1))
    _criar_conversa_demo(db, usuarios, seguidores, agora)
    _anexar_fotos(db, usuarios, posts, seguidores, agora)
    db.commit()


def main() -> None:
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        if db.scalar(select(User).limit(1)):
            print("banco já tem dados — nada a fazer (para recriar: apague backend/app.db)")
            return
        seed_fake(db)
        contagens = {nome: db.scalar(select(func.count()).select_from(model))
                     for nome, model in [("usuários", User), ("posts", Post), ("follows", Follow),
                                         ("curtidas", Like), ("comentários", Comment),
                                         ("curtidas em comentários", CurtidaComentario),
                                         ("mensagens", Mensagem)]}
        print("seed ok: " + ", ".join(f"{n} {nome}" for nome, n in contagens.items()))
        print(f"entre como '{USUARIO_DEMO}' com a senha '{SENHA_SEED}'")


if __name__ == "__main__":
    main()
