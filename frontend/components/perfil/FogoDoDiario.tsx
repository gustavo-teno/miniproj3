"use client";

// O fogo da ofensiva no diário (#10, Pessoa B), no desenho aprovado em 24/11:
// um caderno aberto com a chama saindo da lombada. Os dados vêm da rota do
// Gustavo (GET /usuarios/{username}/ofensiva); o componente <Ofensiva /> dele
// continua existindo, este é o jeito do perfil de mostrar os mesmos números.
//
// A intensidade aparece pela cor (as 6 faixas do Ofensiva.tsx, do vermelho ao
// azul, o mais intenso) e pelo desenho: 1 ponta, 2 pontas, 3 pontas com brilho
// e faíscas. As três chamas têm quase a mesma altura. As cores ficam no
// globals.css (.fogo-0 a .fogo-6 e --caderno-*): o caderno, a chama e os
// números são iguais no claro e no noturno; só o painel muda.

import { useEffect, useState } from "react";

import { buscarOfensiva, type Ofensiva } from "@/lib/api";

// As mesmas faixas do Ofensiva.tsx (Pessoa A). 0 = apagado.
const FAIXAS = [
  { faixa: 1, de: 1 },
  { faixa: 2, de: 7 },
  { faixa: 3, de: 14 },
  { faixa: 4, de: 30 },
  { faixa: 5, de: 60 },
  { faixa: 6, de: 100 },
];

export function faixaDoFogo(dias: number): number {
  let faixa = 0;
  for (const f of FAIXAS) if (dias >= f.de) faixa = f.faixa;
  return faixa;
}

// O desenho de cada tamanho: a chama, a escala dela e a do miolo mais claro.
const CHAMAS = {
  pequena: {
    d: "M24 17c.8 3 3.6 4.6 4.6 7.4 1.2 3.4-1 6.6-4.6 6.6s-5.8-3.2-4.6-6.4c.5 1.2 1.3 1.8 2.2 2-.6-3.3.6-6.4 2.4-9.6z",
    escala: 1.75,
    miolo: 1.84,
  },
  media: {
    d: "M24 12c1 3.6 4.4 5.6 5.6 9 .4-1.4.3-2.8-.2-4.2 2.6 2.4 3.8 6 3 9.2-.9 3.4-4 5.8-8.4 5.8s-7.6-2.6-8.2-6.2c-.5-2.8.6-5.4 2.6-7.4-.1 1.6.4 3 1.4 4-.4-3.8.9-7.2 4.2-10.2z",
    escala: 1.3,
    miolo: 1.63,
  },
  grande: {
    d: "M24 5c1.2 4 5 6.4 6.4 10.4.6-1.6.5-3.2 0-4.8 3.2 2.8 5.2 7.2 4.4 11.4-.9 4.8-5 8.4-10.8 8.4s-9.8-3.4-10.6-8c-.6-3.6.8-7 3.4-9.6-.2 1.8.4 3.4 1.6 4.6-.6-4.8 1.6-9.2 5.6-12.4z",
    escala: 0.96,
    miolo: 1.49,
  },
};
const MIOLO = "M24 22.5c.5 2 2.3 3 2.9 4.9.7 2.1-.7 3.6-2.9 3.6s-3.6-1.5-2.9-3.5c.3.7.8 1.1 1.4 1.2-.3-2.1.4-4.1 1.5-6.2z";

// A chama cresce a partir da lombada do caderno (24, 31).
const escalar = (e: number) => `translate(24 31) scale(${e}) translate(-24 -31)`;

export function IconeFogo({ dias, className }: { dias: number; className?: string }) {
  const faixa = faixaDoFogo(dias);
  const tamanho = faixa === 0 ? null : faixa <= 2 ? "pequena" : faixa <= 4 ? "media" : "grande";
  const chama = tamanho ? CHAMAS[tamanho] : null;

  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden
      className={`fogo-${faixa} ${className ?? ""}`}
      strokeWidth={1.6}
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      {tamanho === "grande" && <ellipse cx="24" cy="20" rx="15" ry="14" fill="var(--chama)" opacity=".16" />}
      {chama && (
        <>
          <path transform={escalar(chama.escala)} d={chama.d} fill="var(--chama)" stroke="var(--chama-contorno)" />
          <path transform={escalar(chama.miolo)} d={MIOLO} fill="var(--chama-miolo)" />
        </>
      )}
      {tamanho === "grande" && (
        <>
          <circle cx="36.5" cy="9" r="1.1" fill="var(--chama)" />
          <circle cx="11.5" cy="13" r=".8" fill="var(--chama)" />
        </>
      )}
      {/* O caderno: a capa (a espessura) por baixo e as duas páginas pautadas. */}
      <path d="M3 31.5v12.8c7.4-1.8 14.6-1.2 21 2.7 6.4-3.9 13.6-4.5 21-2.7V31.5" fill="var(--caderno-capa)" stroke="var(--caderno-traco)" />
      <path d="M24 32.6c-6-4-13-4.6-19.2-2.6v12.2c6.2-2 13.2-1.4 19.2 2.6z" fill="var(--caderno-pagina)" stroke="var(--caderno-traco)" />
      <path d="M24 32.6c6-4 13-4.6 19.2-2.6v12.2c-6.2-2-13.2-1.4-19.2 2.6z" fill="var(--caderno-pagina)" stroke="var(--caderno-traco)" />
      <path d="M24 32.6v12.2" stroke="var(--caderno-traco)" />
      <path
        d="M8.5 34.2c3.6-.8 7.2-.5 10.8.9M8.5 37.6c3.6-.8 7.2-.5 10.8.9M28.7 35.1c3.6-1.4 7.2-1.7 10.8-.9M28.7 38.5c3.6-1.4 7.2-1.7 10.8-.9"
        stroke="var(--caderno-pauta)"
        strokeWidth={1.1}
      />
    </svg>
  );
}

