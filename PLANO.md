# Plano do time

Quem faz o quê até a entrega (sexta, 27/11). O produto está no
[DECISIONS.md](DECISIONS.md), e este arquivo diz como vamos construí-lo.

> **Para o Claude de cada pessoa:** descubra quem está usando você com
> `gh api user -q .login` e procure esse usuário na tabela abaixo. Ajude essa
> pessoa a seguir o plano da letra dela (A, B, C ou D), na ordem dos dias. Antes
> de mexer em algo que é de outra pessoa (model, rota ou tela), avise o usuário.

## Quem faz o quê

O plano tem quatro papéis: A (Back), B (Front), C (Dados) e D (Reforço). Cada
pessoa escolhe um. Como só o Gustavo e a Camila estão disponíveis no fim de
semana, **A e B ficam entre os dois**, e **C e D ficam entre a Clarisse e o
Pedro**, que começam na segunda.

Seguindo o guia 07, ninguém fica só numa camada: cada pessoa faz as próprias
features de ponta a ponta (backend, tela e testes). A área é o que ela cuida e
revisa nos PRs dos outros.

| Papel | Quem | GitHub | Começa | Área | Features (na ordem) |
|---|---|---|---|---|---|
| A | _a escolher_ | | sáb 21 | Backend: models, routers, services, `main.py` | Esqueleto → Auth → Ofensiva que perdoa |
| B | _a escolher_ | | sáb 21 | Frontend: layout, navegação, `lib/api.ts`, identidade visual | Base visual → Posts → Perfil-diário |
| C | _a escolher_ | | seg 23 | Dados: seed, `core/` e deploy | Curtidas → Comentários → Seed fake → Deploy |
| D | _a escolher_ | | seg 23 | Reforço: testes e o fluxo inteiro na tela | Follow → Feed → Turmas |

GitHub do time: @gustavo-teno, @camilaabmf, @clarissegabriela31-coder,
@Pedrolk647.

**DMs entre mútuos** (opcional, decisão 6) não têm dono fixo: quem terminar a
própria parte primeiro pega, a partir de quarta.

## Por que essa divisão deixa todo mundo independente

O que costuma travar um time é esperar a auth, esperar o model de outra pessoa
ou brigar com conflito no `main.py`. O esqueleto da Pessoa A resolve os três de
uma vez no sábado:

- **Bypass da auth** (guia 01, Passo 0): com `DEBUG=true` e o header
  `X-User-Id`, qualquer rota funciona antes do login existir.
- **Todos os models** já criados, com os campos abaixo. Ninguém espera o model
  de outra pessoa, e o seed pode começar na segunda.
- **Um router vazio por feature**, já registrado no `main.py`. Cada pessoa só
  mexe no próprio arquivo.

Depois do esqueleto, as únicas dependências são de dados, não de código:
- **Curtidas e Comentários** precisam de posts no banco. Os Posts da Pessoa B
  saem no fim de semana, mas dá para criar posts direto pelo Swagger.
- **O Feed** precisa de follows. Follow e Feed ficam com a mesma pessoa (D).
- **A ofensiva aparece no perfil.** A Pessoa A entrega a rota e um componente
  `<Ofensiva username=... />`, e a Pessoa B só coloca o componente na página.

Os pontos em que duas pessoas mexem na mesma coisa estão marcados com
**Combinar com** no plano de cada uma.

## O contrato (definido no esqueleto)

**Tags:** `matematica`, `fisica`, `quimica`, `biologia`, `portugues`,
`literatura`, `redacao`, `historia`, `geografia`, `filosofia`, `sociologia`,
`ingles`, `espanhol` e `bate-papo`. A lista fica numa constante no backend,
para que ninguém escreva a sua própria. O mesmo vale para as listas de
vestibulares e de cursos, que formam as Turmas (decisão 5). A Pessoa A propõe
essas duas listas no PR do esqueleto, e o time ajusta na revisão.

As folgas da ofensiva são fixas (2 por semana, decisão 4), então não há campo
de folgas no `User`.

