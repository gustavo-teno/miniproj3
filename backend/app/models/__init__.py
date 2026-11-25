# 1 arquivo por model — evita conflito de merge quando o time trabalha em paralelo.
# Importar aqui registra a tabela no Base, e o create_all do main.py a cria.
from app.models.comment import Comment  # noqa: F401
from app.models.follow import Follow  # noqa: F401
from app.models.leitura import Leitura  # noqa: F401
from app.models.like import Like  # noqa: F401
from app.models.mensagem import Mensagem  # noqa: F401
from app.models.post import Post  # noqa: F401
from app.models.sessao import Sessao  # noqa: F401
from app.models.user import User  # noqa: F401