// versao: mude o número para buscar de novo (ex.: depois de um post novo).
export function useOfensiva(username: string, versao = 0) {
  const [dados, setDados] = useState<Ofensiva | null>(null);
  const [erro, setErro] = useState(false);
  // Outra pessoa: some com o fogo da anterior enquanto carrega.
  useEffect(() => setDados(null), [username]);
  useEffect(() => {
    let ativo = true;
    setErro(false);
    buscarOfensiva(username)
      .then((d) => ativo && setDados(d))
      .catch(() => ativo && setErro(true));
    return () => {
      ativo = false;
    };
  }, [username, versao]);
  return { dados, erro };
}

// O fogo com a legenda: o número grande na cor da chama, "dias seguidos" e o
// recorde na cor do fogo do recorde. "aviso" só no diário da dona.
export function LegendaFogo({
  dados,
  comAviso,
  noPainel = false,
}: {
  dados: Ofensiva;
  comAviso: boolean;
  noPainel?: boolean; // no painel colorido de quem visita, a linha usa o tom do próprio painel
}) {
  const folgas = dados.folgas_por_semana - dados.folgas_usadas_na_semana;
  const aviso = !comAviso
    ? null
    : dados.atual === 0 && dados.recorde === 0
      ? "Seu primeiro post acende o fogo."
      : dados.precisa_estudar_hoje
        ? "Estude hoje para não perder a ofensiva."
        : dados.atual > 0
          ? `${folgas === 1 ? "1 folga sobrando" : `${folgas} folgas sobrando`} esta semana`
          : null;

  return (
    <>
      <IconeFogo dias={dados.atual} className="-mb-1 -mt-3.5 size-[140px]" />
      <div className="w-full text-center">
        <p className={`fogo-${faixaDoFogo(dados.atual)} text-[42px] font-bold leading-none tracking-tight`}>
          <span style={{ color: "var(--fogo-texto)" }}>{dados.atual}</span>
        </p>
        <p className="text-lg font-semibold leading-snug">{dados.atual === 1 ? "dia seguido" : "dias seguidos"}</p>
        <p
          className={`fogo-${faixaDoFogo(dados.atual)} mt-1.5 flex items-baseline justify-center gap-1.5 border-t pt-1.5 font-semibold leading-snug ${noPainel ? "" : "border-linha"}`}
          style={noPainel ? { borderColor: "color-mix(in srgb, var(--fogo-texto) 25%, transparent)" } : undefined}
        >
          Recorde:{" "}
          <b className={`fogo-${faixaDoFogo(dados.recorde)} font-bold`} style={{ color: "var(--fogo-texto)" }}>
            {dados.recorde}
          </b>
        </p>
      </div>
      {aviso && (
        <p className="mt-2 w-full rounded-[10px] bg-destaque-fundo px-2.5 py-1.5 text-center text-xs font-semibold leading-snug text-destaque [text-wrap:balance]">
          {aviso}
        </p>
      )}
    </>
  );
}

// A caixa do diário da dona (coluna da direita). A página busca os dados uma
// vez (useOfensiva) e passa para esta caixa e para a de horas.
export function CaixaFogo({ dados, erro }: { dados: Ofensiva | null; erro: boolean }) {
  return (
    <section
      aria-label="Ofensiva"
      className="flex flex-col items-center rounded-2xl border border-linha bg-superficie px-4 pb-3.5 pt-3"
    >
      {erro ? (
        <p className="text-sm text-tinta-suave">Não foi possível carregar a ofensiva.</p>
      ) : !dados ? (
        <div role="status" aria-label="Carregando a ofensiva" className="h-52 w-full animate-pulse rounded-xl bg-linha" />
      ) : (
        <LegendaFogo dados={dados} comAviso />
      )}
    </section>
  );
}

// O painel do topo, no perfil de quem visita: o fogo faz parte das informações
// da pessoa, com o fundo no tom da chama e sem o aviso (que fala com a dona).
export function PainelFogo({ username }: { username: string }) {
  const { dados, erro } = useOfensiva(username);
  const faixa = faixaDoFogo(dados?.atual ?? 0);
  return (
    <section
      aria-label="Ofensiva"
      className={`fogo-${faixa} flex flex-col items-center justify-center rounded-[14px] px-4 pb-3.5 pt-3 sm:ml-auto sm:w-52 sm:flex-none sm:self-stretch`}
      style={{ background: "var(--fogo-painel)" }}
    >
      {erro ? (
        <p className="text-sm text-tinta-suave">Não foi possível carregar a ofensiva.</p>
      ) : !dados ? (
        <div role="status" aria-label="Carregando a ofensiva" className="h-44 w-full animate-pulse rounded-xl bg-linha" />
      ) : (
        <LegendaFogo dados={dados} comAviso={false} noPainel />
      )}
    </section>
  );
}
