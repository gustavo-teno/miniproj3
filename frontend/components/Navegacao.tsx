"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { buscarEu, sair, type Eu } from "@/lib/api";
import { useNaoLidas } from "@/lib/naoLidas";
import { useNovasNotificacoes } from "@/lib/notificacoes";
import { LogoMargem } from "@/components/LogoMargem";
import { NOME_REDE } from "@/lib/rede";

// O topo da rede: nome à esquerda, abas no centro e configurações à direita.
export function Navegacao() {
  const caminho = usePathname();
  // undefined = carregando; null = ninguém logado.
  const [eu, setEu] = useState<Eu | null | undefined>(undefined);

  useEffect(() => {
    buscarEu()
      .then(setEu)
      .catch(() => setEu(null));
  }, []);

  // As DMs (decisão 6): o número de não lidas aparece na aba Mensagens.
  const naoLidas = useNaoLidas(Boolean(eu));
  // As notificações (#103): o número de novas aparece no sino.
  const novas = useNovasNotificacoes(Boolean(eu));

  const abas = [
    { href: "/", rotulo: "Feed" },
    { href: "/turmas", rotulo: "Turmas" },
    ...(eu
      ? [
          // No celular, só o balão: com a palavra e o número, as abas passavam
          // de 375px e empurravam a lupa e a engrenagem para fora da tela.
          { href: "/mensagens", rotulo: "Mensagens", contador: naoLidas, icone: BALAO },
          // Também só o ícone no celular: com o sino das notificações (#103)
          // ao lado da lupa, a palavra empurrava a engrenagem para fora.
          { href: `/u/${eu.username}`, rotulo: "Meu diário", icone: CADERNO },
        ]
      : []),
  ];

  return (
    <header className="border-b border-linha bg-superficie">
      <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-2 px-4 sm:grid sm:gap-3 sm:grid-cols-[1fr_auto_1fr] sm:px-6">
        {/* No celular o nome some para as abas caberem: o Feed já leva ao início. */}
        <Link href="/" className="hidden items-center gap-2 justify-self-start text-lg font-semibold text-tinta sm:flex">
          <LogoMargem className="size-7" />
          {NOME_REDE}
        </Link>

        {/* Espaços menores no celular: com gap-4, o topo passava de 360px de
            largura e a página inteira rolava para o lado. */}
        <nav aria-label="Principal" className="flex gap-3 sm:gap-8">
          {abas.map(({ href, rotulo, contador, icone }) => {
            // O endereço exato ou uma página dentro dele: /u/ada e /u/ada/editar
            // acendem "Meu diário", mas /u/ada2 (outra pessoa) não.
            const ativa =
              href === "/" ? caminho === "/" : caminho === href || caminho.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                aria-current={ativa ? "page" : undefined}
                className={
                  "flex items-center whitespace-nowrap border-b-[3px] py-4 text-[15px] transition-colors sm:text-[17px] " +
                  (ativa
                    ? "border-destaque font-semibold text-destaque"
                    : "border-transparent text-tinta-suave hover:text-tinta")
                }
              >
                {icone ? (
                  <>
                    <span className="sm:hidden">
                      <Icone d={icone} />
                    </span>
                    {/* No celular a palavra some da tela, mas o leitor de tela continua lendo. */}
                    <span className="sr-only sm:not-sr-only">{rotulo}</span>
                  </>
                ) : (
                  rotulo
                )}
                {/* O leitor de tela lê "Mensagens, 2 não lidas". */}
                {contador ? (
                  <span className="ml-1.5 inline-grid min-w-5 place-items-center rounded-full bg-destaque px-1 align-[2px] text-[11px] font-semibold leading-5 text-sobre-destaque">
                    {contador}
                    <span className="sr-only">{contador === 1 ? " não lida" : " não lidas"}</span>
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 justify-self-end sm:gap-3">
          {/* A busca (#38): uma lupa, e não mais uma aba, para as abas
              continuarem cabendo no celular. */}
          {eu && (
            <Link
              href="/busca"
              aria-label="Buscar"
              title="Buscar"
              aria-current={caminho === "/busca" ? "page" : undefined}
              className={
                "grid size-9 place-items-center rounded-lg border transition-colors " +
                (caminho === "/busca"
                  ? "border-destaque bg-destaque-fundo text-destaque"
                  : "border-linha text-tinta-suave hover:text-tinta")
              }
            >
              <Icone d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM21 21l-4.35-4.35" />
            </Link>
          )}
          {/* As notificações (#103): um sino ao lado da lupa, e não mais uma
              aba, pelo mesmo motivo. O número fica no canto do sino. */}
          {eu && (
            <Link
              href="/notificacoes"
              aria-label={novas ? `Notificações, ${novas} ${novas === 1 ? "nova" : "novas"}` : "Notificações"}
              title="Notificações"
              aria-current={caminho === "/notificacoes" ? "page" : undefined}
              className={
                "relative grid size-9 place-items-center rounded-lg border transition-colors " +
                (caminho === "/notificacoes"
                  ? "border-destaque bg-destaque-fundo text-destaque"
                  : "border-linha text-tinta-suave hover:text-tinta")
              }
            >
              <Icone d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
              {novas ? (
                <span
                  aria-hidden
                  className="absolute -right-1.5 -top-1.5 grid min-w-[18px] place-items-center rounded-full bg-destaque px-1 text-[10px] font-semibold leading-[18px] text-sobre-destaque"
                >
                  {novas > 9 ? "9+" : novas}
                </span>
              ) : null}
            </Link>
          )}
          {eu === null && (
            <Link href="/login" className="whitespace-nowrap font-semibold text-destaque hover:underline">
              Entrar
            </Link>
          )}
          {/* O modo noturno vale para todo mundo; o "Sair", só para quem entrou. */}
          {eu !== undefined && <Configuracoes logado={eu !== null} />}
        </div>
      </div>
    </header>
  );
}

// O botão de engrenagem e a caixa que ele abre: modo noturno e sair. Fecha ao
// clicar fora ou ao apertar Esc (aí o foco volta para a engrenagem, para quem
// usa o teclado não se perder). É uma lista simples de botões, percorrida com
// Tab, e não um "menu" de leitor de tela, que exigiria navegar pelas setas.
function Configuracoes({ logado }: { logado: boolean }) {
  const [aberto, setAberto] = useState(false);
  const [noturno, setNoturno] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);
  const engrenagem = useRef<HTMLButtonElement>(null);

  // O modo atual: o que a pessoa escolheu antes ou, sem escolha, o do sistema.
  useEffect(() => {
    const escolhido = document.documentElement.dataset.tema;
    setNoturno(
      escolhido ? escolhido === "noturno" : window.matchMedia("(prefers-color-scheme: dark)").matches,
    );
  }, []);

  useEffect(() => {
    if (!aberto) return;
    function cliqueFora(e: MouseEvent) {
      if (caixa.current && !caixa.current.contains(e.target as Node)) setAberto(false);
    }
    function esc(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setAberto(false);
        engrenagem.current?.focus();
      }
    }
    document.addEventListener("mousedown", cliqueFora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", cliqueFora);
      document.removeEventListener("keydown", esc);
    };
  }, [aberto]);

  function trocarModo() {
    const tema = noturno ? "claro" : "noturno";
    document.documentElement.dataset.tema = tema;
    try {
      localStorage.setItem("tema", tema);
    } catch {
      // Navegação anônima pode bloquear o localStorage: o modo vale só agora.
    }
    setNoturno(!noturno);
  }

  async function clicarSair() {
    try {
      await sair();
    } finally {
      // Recarrega a página inteira (e não só troca de tela) para o topo e as
      // telas esquecerem quem estava logado.
      window.location.href = "/login";
    }
  }

  const item =
    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-destaque-fundo";

  return (
    <div ref={caixa} className="relative">
      <button
        ref={engrenagem}
        type="button"
        aria-label="Configurações"
        aria-expanded={aberto}
        aria-controls="configuracoes"
        onClick={() => setAberto(!aberto)}
        className={
          "grid size-9 place-items-center rounded-lg border transition-colors " +
          (aberto
            ? "border-destaque bg-destaque-fundo text-destaque"
            : "border-linha text-tinta-suave hover:text-tinta")
        }
      >
        <Icone d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 8.92a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9v.08a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
      </button>

      {aberto && (
        <div
          id="configuracoes"
          className="absolute right-0 top-11 z-10 w-56 rounded-xl border border-linha bg-superficie p-1.5 shadow-[0_8px_24px_rgb(0_0_0/0.12)]"
        >
          <button type="button" role="switch" aria-checked={noturno} onClick={trocarModo} className={item}>
            <Icone d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
            Modo noturno
            <span
              aria-hidden
              className={
                "ml-auto flex h-[18px] w-8 items-center rounded-full p-0.5 transition-colors " +
                (noturno ? "justify-end bg-destaque" : "justify-start bg-tinta-suave")
              }
            >
              <span className="size-3.5 rounded-full bg-superficie" />
            </span>
          </button>
          {/* "Editar perfil" entra aqui quando a edição do perfil existir (ter 24). */}
          {logado && (
            <>
              {/* Os posts salvos (#64): só de quem entrou, por isso fica aqui e
                  não nas abas do topo. */}
              <Link href="/salvos" onClick={() => setAberto(false)} className={item}>
                <Icone d="M6.5 4.5h11v15.5L12 16.2 6.5 20Z" />
                Salvos
              </Link>
              <div className="my-1 border-t border-linha" />
              <button type="button" onClick={clicarSair} className={item + " text-tinta-suave"}>
                <Icone d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                Sair
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// O balão de conversa da aba Mensagens no celular.
const BALAO = "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z";
const CADERNO = "M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14ZM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5";

// Ícone de traço simples, sempre do mesmo tamanho e espessura.
function Icone({ d }: { d: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-[18px] flex-none"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}
