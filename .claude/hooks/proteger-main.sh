#!/usr/bin/env bash
# Hook PreToolUse: impede o Claude de commitar ou dar push na main e de dar
# push --force. Recebe o JSON da ferramenta pela entrada padrão. Sair com
# código 2 bloqueia o comando e mostra a mensagem ao Claude.
#
# Analisa só os comandos git de verdade (subcomando e argumentos), não o texto
# de mensagens de commit, para não bloquear por engano.

entrada="$(cat)"

# Extrai o valor de "command" do JSON (sem depender de jq).
cmd="$(printf '%s' "$entrada" \
  | grep -oE '"command"[[:space:]]*:[[:space:]]*"([^"\\]|\\.)*"' \
  | head -n 1 \
  | sed -E 's/^"command"[[:space:]]*:[[:space:]]*"//; s/"$//')"
[ -n "$cmd" ] || exit 0

dir="${CLAUDE_PROJECT_DIR:-.}"
branch="$(git -C "$dir" branch --show-current 2>/dev/null)"

bloquear() {
  echo "BLOQUEADO pelo fluxo do time: $1" >&2
  echo "Siga o fluxo do CLAUDE.md: trabalhe numa branch (ex.: git checkout -b feat/<feature>) e abra o PR com /abrir-pr." >&2
  exit 2
}

# Quebra o comando em partes (quebras de linha, &&, ||, ;, |).
nl=$'\n'
cmd="${cmd//\\n/$nl}"
cmd="${cmd//&&/$nl}"
cmd="${cmd//||/$nl}"
cmd="${cmd//;/$nl}"
cmd="${cmd//|/$nl}"

while IFS= read -r parte; do
  read -ra w <<< "$parte"
  i=0
  # pula "sudo" e variáveis de ambiente (VAR=valor) antes do git
  while [ $i -lt ${#w[@]} ] && { [ "${w[$i]}" = "sudo" ] || [[ "${w[$i]}" == *=* && "${w[$i]}" != -* ]]; }; do
    i=$((i + 1))
  done
  [ "${w[$i]}" = "git" ] || continue
  i=$((i + 1))
  # pula opções globais do git (ex.: git -C pasta push)
  while [ $i -lt ${#w[@]} ] && [[ "${w[$i]}" == -* ]]; do
    case "${w[$i]}" in -C|-c) i=$((i + 1)) ;; esac
    i=$((i + 1))
  done
  sub="${w[$i]}"
  args=("${w[@]:$((i + 1))}")

  case "$sub" in
    push)
      for a in "${args[@]}"; do
        a="${a//\\/}"; a="${a//\"/}"; a="${a//\'/}"
        case "$a" in
          --force|--force-with-lease*|--force-if-includes) bloquear "push --force reescreve o histórico do time e não é permitido." ;;
          --*) ;;
          -*f*) bloquear "push --force reescreve o histórico do time e não é permitido." ;;
          +*) bloquear "push com + força a reescrita do histórico e não é permitido." ;;
          main|*:main|refs/heads/main|*:refs/heads/main) bloquear "push direto para a main não é permitido." ;;
        esac
      done
      [ "$branch" = "main" ] && bloquear "você está na main, e push da main não é permitido."
      ;;
    commit)
      [ "$branch" = "main" ] && bloquear "você está na main, e commit na main não é permitido."
      ;;
  esac
done <<< "$cmd"

exit 0