| Model | Campos além de `id` e `created_at` |
|---|---|
| `User` (existe) | + `vestibular` e `curso` (valores de uma lista fixa, podem ser vazios), `universidade` (texto livre, pode ser vazio) |
| `Post` | `autor_id`, `texto`, `tag` (padrão `bate-papo`), `minutos` (opcional: duração da sessão) |
| `Follow` | `seguidor_id`, `seguido_id` (par único) |
| `Like` | `user_id`, `post_id` (par único) |
| `Comment` | `autor_id`, `post_id`, `texto` |
| `Mensagem` | `remetente_id`, `destinatario_id`, `texto` (para as DMs; se elas forem cortadas, o model sai) |

A tag tem padrão `bate-papo` na API para que os testes do núcleo, que postam só
com `texto`, continuem passando. **Na tela, escolher a tag é obrigatório**
(decisão 2).

As rotas e os status seguem os testes em `backend/tests/test_nucleo.py`. A
tabela "Quem depende de quem" do guia 07 mostra qual teste precisa de qual
rota.

## Cronograma

| Dia | A (Back) | B (Front) | C (Dados) | D (Reforço) |
|---|---|---|---|---|
| **sáb 21** | Esqueleto (PR pequeno, B revisa) | Base visual | | |
| **dom 22** | Auth no backend | Posts: backend + tela + card | | |
| **seg 23** | Auth na tela | Perfil: backend + topo com a meta | Curtidas | Follow |
| **ter 24** | Ofensiva: cálculo em `core/` + testes | Perfil: divisórias e edição | Comentários | Feed + tirar os `@skip` |
| **qua 25** | Ofensiva: rota, componente e resumo da semana | Ajustes visuais nas telas de todo mundo | Seed com cara de vestibulando | Turmas |
| **qui 26** | DECISIONS: escolha técnica | Gravar o vídeo | Deploy (+10) | Revisar o fluxo inteiro na tela |
| **sex 27** | **Todos:** pitch, uso de IA no DECISIONS, folga para imprevistos e entrega | | | |

**Meta da terça à noite:** o fluxo cadastro → login → post → follow → feed
funcionando na tela. É ele que a banca testa e que vai para o vídeo.

## O plano de cada pessoa

Cada dia é uma branch, uma issue e um PR, revisado pela pessoa da área. Os
nomes de rota abaixo são os dos testes do núcleo; o que não está nos testes é
sugestão, e o dono pode mudar avisando quem usa.

### Pessoa A (Back): Esqueleto → Auth → Ofensiva

**Sáb 21: esqueleto.** É o único bloqueio do time, então sai cedo e pequeno.
- `app/deps.py`: o bypass do guia 01, Passo 0 (`DEBUG=true` + `X-User-Id`).
- Os models da tabela do contrato, cada um no seu arquivo em `app/models/`, e
  os campos novos do `User`.
- As constantes: tags, vestibulares e cursos (primeira versão das duas
  últimas listas, para o time revisar).
- Um router vazio por feature em `app/routers/` (`auth`, `posts`, `follows`,
  `curtidas`, `comentarios`, `feed`, `ofensiva`, `turmas`, `dms`), todos
  registrados no `main.py`.
- `make test` continua verde (os testes do núcleo seguem com `@skip`).
- **Combinar com B:** B revisa e aprova o PR. Avisar no grupo quando entrar na
  `main`, porque todo mundo parte dele.

**Dom 22: auth no backend** (guia 01, Passos 1 a 3).
- Model `Session` (token opaco), senha com bcrypt.
- `POST /auth/registro` (aceita `vestibular`, `curso` e `universidade`
  opcionais, para o cadastro já trazer a meta), `POST /auth/login`,
  `GET /auth/eu` e o `get_current_user` real, mantendo o bypass com `DEBUG`.
- Tirar o `@skip` de `test_auth_registro`, `test_auth_login` e `test_auth_eu`.
  A partir daqui a fixture `logar` funciona e os outros testes podem destravar.

**Seg 23: auth na tela.**
- Páginas `/cadastro` (nome, username, senha e a meta: vestibular e curso em
  lista, universidade em texto) e `/login`; botão de sair.
- Salvar o token e mandá-lo no `Authorization` de `lib/api.ts`; páginas
  protegidas mandam para `/login` sem token.
- Depois do cadastro, levar a pessoa para a própria turma (decisão 3). Até a
  tela de Turmas existir (quarta), levar para o feed.
- **Combinar com B:** `lib/api.ts` é da área dela. **Com D:** o endereço da
  página da turma.

