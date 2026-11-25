"use client";

// O botão de emoji (Pessoa A), nas DMs e onde se escreve um post: só o ícone,
// na linha da caixa de texto. Abre uma caixinha com emojis do dia a dia de
// quem estuda, e o escolhido entra no texto onde está o cursor:
//   <BotaoEmoji aoEscolher={(emoji) => setTexto(inserirNoCursor(campo.current, texto, emoji, MAX))} />
// No celular o teclado já tem emoji; o botão é para quem escreve pelo computador.
//
// A caixa fica aberta depois de escolher, para dar para pôr mais de um, e
// fecha ao clicar fora ou com Esc (aí o foco volta para o botão), como o
// menu da engrenagem.

import { useEffect, useId, useRef, useState } from "react";

// Poucos e do nicho, de propósito: uma lista curta acha-se rápido, sem busca.
const EMOJIS: [string, string][] = [
  ["📚", "livros"],
  ["📝", "anotação"],
  ["✏️", "lápis"],
  ["🧠", "cérebro"],
  ["🎯", "alvo"],
  ["⏰", "despertador"],
  ["☕", "café"],
  ["🔥", "fogo"],
  ["💪", "força"],
  ["👏", "palmas"],
  ["🙌", "comemorar"],
  ["🎉", "festa"],
  ["✅", "feito"],
  ["👍", "joinha"],
  ["❤️", "coração"],
  ["🙏", "obrigado"],
  ["😊", "sorriso"],
  ["😂", "rindo"],
  ["😅", "ufa"],
  ["🤓", "estudioso"],
  ["🥲", "sorriso triste"],
  ["😭", "chorando"],
  ["😴", "sono"],
  ["🤯", "cabeça explodindo"],
];

// Põe o emoji onde está o cursor (ou no lugar do trecho selecionado) e devolve
// o texto novo; o cursor vai para depois do emoji, para continuar escrevendo.
// Se passar do limite, devolve o texto como estava.
export function inserirNoCursor(
  campo: HTMLTextAreaElement | null,
  texto: string,
  emoji: string,
  maximo: number,
): string {
  const inicio = campo?.selectionStart ?? texto.length;
  const fim = campo?.selectionEnd ?? texto.length;
  const novo = texto.slice(0, inicio) + emoji + texto.slice(fim);
  if (novo.length > maximo) return texto;
  // Depois que o React desenhar o texto novo, devolve o cursor ao campo, para
  // dar para continuar digitando (a caixinha fica aberta até clicar fora).
  requestAnimationFrame(() => {
    const depois = inicio + emoji.length;
    campo?.focus();
    campo?.setSelectionRange(depois, depois);
  });
  return novo;
}

export function BotaoEmoji({
  aoEscolher,
  abrirPara = "cima",
}: {
  aoEscolher: (emoji: string) => void;
  // Para cima quando o campo fica embaixo da tela (DMs); para baixo quando fica no alto.
  abrirPara?: "cima" | "baixo";
}) {
  const [aberto, setAberto] = useState(false);
  // Um id por botão: a página do diário pode ter mais de um campo com emoji.
  const idDaCaixa = useId();
  const caixa = useRef<HTMLDivElement>(null);
  const botao = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!aberto) return;
    function cliqueFora(e: MouseEvent) {
      if (caixa.current && !caixa.current.contains(e.target as Node)) setAberto(false);
    }
    function esc(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape") {
        setAberto(false);
        botao.current?.focus();
      }
    }
    document.addEventListener("mousedown", cliqueFora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", cliqueFora);
      document.removeEventListener("keydown", esc);
    };
  }, [aberto]);

  return (
    <div ref={caixa} className="relative">
      <button
        ref={botao}
        type="button"
        aria-label="Emojis"
        aria-expanded={aberto}
        aria-controls={idDaCaixa}
        onClick={() => setAberto(!aberto)}
        className={
          "grid size-9 flex-none place-items-center rounded-full text-destaque transition-colors hover:bg-destaque-fundo " +
          (aberto ? "bg-destaque-fundo" : "")
        }
      >
        <svg
          viewBox="0 0 24 24"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          aria-hidden
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M8.5 14.5a4.5 4.5 0 0 0 7 0M9 9.5h.01M15 9.5h.01" />
        </svg>
      </button>

      {/* Encostada à esquerda, como o botão. */}
      {aberto && (
        <div
          id={idDaCaixa}
          className={`absolute left-0 z-10 ${abrirPara === "cima" ? "bottom-11" : "top-11"}  grid w-[264px] grid-cols-6 gap-1 rounded-xl border border-linha bg-superficie p-2 shadow-[0_8px_24px_rgb(0_0_0/0.12)]`}
        >
          {EMOJIS.map(([emoji, nome]) => (
            <button
              key={emoji}
              type="button"
              aria-label={nome}
              title={nome}
              onClick={() => aoEscolher(emoji)}
              className="grid size-10 place-items-center rounded-lg text-xl hover:bg-destaque-fundo"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
