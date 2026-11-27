# margem

**O diário de estudos da sua turma de vestibular.**

Site no ar: **https://caderno-wheat.vercel.app**
Conta de demonstração: `ada`, senha `senha-forte-123`

## A rede

Quem se prepara para o vestibular sozinho, em casa ou por cursinho online,
sente falta de uma turma. Vai procurá-la nas comunidades de estudo das redes
grandes, mas lá o estudo disputa espaço com polêmicas e assuntos aleatórios,
os servidores do Discord transformam horas estudadas em ranking, e a evolução
de cada um se perde no meio de tudo.

A margem é um espaço só para vestibulandos. Cada perfil é um diário de estudos
com divisórias por matéria, e cada post registra uma sessão de estudo e quanto
tempo ela durou. Ao se cadastrar, a pessoa escolhe a meta (vestibular e curso)
e cai na turma de quem tem a mesma meta, para o feed não começar vazio. A rede
nunca coloca ninguém num ranking: o perfil compara a pessoa só com ela mesma,
e a ofensiva de dias seguidos perdoa o dia de descanso.

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
   mensagens não lidas em "Mensagens" (só entre quem se segue de volta),
   avisos no sino de notificações e três semanas de diário.

## O que tem

| | |
|---|---|
| Núcleo | Cadastro e login, posts com matéria e duração, feed, perfil-diário, seguir, curtidas, comentários e uma rede de 25 vestibulandos fictícios |
| Do nicho | Turmas por meta, ofensiva que perdoa, horas da semana comparadas só com você |
| Extras | Mensagens entre quem se segue, comentários em árvore, busca de pessoas e posts, salvar posts, foto nos posts de matéria, notificações, modo noturno |

Quem fez cada uma e por quê: tabela de Features do [DECISIONS.md](DECISIONS.md#features).

## Como rodar na sua máquina

Precisa de Python 3.12 com [uv](https://docs.astral.sh/uv/) e Node 20 ou mais novo.
Uma vez só:

```bash
cd backend && uv sync && cd ..
cd frontend && npm install && cp .env.local.example .env.local && cd ..
make seed       # cria a rede de demonstração (entre como ada, senha-forte-123)
```

Depois, em dois terminais:

```bash
make dev-back   # API em localhost:8000, documentação em localhost:8000/docs
make dev-front  # site em localhost:3000
```

Para conferir: `make check` (ambiente) e `make test` (testes do backend). Se
algo falhar, veja o [guia 00](docs/guias/00-setup.md). Se aparecer
`no such column` depois de atualizar o código, o banco ficou velho:
`rm backend/app.db && make seed`.

## Onde fica cada coisa

| Pasta | O que tem |
|---|---|
| `backend/app/models/` | As tabelas do banco (SQLAlchemy) |
| `backend/app/schemas/` | O formato do que entra e sai da API (Pydantic) |
| `backend/app/routers/` | As rotas, finas: recebem o pedido e chamam o service |
| `backend/app/services/` | As regras de cada feature (feed, turmas, notificações...) |
| `backend/app/core/` | Estruturas de dados em Python puro: árvore de comentários, ofensiva, contadores |
| `backend/scripts/` | O seed da rede de demonstração |
| `backend/tests/` | Os testes, um arquivo por feature |
| `frontend/app/` | As telas (Next.js), uma pasta por endereço |
| `frontend/components/` | As peças das telas (card do post, botões, formulários) |
| `frontend/lib/` | A conversa com a API e o que as telas compartilham |

## Time

Gustavo ([@gustavo-teno](https://github.com/gustavo-teno)), Camila
([@camilaabmf](https://github.com/camilaabmf)), Clarisse
([@clarissegabriela31-coder](https://github.com/clarissegabriela31-coder)) e
Pedro ([@Pedrolk647](https://github.com/Pedrolk647)). Quem fez o quê está no
[PLANO.md](PLANO.md) e no [DECISIONS.md](DECISIONS.md), e o uso de IA de cada
um, no fim do DECISIONS.

## Material da disciplina

Mini-projeto 3 da Trilha UFPB, entregue em 27/11/2026: [RUBRICA.md](RUBRICA.md)
(como a banca avalia), [CATALOGO.md](CATALOGO.md) e [CONTRATO.md](CONTRATO.md)
(ideias de features e rotas) e os guias em [docs/guias/](docs/guias/).
