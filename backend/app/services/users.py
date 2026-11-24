from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.contadores import contador_iniciais
from app.models.follow import Follow
from app.models.post import Post
from app.models.user import User
from app.schemas.user import CadernoOut, PerfilEditar, PerfilOut, UserCreate, UserOut


def listar(db: Session, offset: int, limit: int) -> tuple[list[User], int]:
    total = db.scalar(select(func.count()).select_from(User)) or 0
    users = list(
        db.scalars(
            select(User).order_by(User.username).offset(offset).limit(limit)
        )
    )
    return users, total


def buscar_por_username(db: Session, username: str) -> User | None:
    return db.scalar(select(User).where(User.username == username))


def salvar_novo(db: Session, user: User) -> User:
    """Guarda um usuário novo. Usado pelo POST /usuarios e pelo cadastro da auth,
    para a regra do username repetido ficar num lugar só."""
    if buscar_por_username(db, user.username):
        raise HTTPException(status_code=409, detail="esse nome de usuário já está em uso")

    db.add(user)
    db.commit()
    db.refresh(user)

    contador_iniciais.incrementar(user.username)
    return user


def criar(db: Session, dados: UserCreate) -> User:
    return salvar_novo(db, User(**dados.model_dump()))


# ---- perfil-diário (#10, Pessoa B) ----


def buscar_ou_404(db: Session, username: str) -> User:
    user = buscar_por_username(db, username)
    if user is None:
        raise HTTPException(status_code=404, detail="usuário não encontrado")
    return user


def _contar(db: Session, coluna) -> int:
    return db.scalar(select(func.count()).select_from(Follow).where(coluna)) or 0


def cadernos(db: Session, user_id: int) -> list[CadernoOut]:
    """A estante do perfil: posts e último post por tag, numa consulta só.
    Do caderno mais usado para o menos usado (empate: o mais recente antes)."""
    linhas = db.execute(
        select(Post.tag, func.count(Post.id), func.max(Post.created_at))
        .where(Post.autor_id == user_id)
        .group_by(Post.tag)
        .order_by(func.count(Post.id).desc(), func.max(Post.created_at).desc())
    ).all()
    # O max() herda o tipo da coluna (DataHoraUTC), então a data já volta em UTC.
    return [CadernoOut(tag=tag, posts=n, ultimo_post=ultimo) for tag, n, ultimo in linhas]


def perfil(db: Session, username: str, quem_ve: User) -> PerfilOut:
    user = buscar_ou_404(db, username)
    return PerfilOut.model_validate(
        {
            **UserOut.model_validate(user).model_dump(),
            "vestibular": user.vestibular,
            "curso": user.curso,
            "vestibular_outro": user.vestibular_outro,
            "curso_outro": user.curso_outro,
            "universidade": user.universidade,
            "seguidores": _contar(db, Follow.seguido_id == user.id),
            "seguindo": _contar(db, Follow.seguidor_id == user.id),
            "meu_perfil": quem_ve.id == user.id,
            "cadernos": cadernos(db, user.id),
        }
    )


def editar(db: Session, user: User, dados: PerfilEditar) -> User:
    # exclude_unset: só o que veio no corpo do PATCH muda.
    mudancas = dados.model_dump(exclude_unset=True)
    # Nome não pode ficar vazio; null nele é ignorado.
    if mudancas.get("name", "") is None:
        del mudancas["name"]
    # Nos outros campos, null vale como "tirar" (texto vazio no banco).
    for campo, valor in mudancas.items():
        setattr(user, campo, "" if valor is None else valor)

    # O texto livre só vale quando a escolha é "outro" (contrato do PLANO),
    # olhando o valor final: mudar de "outro" para "fuvest" apaga o texto.
    if user.vestibular != "outro":
        user.vestibular_outro = ""
    if user.curso != "outro":
        user.curso_outro = ""

    db.commit()
    db.refresh(user)
    return user


def posts_do_perfil(
    db: Session, username: str, tag: str | None, offset: int, limit: int
) -> tuple[list[Post], int]:
    """Os posts de um caderno (ou de todos), do mais novo para o mais antigo."""
    user = buscar_ou_404(db, username)
    filtro = [Post.autor_id == user.id]
    if tag is not None:
        filtro.append(Post.tag == tag)

    total = db.scalar(select(func.count(Post.id)).where(*filtro)) or 0
    posts = list(
        db.scalars(
            select(Post)
            .where(*filtro)
            # id desempata posts do mesmo segundo, para a página não repetir.
            .order_by(Post.created_at.desc(), Post.id.desc())
            .offset(offset)
            .limit(limit)
        )
    )
    return posts, total
