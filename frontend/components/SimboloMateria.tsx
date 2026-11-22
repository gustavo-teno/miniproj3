import type { ReactNode } from "react";

// O símbolo de cada matéria (direção visual de 22/11), desenhado aqui mesmo em
// SVG de traço, sem biblioteca de ícones. Usa a cor do texto em volta
// (currentColor), então quem decide a cor é quem usa: a etiqueta, o quadrado
// do card, o filtro. A forma ajuda quem não distingue bem as cores.
const DESENHOS: Record<string, ReactNode> = {
  // Σ, o somatório
  matematica: <path d="M18 5H6l6 7-6 7h12" />,
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
  // fita de DNA
  biologia: (
    <>
      <path d="M7 3c0 5 10 4 10 9s-10 4-10 9" />
      <path d="M17 3c0 5-10 4-10 9s10 4 10 9" />
      <path d="M9.5 6.5h5M9.5 17.5h5" />
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
