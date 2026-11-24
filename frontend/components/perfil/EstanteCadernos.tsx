"use client";

// A estante do diário (#10, Pessoa B): cada matéria é um caderno, com quantos
// posts tem e quando foi o último. "Todas" vem primeiro; depois as matérias com
// post (da mais usada para a menos usada, como o backend manda) e por fim as
// vazias, que continuam à vista como convite. Passa para o lado com as setas,
// com o trackpad ou com o dedo, parando sempre no começo de um caderno.

import { useEffect, useRef, useState } from "react";

import { SimboloMateria } from "@/components/SimboloMateria";
import type { Caderno } from "@/lib/api";
import { estiloDaTag } from "@/lib/materias";
import { useOpcoes } from "@/lib/opcoes";
import { tempoDesde } from "@/lib/tempo";

type Props = {
  cadernos: Caderno[];
  aberto: string | null; // null = "Todas"
  abrir: (tag: string | null) => void;
};

export function EstanteCadernos({ cadernos, aberto, abrir }: Props) {
  const opcoes = useOpcoes();
  const trilho = useRef<HTMLDivElement>(null);
  const [setas, setSetas] = useState({ esquerda: false, direita: false });

  const total = cadernos.reduce((soma, c) => soma + c.posts, 0);
  const comPost = new Set(cadernos.map((c) => c.tag));
  const vazias = (opcoes?.tags ?? []).filter((t) => !comPost.has(t.valor));
  const nome = (tag: string) => opcoes?.tags.find((t) => t.valor === tag)?.nome ?? tag;

  // As setas só aparecem quando há para onde ir.
  function atualizarSetas() {
    const t = trilho.current;
    if (!t) return;
    setSetas({ esquerda: t.scrollLeft > 4, direita: t.scrollLeft + t.clientWidth < t.scrollWidth - 4 });
  }
  // Recalcula quando muda o que está na estante e quando a janela muda de tamanho.
  useEffect(() => {
    atualizarSetas();
    window.addEventListener("resize", atualizarSetas);
    return () => window.removeEventListener("resize", atualizarSetas);
  }, [cadernos, opcoes]);

  function passar(sentido: 1 | -1) {
    const t = trilho.current;
    if (t) t.scrollBy({ left: sentido * t.clientWidth, behavior: "smooth" });
  }

  const caderno =
    "flex h-28 w-40 flex-none snap-start flex-col justify-between rounded-xl border-2 p-3 text-left transition-colors sm:w-44";
  const marca = (ativo: boolean) => (ativo ? "border-current" : "border-transparent");

  return (
    <div className="relative">
      <div
        ref={trilho}
        onScroll={atualizarSetas}
        role="group"
        aria-label="Cadernos por matéria"
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <button
          type="button"
          aria-pressed={aberto === null}
          onClick={() => abrir(null)}
          className={`${caderno} ${marca(aberto === null)} bg-destaque-fundo text-destaque`}
        >
          <span className="font-numeros text-xl font-semibold">{total}</span>
          <span>
            <span className="block font-semibold">Todas</span>
            <span className="block font-numeros text-xs opacity-85">todas as matérias</span>
          </span>
        </button>

        {cadernos.map((c) => (
          <button
            key={c.tag}
            type="button"
            aria-pressed={aberto === c.tag}
            onClick={() => abrir(c.tag)}
            style={estiloDaTag(c.tag)}
            className={`${caderno} ${marca(aberto === c.tag)} cor-materia`}
          >
            <SimboloMateria tag={c.tag} className="size-6" />
            <span>
              <span className="block truncate font-semibold">{nome(c.tag)}</span>
              {/* suppressHydrationWarning: o "há 2h" muda entre o servidor e o navegador. */}
              <span className="block font-numeros text-xs opacity-85" suppressHydrationWarning>
                {c.posts === 1 ? "1 post" : `${c.posts} posts`}
                <br />
                {tempoDesde(c.ultimo_post)}
              </span>
            </span>
          </button>
        ))}

        {vazias.map((t) => (
          <button
            key={t.valor}
            type="button"
            aria-pressed={aberto === t.valor}
            onClick={() => abrir(t.valor)}
            style={estiloDaTag(t.valor)}
            className={`${caderno} ${marca(aberto === t.valor)} cor-materia ${aberto === t.valor ? "" : "opacity-60"}`}
          >
            <SimboloMateria tag={t.valor} className="size-6" />
            <span>
              <span className="block truncate font-semibold">{t.nome}</span>
              <span className="block font-numeros text-xs opacity-85">ainda vazio</span>
            </span>
          </button>
        ))}
      </div>

      {/* As setas só ajudam quem usa mouse; teclado e leitor de tela passam
          pelos botões dos cadernos com Tab, e a lista rola sozinha. */}
      {setas.esquerda && <Seta lado="esquerda" onClick={() => passar(-1)} />}
      {setas.direita && <Seta lado="direita" onClick={() => passar(1)} />}
    </div>
  );
}

function Seta({ lado, onClick }: { lado: "esquerda" | "direita"; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-hidden
      tabIndex={-1}
      onClick={onClick}
      className={`absolute top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-linha bg-superficie text-tinta shadow-md hover:bg-fundo ${
        lado === "esquerda" ? "-left-4" : "-right-4"
      }`}
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d={lado === "esquerda" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
      </svg>
    </button>
  );
}