**Ter 24: cálculo da ofensiva.**
- `app/core/ofensiva.py`, em Python puro: recebe os dias com post de matéria e
  devolve a ofensiva atual e o recorde, com 2 folgas por semana (segunda a
  domingo, horário de Brasília).
- Testes dos casos de borda: semana virando, post perto da meia-noite, folga
  que não soma, ofensiva quebrada com recorde, post de bate-papo que não conta.

**Qua 25: ofensiva no produto.**
- `GET /usuarios/{username}/ofensiva` → ofensiva atual, recorde e o resumo da
  semana (horas desta semana e da passada, somando os `minutos` dos posts).
- Componente `<Ofensiva username=... />` com o número, o recorde ao lado
  quando quebrou, e o "esta semana: 12h, semana passada: 9h".
- **Combinar com B:** onde o componente entra no topo do perfil.

**Qui 26:** escrever a escolha técnica no DECISIONS.md (por que a ofensiva fica
em `core/` e qual o Big O do cálculo). Se sobrar tempo, pegar as DMs.

**Revisa:** PRs que mexem em models, routers, services e `main.py`.

### Pessoa B (Front): Base visual → Posts → Perfil-diário

**Sáb 21: base visual.** Não depende do esqueleto, começa logo.
- `layout.tsx`: navegação com Feed, Turmas, Perfil e Sair.
- Identidade de caderno (decisão 2): fonte, cores, fundo de papel e uma cor por
  matéria, num mapa único `tag → nome e cor` que todas as telas usam.
- Nome da rede provisório, numa constante só, para trocar em um lugar quando o
  time decidir (até quarta, antes do vídeo).
- `lib/api.ts`: enquanto o login não existe, mandar o header `X-User-Id`
  (de uma variável de ambiente, só em desenvolvimento). Tipos novos: `Post`,
  `Perfil`.

**Dom 22: posts.**
- Backend: `POST`, `GET`, `PATCH` e `DELETE /posts` (só o autor edita e
  apaga), tag validada contra a lista, `minutos` opcional, e o autor no
  retorno. Tirar o `@skip` de `test_posts_crud` quando a auth do A entrar.
- Tela: formulário de postar com a tag obrigatória e o campo de duração.
- Componente `<CardPost>`, usado no feed, no perfil e nas turmas: autor, tag
  com a cor da matéria, duração, data, e um espaço para os botões de curtir e
  comentar.
- **Combinar com C e D:** o `<CardPost>` é a peça que mais gente usa. Avisar
  no grupo quando ele entrar na `main`.

**Seg 23: perfil (backend e topo).**
- `GET /usuarios/{username}` com a meta e os contadores `seguidores` e
  `seguindo` (contados na tabela de follows, que já existe desde o esqueleto);
  `PATCH /usuarios/eu` (bio, avatar e meta); `GET /usuarios/{username}/posts`
  paginado, com filtro opcional por tag.
- Tela `/u/[username]`: topo com nome, meta e contadores.
- Tirar o `@skip` de `test_perfil_editavel`.
- **Combinar com D:** o formato do `GET /usuarios/{username}`, que o teste de
  follow também lê.

**Ter 24: o diário.**
- Divisórias por matéria: uma aba por tag, com a contagem de posts.
- Tela de editar o perfil.
- Colocar no perfil o botão de seguir (D) e, quando sair, o `<Ofensiva />` (A).

**Qua 25:** ajustes visuais nas telas de todo mundo, estados vazios e tela de
celular.

