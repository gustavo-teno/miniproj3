"use client";

// O botão de emoji (Pessoa A), nas DMs e onde se escreve um post: só o ícone,
// na linha da caixa de texto. O escolhido entra no texto onde está o cursor:
//   <BotaoEmoji aoEscolher={(emoji) => setTexto(inserirNoCursor(campo.current, texto, emoji, MAX))} />
//
// Abre em duas etapas, como as reações do WhatsApp: primeiro uma barra com os
// emojis que um vestibulando mais usa, e um "+" que troca a barra pela seleção
// de todos os emojis, com busca e categorias (biblioteca emoji-mart). Os dados
// dos emojis (uns 400 KB) só são baixados quando alguém clica no "+".
//
// A caixa fica aberta depois de escolher, para dar para pôr mais de um, e
// fecha ao clicar fora ou com Esc (aí o foco volta para o botão), como o menu
// da engrenagem.

import { useEffect, useId, useRef, useState } from "react";

// Os mais usados por quem estuda: comemorar a lista feita, sofrer junto com o
// simulado, agradecer a dica. Poucos, para a barra caber no celular.
const FAVORITOS: [string, string][] = [
  ["🔥", "fogo"],
  ["💪", "força"],
  ["📚", "livros"],
  ["✅", "feito"],
  ["😂", "rindo"],
  ["😭", "chorando"],
  ["🙏", "obrigado"],
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

// O tema da seleção completa acompanha o do site: o escolhido na engrenagem
// ou, sem escolha, o do sistema.
function temaDoSite(): "dark" | "light" | "auto" {
  const tema = document.documentElement.dataset.tema;
  return tema === "noturno" ? "dark" : tema === "claro" ? "light" : "auto";
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
  // false = a barra de favoritos; true = a seleção de todos os emojis.
  const [todos, setTodos] = useState(false);
  const [erro, setErro] = useState(false);
  // Um id por botão: a página do diário pode ter mais de um campo com emoji.
  const idDaCaixa = useId();
  const caixa = useRef<HTMLDivElement>(null);
  const botao = useRef<HTMLButtonElement>(null);
  const lugarDaSelecao = useRef<HTMLDivElement>(null);
  // A seleção completa é criada uma vez e guarda a função que recebeu; pelo
  // ref, ela sempre chama a versão atual (que conhece o texto de agora).
  const escolher = useRef(aoEscolher);
  escolher.current = aoEscolher;

  function fechar() {
    setAberto(false);
    setTodos(false);
  }

  useEffect(() => {
    if (!aberto) return;
    function cliqueFora(e: MouseEvent) {
      if (caixa.current && !caixa.current.contains(e.target as Node)) fechar();
    }
    function esc(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape") {
        fechar();
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

  // Ao clicar no "+": baixa a biblioteca, os emojis e a tradução, e desenha a
  // seleção completa no lugar da barra.
  useEffect(() => {
    if (!todos) return;
    let valendo = true;
    setErro(false);
    Promise.all([import("emoji-mart"), import("@emoji-mart/data"), import("@emoji-mart/data/i18n/pt.json")])
      .then(([{ Picker }, dados, traducao]) => {
        if (!valendo || !lugarDaSelecao.current) return;
        const selecao = new Picker({
          data: dados.default,
          i18n: traducao.default,
          locale: "pt",
          theme: temaDoSite(),
          onEmojiSelect: (emoji: { native: string }) => escolher.current(emoji.native),
          autoFocus: true,
          previewPosition: "none",
          skinTonePosition: "search",
          maxFrequentRows: 1,
          // 7 por linha de 34px: a seleção fica com uns 270px e cabe com folga no celular.
          perLine: 7,
          emojiButtonSize: 34,
          emojiSize: 22,
        });
        // Mais baixa que o padrão (435px), para caber na tela do celular.
        (selecao as unknown as HTMLElement).style.height = "330px";
        lugarDaSelecao.current.replaceChildren(selecao as unknown as Node);
      })
      .catch(() => valendo && setErro(true));
    return () => {
      valendo = false;
    };
  }, [todos]);

  return (
    <div ref={caixa} className="relative">
      <button
        ref={botao}
        type="button"
        aria-label="Emojis"
        aria-expanded={aberto}
        aria-controls={idDaCaixa}
        onClick={() => (aberto ? fechar() : setAberto(true))}
        className={
          "grid size-10 flex-none place-items-center rounded-full text-destaque transition-colors hover:bg-destaque-fundo " +
          (aberto ? "bg-destaque-fundo" : "")
        }
      >
        <svg
          viewBox="0 0 24 24"
          className="size-6"
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
          className={`absolute left-0 z-10 ${abrirPara === "cima" ? "bottom-12" : "top-12"} rounded-2xl border border-linha bg-superficie shadow-[0_8px_24px_rgb(0_0_0/0.12)]`}
        >
          {!todos ? (
            <div role="group" aria-label="Emojis mais usados" className="flex items-center p-1">
              {FAVORITOS.map(([emoji, nome]) => (
                <button
                  key={emoji}
                  type="button"
                  aria-label={nome}
                  title={nome}
                  onClick={() => aoEscolher(emoji)}
                  className="grid size-8 place-items-center rounded-full text-xl hover:bg-destaque-fundo"
                >
                  {emoji}
                </button>
              ))}
              <button
                type="button"
                aria-label="Todos os emojis"
                title="Todos os emojis"
                onClick={() => setTodos(true)}
                className="grid size-8 place-items-center rounded-full text-tinta-suave hover:bg-destaque-fundo hover:text-tinta"
              >
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
            </div>
          ) : erro ? (
            <p role="alert" className="w-64 p-4 text-sm text-tinta-suave">
              Não foi possível carregar os emojis.
            </p>
          ) : (
            // Até a biblioteca chegar, um espaço do tamanho da seleção, para a caixa não pular.
            <div ref={lugarDaSelecao} className="min-h-[330px] min-w-[270px]" />
          )}
        </div>
      )}
    </div>
  );
}
