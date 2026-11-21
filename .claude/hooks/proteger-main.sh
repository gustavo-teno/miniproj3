#!/usr/bin/env bash
# Hook PreToolUse: impede o Claude de commitar ou dar push na main e de dar
# push --force. Recebe o JSON da ferramenta pela entrada padrão. Sair com
# código 2 bloqueia o comando e mostra a mensagem ao Claude.
#
# Analisa só os comandos git de verdade (subcomando e argumentos). O que está
# entre aspas (ex.: a mensagem de um commit) não é quebrado em comandos, para
# não bloquear por engano um commit cuja mensagem cita "git push origin main".
#
# É uma ajuda para o Claude seguir o fluxo, não uma barreira: comandos dentro
# de "bash -c '...'" ou depois de um "cd outra-pasta" não são analisados. Quem
# garante que nada entra na main sem aprovação é a proteção da branch no GitHub.

entrada="$(cat)"

# Extrai o valor de "command" do JSON (sem depender de jq).
cmd="$(printf '%s' "$entrada" \
  | grep -oE '"command"[[:space:]]*:[[:space:]]*"([^"\\]|\\.)*"' \
  | head -n 1 \
  | sed -E 's/^"command"[[:space:]]*:[[:space:]]*"//; s/"$//')"
[ -n "$cmd" ] || exit 0

dir="${CLAUDE_PROJECT_DIR:-.}"

bloquear() {
  echo "BLOQUEADO pelo fluxo do time: $1" >&2
  echo "Siga o fluxo do CLAUDE.md: trabalhe numa branch (ex.: git checkout -b feat/<feature>) e abra o PR com /abrir-pr." >&2
  exit 2
}

# Desfaz os escapes do JSON (\" \\ \n) e quebra o comando em partes nos
# separadores do shell (quebra de linha, &&, ||, ;, |, &), mas só fora de
# aspas. Dentro de aspas, quebras de linha viram espaço.
partes="$(printf '%s' "$cmd" | awk '
  { s = s (NR > 1 ? "\n" : "") $0 }
  END {
    # 1) escapes do JSON
    n = length(s); t = ""
    for (i = 1; i <= n; i++) {
      c = substr(s, i, 1)
      if (c == "\\" && i < n) {
        c = substr(s, ++i, 1)
        if (c == "n") c = "\n"; else if (c == "t") c = "\t"; else if (c == "r") c = ""
      }
      t = t c
    }
    # 2) separadores do shell, fora de aspas
    n = length(t); q = ""; out = ""
    for (i = 1; i <= n; i++) {
      c = substr(t, i, 1)
      if (q == "\047") {                       # dentro de aspas simples
        if (c == "\047") q = ""
        out = out (c == "\n" ? " " : c)
      } else if (q == "\"") {                  # dentro de aspas duplas
        if (c == "\\" && i < n) { out = out c substr(t, ++i, 1); continue }
        if (c == "\"") q = ""
        out = out (c == "\n" ? " " : c)
      } else {                                 # fora de aspas
        if (c == "\\" && i < n) { out = out c substr(t, ++i, 1); continue }
        if (c == "\047" || c == "\"") { q = c; out = out c; continue }
        # heredoc (<<FIM, <<-FIM, <<\047FIM\047): guarda o delimitador para
        # pular o conteúdo, que é texto e não comando
        if (c == "<" && substr(t, i + 1, 1) == "<") {
          if (substr(t, i + 2, 1) == "<") { out = out "<<<"; i += 2; continue }
          i += 2; tab = 0
          if (substr(t, i, 1) == "-") { tab = 1; i++ }
          while (substr(t, i, 1) == " ") i++
          hd = ""
          while (i <= n) {
            d = substr(t, i, 1)
            if (d == "\047" || d == "\"" || d == "\\") { i++; continue }
            if (d ~ /[ \t\n;&|<>()]/) break
            hd = hd d; i++
          }
          i--; continue
        }
        if (c == "\n" && hd != "") {           # pula as linhas do heredoc
          while (i < n) {
            j = index(substr(t, i + 1), "\n")
            linha = (j ? substr(t, i + 1, j - 1) : substr(t, i + 1))
            i = (j ? i + j : n)
            if (tab) sub(/^\t+/, "", linha)
            if (linha == hd) break
          }
          hd = ""; out = out "\n"; continue
        }
        if (c == ";" || c == "\n") { out = out "\n"; continue }
        if (c == "&" || c == "|") {
          if (substr(t, i + 1, 1) == c) i++
          out = out "\n"; continue
        }
        out = out c
      }
    }
    print out
  }')"

while IFS= read -r parte; do
  read -ra w <<< "$parte"
  i=0
  # pula "sudo" e variáveis de ambiente (VAR=valor) antes do git
  while [ $i -lt ${#w[@]} ] && { [ "${w[$i]}" = "sudo" ] || [[ "${w[$i]}" == *=* && "${w[$i]}" != -* ]]; }; do
    i=$((i + 1))
  done
  [ "${w[$i]}" = "git" ] || continue
  i=$((i + 1))
  # pula opções globais do git; com "git -C pasta", olha a branch dessa pasta
  alvo="$dir"
  while [ $i -lt ${#w[@]} ] && [[ "${w[$i]}" == -* ]]; do
    case "${w[$i]}" in
      -C)
        p="${w[$((i + 1))]}"; p="${p//\"/}"; p="${p//\'/}"; p="${p/#\~/$HOME}"
        case "$p" in /*) alvo="$p" ;; *) alvo="$alvo/$p" ;; esac
        i=$((i + 1)) ;;
      -c) i=$((i + 1)) ;;
    esac
    i=$((i + 1))
  done
  sub="${w[$i]}"
  args=("${w[@]:$((i + 1))}")
  branch="$(git -C "$alvo" branch --show-current 2>/dev/null)"

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
done <<< "$partes"

exit 0