**Qui 26:** gravar o vídeo (cerca de 4 minutos): cadastro, login, post, follow
e feed, depois a ofensiva e as Turmas, e uma decisão de produto ("a rede não
compara por você").

**Revisa:** PRs que mexem em layout, navegação, `lib/api.ts` e componentes
compartilhados.

### Pessoa C (Dados): Curtidas → Comentários → Seed → Deploy

**Seg 23: curtidas.** Começa com `make check` verde (guia 00).
- `POST` e `DELETE /posts/{id}/curtir`, idempotentes.
- O `GET /posts/{id}` ganha `curtidas` e `curtido_por_mim`.
- Botão de curtir dentro do `<CardPost>`.
- Tirar o `@skip` de `test_curtidas_idempotentes`.
- **Combinar com B:** o schema do post e o `<CardPost>` são dela.

**Ter 24: comentários.**
- `POST` e `GET /posts/{id}/comentarios`, em ordem cronológica e paginados.
- Tela: lista de comentários e campo para comentar, a partir do card.
- O post ganha a contagem de comentários.
- Tirar o `@skip` de `test_comentarios_planos_cronologicos`.

**Qua 25: seed com cara de vestibulando.** O nicho tem que aparecer no seed
(rubrica, Produto, pergunta 3).
- `seed_fake(db)` em `scripts/seed.py`: pelo menos 20 usuários, 50 posts, 20
  follows e 30 curtidas (o teste do núcleo exige), mais comentários.
- Metas espalhadas para que cada turma tenha gente; posts escritos como um
  vestibulando escreve, com tag de matéria e duração, nas últimas semanas.
- Uns com a ofensiva em dia, outros com ela quebrada e um recorde, para a
  ofensiva aparecer de verdade no vídeo.
- Um usuário de demonstração com senha conhecida, para o vídeo e para a banca.
- Tirar o `@skip` de `test_seed_fake_popula_a_rede`.
- **Combinar com A:** usar a mesma função de hash da auth e as listas do
  contrato.

**Qui 26: deploy (+10)** seguindo o guia 08: backend no Render, front na
Vercel, `SEED_ON_BOOT`, CORS com a URL pública e nunca `DEBUG` em produção.
Testar cadastro → login → post → follow → feed na URL.

**Revisa:** PRs que mexem no seed, em `core/` e na configuração do deploy.

### Pessoa D (Reforço): Follow → Feed → Turmas

**Seg 23: follow.** Começa com `make check` verde (guia 00).
- `POST` e `DELETE /usuarios/{username}/follow`, idempotentes.
- Componente `<BotaoSeguir username=... />`, usado no perfil e nas turmas.
- Tirar o `@skip` de `test_follow_unfollow_com_contadores`.
- **Combinar com B:** os contadores ficam no `GET /usuarios/{username}` dela.

**Ter 24: feed e núcleo verde.**
- `GET /feed`, cronológico e paginado, só de quem você segue, com opção de
  esconder o bate-papo.
- Tela inicial: feed com "carregar mais", o filtro de bate-papo, e o feed vazio
  com um convite para conhecer a turma (decisão 3).
- Tirar o `@skip` de `test_feed_cronologico_dos_seguidos` e conferir se todos
  os testes do núcleo passam. É a meta da terça à noite.

**Qua 25: Turmas** (decisão 5).
- Rotas para listar as turmas (uma por vestibular e uma por curso, com o número
  de membros), os membros de uma turma e os posts deles, com filtro por
  matéria.
- Aba Turmas e a página da turma: membros com `<BotaoSeguir />` e posts com
  `<CardPost>`.
- **Combinar com A:** o cadastro leva para a turma. **Com C:** o seed precisa
  encher as turmas.

Turmas fica com D porque a página da turma junta Follow e Feed: uma lista de
gente para seguir e um feed dos membros.

**Qui 26:** fazer o fluxo inteiro na tela como a banca faria, abrir uma issue
para cada bug e corrigir os do núcleo primeiro. Se der, um teste autoral de
follow ou feed (guia 09).

**Revisa:** o fluxo inteiro na tela antes dos merges e os testes. Reforça quem
estiver mais atrasado.

## Ordem de prioridade

1. **Núcleo** funcionando na tela até terça. Inegociável.
2. **Ofensiva e Turmas** (decisões 4 e 5 do DECISIONS.md).
3. **DMs entre mútuos** (decisão 6). **Opcional**, mas provavelmente entra:
   quem terminar a própria parte pega.

Se a DM não couber, ela vai para o "O que cortamos" no DECISIONS.md, com o
motivo.

## Combinados

- Uma branch e uma issue por feature. O PR fecha a issue com `Closes #N`.
- PR pequeno e cedo é melhor que PR grande no fim. Quem é da área revisa,
  e qualquer pessoa pode aprovar se a da área estiver fora.
- Travou mais de 1 hora? Avisa no grupo.
- Este plano muda junto com o projeto. Se trocar alguma tarefa, atualize a
  tabela.
