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

// O fogo em recorte de papel (escolhido em 24/11): uma chama assimétrica, com
// línguas de alturas diferentes, em camadas: a de trás, mais escura e deslocada
// (a profundidade), a da cor da faixa, a do meio e o miolo claro. Ela cresce com
// os dias, ganha brasas soltas e, nas faixas mais quentes, um brilho atrás.
const FORA = "M32 46C22 46 17 39 19 31C20 27 23 25 23 21C26 24 26 27 25.5 30C28 26 27 19 31 12C31 17 34 20 36 24C37 21 37 18 36 15C41 20 45 27 44 34C43 41 39 46 32 46Z";
const MEIO = "M32 46C25.5 46 22.5 41 24 35C25 31.5 27.5 30 28 26.5C30 29 30.5 31.5 30 34C32 31 32.5 27 34.5 22.5C35.5 27 39.5 30 39.5 36C39.5 42 36.5 46 32 46Z";
const MIOLO = "M32 46C28.5 46 27 43 28 39.5C28.8 37 30.5 36 31 33C32.5 35.5 33.5 36.5 34.5 35C36 37.5 36.5 40 35.8 42.5C35 45 33.6 46 32 46Z";

// Por faixa: o tamanho da chama, se tem brilho atrás e quantas brasas.
const FAIXA_DO_FOGO: Record<number, { escala: number; brilho: boolean; brasas: number }> = {
  1: { escala: 0.95, brilho: false, brasas: 0 },
  2: { escala: 1.02, brilho: false, brasas: 1 },
  3: { escala: 1.15, brilho: false, brasas: 1 },
  4: { escala: 1.22, brilho: true, brasas: 2 },
  5: { escala: 1.32, brilho: true, brasas: 3 },
  6: { escala: 1.4, brilho: true, brasas: 4 },
};
// Onde ficam as brasas (x, y, tamanho), no tamanho cheio da chama.
const BRASAS = [
  [24, 30, 1.1],
  [41, 24, 0.9],
  [20, 22, 0.8],
  [44, 16, 0.7],
];

// A chama cresce a partir da base, no meio do caderno (32, 46).
const escalar = (e: number) => `translate(32 46) scale(${e}) translate(-32 -46)`;

// O caderno aberto em "V": as duas páginas descem até a dobra do meio; embaixo
// de cada uma ficam as bordas das folhas (a grossura), por fora a capa, e uma
// sombra no chão. A chama vem por cima, inteira, com a base sobre as páginas.
function Caderno() {
  const traco = { stroke: "var(--caderno-traco)", strokeWidth: 1, strokeLinejoin: "round" as const };
  return (
    <>
      <ellipse cx="32" cy="55.5" rx="25" ry="2.4" fill="var(--caderno-traco)" opacity=".1" />
      <path d="M8 36.5L5.8 37.6V50.6C14 49 24 49.4 32 54V51.8C24 47.6 15.2 47.2 8 48.8Z" fill="var(--caderno-capa)" {...traco} />
      <path d="M56 36.5L58.2 37.6V50.6C50 49 40 49.4 32 54V51.8C40 47.6 48.8 47.2 56 48.8Z" fill="var(--caderno-capa)" {...traco} />
      <path d="M8 46.4C15.2 44.8 24 45.2 32 49.6V51.8C24 47.6 15.2 47.2 8 48.8Z" fill="var(--caderno-folhas)" {...traco} />
      <path d="M56 46.4C48.8 44.8 40 45.2 32 49.6V51.8C40 47.6 48.8 47.2 56 48.8Z" fill="var(--caderno-folhas)" {...traco} />
      <path d="M8.6 47.6C15.6 46 24 46.4 32 50.7M55.4 47.6C48.4 46 40 46.4 32 50.7" fill="none" stroke="var(--caderno-pauta)" strokeWidth={0.55} />
      <path d="M32 40C24 35.6 15 35 8 36.5V46.4C15.2 44.8 24 45.2 32 49.6Z" fill="var(--caderno-pagina)" {...traco} />
      <path d="M32 40C40 35.6 49 35 56 36.5V46.4C48.8 44.8 40 45.2 32 49.6Z" fill="var(--caderno-pagina)" {...traco} />
      <path d="M29.6 38.9C30.6 39.3 31.3 39.6 32 40V49.6C31.3 49.2 30.6 48.8 29.6 48.5ZM34.4 38.9C33.4 39.3 32.7 39.6 32 40V49.6C32.7 49.2 33.4 48.8 34.4 48.5Z" fill="var(--caderno-dobra)" />
      <path
        d="M11.5 39.4C17 38.4 22.6 39 27.4 41.2M11.5 42.4C17 41.4 22.6 42 27.4 44.2M52.5 39.4C47 38.4 41.4 39 36.6 41.2M52.5 42.4C47 41.4 41.4 42 36.6 44.2"
        fill="none"
        stroke="var(--caderno-pauta)"
        strokeWidth={0.7}
        strokeLinecap="round"
      />
      <path d="M32 40V49.6" fill="none" stroke="var(--caderno-traco)" strokeWidth={1} />
    </>
  );
}

