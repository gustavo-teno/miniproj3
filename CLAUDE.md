# CLAUDE.md

Rede social de nicho da Trilha UFPB: FastAPI + SQLite em `backend/`, Next.js em
`frontend/`. Entrega: 27/11/2026. Contexto em `README.md`, `RUBRICA.md`,
`DECISIONS.md` e `docs/guias/`. Comandos (da raiz): `make check`, `make test`,
`make seed`, `make dev-back`, `make dev-front`.

**Leia o `PLANO.md` no início de cada sessão:** ele diz o papel de quem está
usando você e o que é de outra pessoa. O plano dia a dia e o diário de
progresso de cada papel ficam em `docs/plano/`.

## Fluxo de git (guia 02, obrigatório)

1. Nunca commitar nem dar push na `main` (um hook bloqueia).
2. Antes de algo novo: `git checkout main && git pull`. Se o hook de início de
   sessão avisar que há novidades, mostre ao usuário. Não dê pull/merge com
   mudanças não commitadas sem perguntar.
3. Uma branch por feature, ligada a uma issue: `feat/`, `fix/`, `docs/`,
   `chore/` + nome curto.
4. Commits pequenos, em português, dizendo o porquê.
5. PR sempre com a skill `/abrir-pr`, para a `main` do `origin` (o fork do
   time), nunca para o repositório da Trilha. No `gh`, passe `--repo`.
6. Merge só quando o usuário pedir e o PR estiver aprovado por outra pessoa
   (`gh pr view --json reviewDecision` = `APPROVED`): `gh pr merge --merge
   --delete-branch`. Nunca aprove PR em nome do usuário.

## Banco desatualizado

O banco local (`backend/app.db`) não acompanha sozinho as mudanças nos models.
Depois de um `git pull` que mexeu em `backend/app/models/`, erros como
`no such column` ou `no such table` querem dizer que o banco ficou velho. A
correção é apagar e recriar (os dados são só de teste): `rm backend/app.db &&
make seed`. Explique isso ao usuário antes de apagar. O hook de início de
sessão avisa quando o banco é mais velho que os models.

Nunca versionar `*.db`, `.env*` (exceto os `.example`) ou chaves. Não edite router/model de outro
dono sem combinar.
