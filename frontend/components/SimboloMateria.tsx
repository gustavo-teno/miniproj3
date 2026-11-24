import type { ReactNode } from "react";

// O símbolo de cada matéria (direção visual de 22/11), desenhado aqui mesmo em
// SVG de traço, sem biblioteca de ícones. Usa a cor do texto em volta
// (currentColor), então quem decide a cor é quem usa: a etiqueta, o quadrado
// do card, o filtro. A forma ajuda quem não distingue bem as cores.
const DESENHOS: Record<string, ReactNode> = {
  // as quatro operações (+ − × ÷), como numa calculadora
  matematica: (
    <>
      <path d="M7 3.5v7M3.5 7h7M13.5 7h7M4.5 14.5l5 5M9.5 14.5l-5 5M13.5 17h7" />
      <circle cx="17" cy="14" r=".6" fill="currentColor" />
      <circle cx="17" cy="20" r=".6" fill="currentColor" />
    </>
  ),
  // átomo: três órbitas e o núcleo
  fisica: (
    <>
      <ellipse cx="12" cy="12" rx="9.5" ry="3.8" />
      <ellipse cx="12" cy="12" rx="9.5" ry="3.8" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="9.5" ry="3.8" transform="rotate(-60 12 12)" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </>
  ),
  // frasco de laboratório
  quimica: (
    <>
      <path d="M9 3h6M10 3v6.5L4.6 18.3A1.8 1.8 0 0 0 6.1 21h11.8a1.8 1.8 0 0 0 1.5-2.7L14 9.5V3" />
      <path d="M7.5 15h9" />
    </>
  ),
  // dupla hélice de DNA: duas fitas que se cruzam, com degraus (as bases)
  // onde elas se afastam. A fita de trás é interrompida em cada cruzamento,
  // para dar a ideia de uma passando por cima da outra.
  biologia: (
    <>
      <path d="M7.0 3.0 7.7 4.5 9.5 6.0 11.9 7.5 14.4 8.9 16.3 10.4 17.0 11.9 16.4 13.4 14.6 14.9" />
      <path d="M9.4 18.1 8.8 18.5 8.4 18.8 8.0 19.2 7.6 19.6 7.4 19.9 7.2 20.3 7.0 20.6 7.0 21.0" />
      <path d="M17.0 3.0 17.0 3.4 16.8 3.7 16.6 4.1 16.4 4.5 16.0 4.8 15.6 5.2 15.2 5.5 14.6 5.9" />
      <path d="M9.4 9.1 7.6 10.6 7.0 12.1 7.7 13.6 9.6 15.1 12.1 16.5 14.5 18.0 16.3 19.5 17.0 21.0" />
      <path d="M9 4.5h6M8.3 12h7.4M9 19.5h6" />
    </>
  ),
  // "Aa"
  portugues: (
    <>
      <path d="M3 19 7.5 5h1L13 19M5 14.5h6" />
      <circle cx="17.5" cy="16" r="3" />
      <path d="M20.5 13v6" />
    </>
  ),
  // livro aberto
  literatura: (
    <path d="M2 5h6a4 4 0 0 1 4 4v11a3 3 0 0 0-3-3H2zM22 5h-6a4 4 0 0 0-4 4v11a3 3 0 0 1 3-3h7z" />
  ),
  // caneta
  redacao: (
    <>
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
      <path d="M14.5 5.5l4 4" />
    </>
  ),
  // ampulheta
  historia: (
    <path d="M6 3h12M6 21h12M7 3v2a5 5 0 0 0 10 0V3M7 21v-2a5 5 0 0 1 10 0v2" />
  ),
  // globo
  geografia: (
    <>
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="12" rx="4" ry="9" />
      <path d="M3 12h18" />
    </>
  ),
  // lâmpada (uma ideia)
  filosofia: (
    <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z" />
  ),
  // pessoas
  sociologia: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20a6 6 0 0 1 12 0" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M16.5 14.1A5 5 0 0 1 21 19" />
    </>
  ),
  // balão de conversa
  "bate-papo": <path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.4A8 8 0 1 1 21 12z" />,
};

// Os idiomas não têm um desenho óbvio que diferencie os dois: viram sigla.
const SIGLAS: Record<string, string> = { ingles: "EN", espanhol: "ES" };

export function SimboloMateria({ tag, className = "size-4" }: { tag: string; className?: string }) {
  const sigla = SIGLAS[tag];
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={"flex-none " + className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {sigla ? (
        <text
          x="12"
          y="17"
          textAnchor="middle"
          fontSize="14"
          fontWeight="600"
          letterSpacing="-0.5"
          fill="currentColor"
          stroke="none"
        >
          {sigla}
        </text>
      ) : (
        (DESENHOS[tag] ?? DESENHOS["bate-papo"])
      )}
    </svg>
  );
}