export function IconeFogo({ dias, className }: { dias: number; className?: string }) {
  const faixa = faixaDoFogo(dias);
  const fogo = FAIXA_DO_FOGO[faixa];
  const e = fogo?.escala ?? 0;

  return (
    <svg viewBox="0 -8 64 68" aria-hidden className={`fogo-${faixa} overflow-visible ${className ?? ""}`} strokeLinecap="round" strokeLinejoin="round">
      <Caderno />
      {fogo ? (
        <>
          {fogo.brilho && <ellipse cx="32" cy={46 - 26 * e} rx={18 * e} ry={17 * e} fill="var(--chama)" opacity=".18" />}
          {/* a camada de trás, deslocada: é ela que dá a profundidade */}
          <path transform={`${escalar(e * 1.04)} translate(-1.6 -.4) rotate(-4 32 46)`} d={FORA} fill="var(--chama-contorno)" opacity=".9" />
          <path transform={escalar(e)} d={FORA} fill="var(--chama)" stroke="var(--chama-contorno)" strokeWidth={0.7 / e} />
          <path transform={escalar(e)} d={MEIO} fill="var(--chama-meio)" />
          <path transform={escalar(e)} d={MIOLO} fill="var(--chama-miolo)" />
          {BRASAS.slice(0, fogo.brasas).map(([x, y, r]) => (
            <path
              key={`${x}-${y}`}
              transform={escalar(e)}
              d={`M${x} ${y - r * 1.6}L${x + r} ${y}L${x} ${y + r * 1.6}L${x - r} ${y}Z`}
              fill="var(--chama-meio)"
              stroke="var(--chama-contorno)"
              strokeWidth={0.35}
            />
          ))}
        </>
      ) : (
        // Sem ofensiva: só um fio de fumaça sobe do caderno.
        <path d="M32 38c-1.6-1.8 1-3.4 0-5.4M34.6 36.4c-1.1-1.2.7-2.4 0-3.8" fill="none" stroke="var(--caderno-traco)" strokeWidth={0.9} opacity=".45" />
      )}
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
  const emRecorde = dados.atual > 0 && dados.atual >= dados.recorde;
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
      {/* No painel de quem visita, tudo menor, para caber na altura do bloco do perfil. */}
      <IconeFogo dias={dados.atual} className={noPainel ? "-mb-0.5 -mt-2 size-24" : "-mb-1 -mt-3.5 size-[140px]"} />
      <div className="w-full text-center">
        <p className={`fogo-${faixaDoFogo(dados.atual)} ${noPainel ? "text-[32px]" : "text-[42px]"} font-bold leading-none tracking-tight`}>
          <span style={{ color: "var(--fogo-texto)" }}>{dados.atual}</span>
        </p>
        <p className={`${noPainel ? "text-[15px]" : "text-lg"} font-semibold leading-snug`}>{dados.atual === 1 ? "dia seguido" : "dias seguidos"}</p>
        <p
          className={`fogo-${faixaDoFogo(dados.atual)} mt-1.5 flex items-baseline justify-center gap-1.5 border-t pt-1.5 font-semibold leading-snug ${noPainel ? "text-sm" : "border-linha"}`}
          style={noPainel ? { borderColor: "color-mix(in srgb, var(--fogo-texto) 25%, transparent)" } : undefined}
        >
          {/* Ofensiva atual igual ao recorde: em vez de repetir o número, comemora. */}
          {emRecorde ? (
            <b className="font-bold" style={{ color: "var(--fogo-texto)" }}>
              {comAviso ? "É o seu recorde!" : "Em recorde!"}
            </b>
          ) : (
            <>
              Recorde:{" "}
              <b className={`fogo-${faixaDoFogo(dados.recorde)} font-bold`} style={{ color: "var(--fogo-texto)" }}>
                {dados.recorde}
              </b>
            </>
          )}
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
      className="flex h-[280px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-linha bg-superficie px-4 py-2"
    >
      {erro ? (
        <p className="text-sm text-tinta-suave">Não foi possível carregar a ofensiva.</p>
      ) : !dados ? (
        <div role="status" aria-label="Carregando a ofensiva" className="h-full w-full animate-pulse rounded-xl bg-linha" />
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
      className={`fogo-${faixa} flex flex-col items-center justify-center rounded-[14px] px-4 py-2.5 sm:ml-auto sm:w-48 sm:flex-none sm:self-stretch`}
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
