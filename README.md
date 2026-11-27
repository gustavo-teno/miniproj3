# margem

**O diário de estudos da sua turma de vestibular.**

- **Site:** https://caderno-wheat.vercel.app
- **Vídeo de apresentação (4 min):**
  [baixar o vídeo](https://github.com/gustavo-teno/miniproj3/releases/download/video-entrega/margem-video.mp4)
  (29 MB), anexado à [release do vídeo](https://github.com/gustavo-teno/miniproj3/releases/tag/video-entrega)
- **Conta de demonstração:** `ada`, senha `senha-forte-123` (a mesma para
  todos os usuários do seed)
- **API:** https://caderno-api-p944.onrender.com, com a documentação das rotas
  em [/docs](https://caderno-api-p944.onrender.com/docs)

## A rede

Quem se prepara para o vestibular sozinho, em casa ou por cursinho online,
sente falta de uma turma. Vai procurá-la nas comunidades de estudo das redes
grandes, mas lá o estudo disputa espaço com polêmicas e assuntos aleatórios,
os servidores do Discord transformam horas estudadas em ranking, e a evolução
de cada um se perde no meio de tudo.

O margem é um espaço só para vestibulandos. Cada perfil é um diário de estudos
com divisórias por matéria, e cada post registra uma sessão de estudo e quanto
tempo ela durou. Ao se cadastrar, a pessoa escolhe a meta (vestibular e curso)
e cai na turma de quem tem a mesma meta, para o feed não começar vazio. O
margem nunca coloca ninguém num ranking: o perfil compara a pessoa só com ela
mesma, e a ofensiva de dias seguidos perdoa o dia de descanso.

As decisões de produto, o que cortamos e por quê estão no
[DECISIONS.md](DECISIONS.md).

## Roteiro de teste (para a banca)

No site no ar. Se o servidor grátis tiver dormido, a primeira visita leva uns
30 s; um agendamento visita a API a cada 10 min para isso não acontecer.

1. **Cadastro.** Em "Criar conta", escolha um nome, uma senha e a sua meta
   (por exemplo, ENEM e Medicina). Você entra direto na turma do seu
   vestibular.
2. **Follow.** Na aba "Chamada" da turma, siga duas ou três pessoas.
3. **Feed.** Clique em "Feed": aparecem os posts de quem você segue, do mais
   novo para o mais velho. Dá para filtrar por matéria e esconder o bate-papo.
4. **Post.** No alto do feed, registre uma sessão de estudo: o que estudou, a
   matéria, quanto tempo durou e, se quiser, uma foto do caderno.
5. **Diário.** Em "Meu diário", o post aparece na divisória da matéria, com a
   ofensiva e as horas da semana no topo.
6. **Curtir e comentar.** Abra um post de alguém, curta, comente e responda um
   comentário.
7. **Uma conta com histórico.** Saia (na engrenagem) e entre como `ada`: há
   mensagens não lidas em "Mensagens", avisos no sino de notificações e três
   semanas de diário.

## Funcionalidades

**Núcleo**
- **Cadastro e login** com a meta da pessoa: vestibular e curso escolhidos de
  uma lista, para "Medicina" e "medicina" não virarem duas metas, e a
  universidade.
- **Posts** com uma tag obrigatória: uma matéria ou "bate-papo". O post de
  matéria registra quanto tempo durou a sessão.
- **Feed** cronológico, só de quem você segue, com filtro por matéria e um
  botão para esconder o bate-papo.
- **Perfil-diário:** os posts separados por divisórias de matéria, com a meta,
  a ofensiva e as horas da semana (comparadas só com a semana anterior) no topo.
- **Seguir, curtir e comentar.**

**Do nicho**
- **Turmas:** todo mundo com o mesmo vestibular ou o mesmo curso forma uma
  turma, sem precisar entrar em nada. Quem acabou de se cadastrar cai na dela.
- **Ofensiva que perdoa:** os dias seguidos de estudo, com duas folgas por
  semana que não quebram a sequência.
- **Nenhum ranking:** as horas aparecem só no seu diário, comparadas com você
  mesmo.

**Extras**
- **Mensagens** entre quem se segue de volta, com curtida no balão e emoji.
- **Comentários em árvore**, com curtida em comentário e a tela "Ver conversa"
  para as conversas grandes.
- **Busca** de pessoas e de posts, sem ligar para acento.
- **Salvar posts** para rever depois, só para você.
- **Foto nos posts de matéria** (do caderno, do mapa mental), reduzida no
  navegador antes de enviar.
- **Notificações** de curtidas, comentários, respostas e novos seguidores.
- **Modo noturno** e telas pensadas para o celular.

Quem fez cada uma e por quê: tabela de Features do
[DECISIONS.md](DECISIONS.md#features).

## Como rodar na sua máquina

Precisa de Python 3.11 ou mais novo, com [uv](https://docs.astral.sh/uv/), e Node 20 ou mais
novo. Uma vez só:

```bash
cd backend && uv sync && cd ..
cd frontend && npm install && cp .env.local.example .env.local && cd ..
make seed
```

O seed cria 25 vestibulandos com metas variadas (todas as turmas têm gente),
três semanas de sessões de estudo, fotos em parte dos posts, follows,
curtidas, comentários com respostas e as conversas da `ada`.

Depois, em dois terminais:

```bash
make dev-back   # API em localhost:8000, documentação em localhost:8000/docs
make dev-front  # site em localhost:3000
```

Para conferir:

```bash
make check                     # o ambiente
make test                      # os testes do backend
cd frontend && npm run build   # o site compila
```

Se algo falhar, veja o [guia 00](docs/guias/00-setup.md). Não há migração: se
aparecer `no such column` depois de atualizar o código, o banco ficou velho, e
basta recriá-lo com `rm backend/app.db && make seed`.

## Onde está no ar

O site fica na Vercel e a API no Render, no plano grátis. Cada merge na `main`
publica os dois sozinhos. O disco do Render zera a cada reinício, então a API
roda o seed ao ligar e a rede nunca abre vazia. Os detalhes estão no
[DECISIONS.md](DECISIONS.md).

## Onde fica cada coisa

| Pasta | O que tem |
|---|---|
| `backend/app/models/` | As tabelas do banco (SQLAlchemy) |
| `backend/app/schemas/` | O formato do que entra e sai da API (Pydantic) |
| `backend/app/routers/` | As rotas, finas: recebem o pedido e chamam o service |
| `backend/app/services/` | As regras de cada feature (feed, turmas, notificações...) |
| `backend/app/core/` | Python puro, sem banco: a árvore de comentários (`arvore.py`), a ofensiva (`ofensiva.py`), os contadores (`contadores.py`) e o texto sem acento da busca (`texto.py`) |
| `backend/scripts/` | O seed da rede de demonstração |
| `backend/tests/` | Os testes, um arquivo por feature |
| `frontend/app/` | As telas (Next.js), uma pasta por endereço |
| `frontend/components/` | As peças das telas (card do post, botões, formulários) |
| `frontend/lib/` | A conversa com a API e o que as telas compartilham |

Uma feature passa pelas camadas nesta ordem. Salvar posts, por exemplo:
[model](backend/app/models/salvo.py) →
[schema](backend/app/schemas/salvo.py) →
[service](backend/app/services/salvos.py) →
[router](backend/app/routers/salvos.py) →
[BotaoSalvar](frontend/components/BotaoSalvar.tsx), o botão no pé de cada
post, e a tela [/salvos](frontend/app/salvos/page.tsx).

## Time

| Quem | Área | O que fez |
|---|---|---|
| Gustavo ([@gustavo-teno](https://github.com/gustavo-teno)) | Backend | O esqueleto do projeto, login, ofensiva, mensagens, busca, salvar posts, foto nos posts e notificações |
| Camila ([@camilaabmf](https://github.com/camilaabmf)) | Frontend | A identidade visual de caderno, o modo noturno, os posts e o perfil-diário |
| Clarisse ([@clarissegabriela31-coder](https://github.com/clarissegabriela31-coder)) | Dados | Curtidas, comentários em árvore, a página do post, o seed e o deploy |
| Pedro ([@Pedrolk647](https://github.com/Pedrolk647)) | Reforço | Follow, feed e turmas |

A divisão do trabalho está no [PLANO.md](PLANO.md).

## Documentos

| Documento | Para quê |
|---|---|
| [DECISIONS.md](DECISIONS.md) | Produto, decisões, features e a escolha técnica explicada |
| [PLANO.md](PLANO.md) e [docs/plano/](docs/plano/) | Quem faz o quê e o diário de cada papel |
| [RUBRICA.md](RUBRICA.md) | Como a banca avalia (Mini-projeto 3 da Trilha UFPB) |
| [CATALOGO.md](CATALOGO.md) e [CONTRATO.md](CONTRATO.md) | Ideias de features e rotas sugeridas pela Trilha |
| [docs/guias/](docs/guias/) | Os guias da Trilha (setup, autenticação, git em equipe, deploy...) |
