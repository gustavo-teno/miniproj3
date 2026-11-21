# Pessoa A (Back): Esqueleto → Auth → Ofensiva

Plano e diário de progresso da Pessoa A. Quem ocupa o papel está na
tabela "Quem faz o quê" do [PLANO.md](../../PLANO.md), junto com o cronograma
do time e o contrato.

**Como usar:** marque `[x]` no que ficou pronto, no mesmo PR da tarefa. Anote
abaixo, em "Diário", o que mudou no plano, decisões pequenas e bugs. Bug que
trava outra pessoa vira issue, com o link aqui.

## Plano

**Sáb 21: esqueleto.** É o único bloqueio do time, então sai cedo e pequeno.
- [ ] `app/deps.py`: o bypass do guia 01, Passo 0 (`DEBUG=true` + `X-User-Id`).
- [ ] Os models da tabela do contrato, cada um no seu arquivo em `app/models/`, e
    os campos novos do `User`.
- [ ] As constantes: tags, vestibulares e cursos (primeira versão das duas
    últimas listas, para o time revisar).
- [ ] Um router vazio por feature em `app/routers/` (`auth`, `posts`, `follows`,
    `curtidas`, `comentarios`, `feed`, `ofensiva`, `turmas`, `dms`), todos
    registrados no `main.py`.
- [ ] `make test` continua verde (os testes do núcleo seguem com `@skip`).
- **Combinar com B:** B revisa e aprova o PR. Avisar no grupo quando entrar na
    `main`, porque todo mundo parte dele.

**Dom 22: auth no backend** (guia 01, Passos 1 a 3).
- [ ] Model `Session` (token opaco), senha com bcrypt.
- [ ] `POST /auth/registro` (aceita `vestibular`, `curso` e `universidade`
    opcionais, para o cadastro já trazer a meta), `POST /auth/login`,
    `GET /auth/eu` e o `get_current_user` real, mantendo o bypass com `DEBUG`.
- [ ] Tirar o `@skip` de `test_auth_registro`, `test_auth_login` e `test_auth_eu`.
    A partir daqui a fixture `logar` funciona e os outros testes podem destravar.

**Seg 23: auth na tela.**
- [ ] Páginas `/cadastro` (nome, username, senha e a meta: vestibular e curso em
    lista, universidade em texto; quem escolhe "Outro" pode escrever qual é a
    meta) e `/login`; botão de sair.
- [ ] Salvar o token e mandá-lo no `Authorization` de `lib/api.ts`; páginas
    protegidas mandam para `/login` sem token.
- [ ] Depois do cadastro, levar a pessoa para a própria turma (decisão 3). Até a
    tela de Turmas existir (quarta), levar para o feed.
- **Combinar com B:** `lib/api.ts` é da área dela. **Com D:** o endereço da
    página da turma.

**Ter 24: cálculo da ofensiva.**
- [ ] `app/core/ofensiva.py`, em Python puro: recebe os dias com post de matéria e
    devolve a ofensiva atual e o recorde, com 2 folgas por semana (segunda a
    domingo, horário de Brasília).
- [ ] Testes dos casos de borda: semana virando, post perto da meia-noite, folga
    que não soma, ofensiva quebrada com recorde, post de bate-papo que não conta.

**Qua 25: ofensiva no produto.**
- [ ] `GET /usuarios/{username}/ofensiva` → ofensiva atual, recorde e o resumo da
    semana (horas desta semana e da passada, somando os `minutos` dos posts).
- [ ] Componente `<Ofensiva username=... />` com o número, o recorde ao lado
    quando quebrou, e o "esta semana: 12h, semana passada: 9h".
- **Combinar com B:** onde o componente entra no topo do perfil.

**Qui 26:** escrever a escolha técnica no DECISIONS.md (por que a ofensiva fica
em `core/` e qual o Big O do cálculo). Se sobrar tempo, pegar as DMs.

**Revisa:** PRs que mexem em models, routers, services e `main.py`.

## Diário

<!-- Uma linha por anotação, a mais nova em cima. Ex.:
- **ter 24:** feed pronto; a paginação devolvia o post repetido (#12, corrigido).
-->
