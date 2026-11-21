---
name: abrir-pr
description: Abre o PR da branch atual seguindo o fluxo do time (atualiza com a main, roda os testes, sobe a branch e abre o PR com Closes #N). Use sempre que o usuário quiser abrir um PR, entregar uma feature ou "mandar para revisão".
---

# Abrir PR no fluxo do time

Siga os passos na ordem. Se um passo falhar, pare, explique o problema ao
usuário em linguagem simples e não pule para o próximo.

## 1. Conferir a branch

- Rode `git branch --show-current`. Se for `main`, pare: explique que o
  trabalho precisa estar numa branch (`feat/<feature>`, `fix/...`, `docs/...`
  ou `chore/...`) e ofereça criar uma com o que já foi feito.
- Rode `git status`. Se houver mudanças não commitadas, mostre quais são e
  pergunte se devem entrar num commit antes do PR. Commits pequenos, em
  português, dizendo o porquê (veja o CLAUDE.md).

## 2. Descobrir a issue

- Pergunte ao usuário o número da issue que este PR fecha, se ainda não
  souber. Para ajudar, liste as issues abertas:
  `gh issue list --repo <dono/repo do origin>`.
- Se não existir issue para essa feature, peça ao usuário para criar uma
  (template "Feature") antes de continuar. Toda feature tem issue.

## 3. Trazer as novidades da main

```bash
git fetch origin
git merge origin/main
```

- Se der conflito, pare e ajude a resolver seguindo o guia
  `docs/guias/02-git-em-equipe.md` (no `backend/app/main.py`, as duas linhas
  de `include_router` ficam). Depois de resolver: `git add` nos arquivos e
  `git commit` com a mensagem padrão do merge.

## 4. Rodar os testes

```bash
make test
```

- Tudo precisa passar (`skipped` é aceitável; `failed` ou `error` não).
- Se a branch mexeu no frontend, rode também `cd frontend && npm run build`
  e confira que compila.
- Se algo falhar, pare e mostre o erro. Não abra PR com teste quebrado.

## 5. Subir a branch

```bash
git push -u origin <branch>
```

## 6. Abrir o PR

- Descubra o dono/nome do repositório do time a partir de
  `git remote get-url origin` (ex.: `https://github.com/dono/miniproj3.git`
  vira `dono/miniproj3`). O PR vai para a `main` desse repositório, nunca
  para o repositório da Trilha.
- Abra com:

```bash
gh pr create --repo <dono/repo> --base main --head <branch> \
  --title "<resumo curto do que muda>" --body "<corpo abaixo>"
```

Corpo do PR (preencha com o que a branch realmente faz):

```markdown
## O que muda

<uma ou duas frases>

## Como testar

<passos para o revisor ver funcionando, ex.: make seed, make dev-back, abrir /docs e chamar POST /posts>

Closes #<número da issue>
```

## 7. Pedir revisão

- Pergunte ao usuário qual colega vai revisar e adicione:
  `gh pr edit <número> --repo <dono/repo> --add-reviewer <username>`.
- Mostre o link do PR ao usuário e lembre: quem aprova é o colega. Depois da
  aprovação, o merge pode ser feito pelo botão do GitHub ou pedindo ao Claude
  (regra 6 do CLAUDE.md).
