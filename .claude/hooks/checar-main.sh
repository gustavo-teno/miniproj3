#!/usr/bin/env bash
# Hook SessionStart: ao abrir o Claude, consulta o GitHub (git fetch, que só
# olha e não mexe em nada) e avisa se a main tem novidades. Nunca dá pull
# sozinho: atualizar é decisão de quem está trabalhando.

dir="${CLAUDE_PROJECT_DIR:-.}"
cd "$dir" 2>/dev/null || exit 0
git rev-parse --git-dir >/dev/null 2>&1 || exit 0

GIT_TERMINAL_PROMPT=0 git fetch --quiet origin main 2>/dev/null || {
  echo "Fluxo do time: não consegui consultar o GitHub agora (sem internet?). Antes de começar algo novo, rode: git checkout main && git pull"
  exit 0
}

branch="$(git branch --show-current 2>/dev/null)"
atras_main="$(git rev-list --count main..origin/main 2>/dev/null || echo 0)"

if [ "$branch" = "main" ]; then
  if [ "$atras_main" -gt 0 ]; then
    echo "Fluxo do time: a main do GitHub tem $atras_main commit(s) que a sua cópia local não tem. Avise o usuário e sugira atualizar com 'git pull' antes de começar."
  else
    echo "Fluxo do time: a main local está atualizada. Para começar uma feature, crie uma branch (git checkout -b feat/<feature>)."
  fi
else
  atras_branch="$(git rev-list --count HEAD..origin/main 2>/dev/null || echo 0)"
  if [ "$atras_branch" -gt 0 ]; then
    echo "Fluxo do time: você está na branch '$branch', e a main do GitHub tem $atras_branch commit(s) que esta branch não tem. Avise o usuário. Para trazer as novidades (com tudo commitado antes): git fetch origin && git merge origin/main. A skill /abrir-pr já faz isso antes do PR."
  fi
fi

# Só no clone de quem tem o remote da Trilha (o dono do fork): avisa se a
# Trilha publicou correções que o fork ainda não tem.
if git remote get-url upstream >/dev/null 2>&1; then
  if GIT_TERMINAL_PROMPT=0 git fetch --quiet upstream main 2>/dev/null; then
    atras_trilha="$(git rev-list --count origin/main..upstream/main 2>/dev/null || echo 0)"
    if [ "$atras_trilha" -gt 0 ]; then
      echo "Fluxo do time: o repositório da Trilha (upstream) tem $atras_trilha commit(s) novos que o fork ainda não tem. Avise o usuário; para trazer, ele pode usar o botão 'Sync fork' no GitHub."
    fi
  fi
fi

exit 0
