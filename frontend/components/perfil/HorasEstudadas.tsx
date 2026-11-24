"use client";

// "Horas estudadas" (#10, Pessoa B), no desenho aprovado em 24/11: só a dona do
// diário vê (privado). Tudo vem da rota da ofensiva (Gustavo, #44): o total da
// semana, o da semana anterior e os minutos de cada dia, de segunda a domingo,
// já com a regra do fuso de Brasília e sem o bate-papo. A rota só manda esses
// números para a dona; para quem visita vêm null (e esta caixa nem aparece).
// Dia sem estudo fica com a barra vazia, sem marca de "falhou": descanso não é
// fracasso.

import type { Ofensiva } from "@/lib/api";
import { duracao } from "@/lib/tempo";

const DIAS = ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"];

function horas(minutos: number | null): string {
  return minutos ? duracao(minutos) : "0h";
}

export function HorasEstudadas({ ofensiva }: { ofensiva: Ofensiva | null }) {
  const porDia = ofensiva?.minutos_por_dia ?? null;
  const maior = Math.max(1, ...(porDia ?? [0]));

  return (
    <section aria-labelledby="titulo-horas" className="flex h-[280px] flex-col rounded-2xl border border-linha bg-superficie px-4 py-3.5">
      <div className="flex items-baseline justify-between">
        <h2 id="titulo-horas" className="text-[15px] font-semibold">
          Horas estudadas
        </h2>
        <span className="inline-flex items-center gap-1 text-xs text-tinta-suave" title="Só você vê estas horas">
          <svg viewBox="0 0 24 24" className="size-[13px]" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
          privado
        </span>
      </div>

      {ofensiva ? (
        <>
          <p className="mt-2.5">
            <b className="font-numeros text-[28px]">{horas(ofensiva.minutos_esta_semana)}</b>{" "}
            <span className="text-sm text-tinta-suave">nesta semana</span>
          </p>
          <p className="mt-0.5 text-[13px] text-tinta-suave">
            <b className="font-numeros text-tinta">{horas(ofensiva.minutos_semana_passada)}</b> na semana anterior
          </p>
        </>
      ) : (
        <div role="status" aria-label="Carregando as horas" className="mt-2.5 h-12 animate-pulse rounded-lg bg-linha" />
      )}

      {/* As barras: a altura de cada dia em relação ao dia com mais horas. */}
      <div className="mt-2.5 flex min-h-16 flex-1 gap-1.5" role="img" aria-label={porDia ? resumoParaLeitor(porDia) : "Carregando as horas por dia"}>
        {DIAS.map((dia, i) => (
          <div key={dia} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex w-full flex-1 items-end overflow-hidden rounded-md bg-destaque-fundo">
              <div className="w-full rounded-md bg-destaque" style={{ height: `${((porDia?.[i] ?? 0) / maior) * 100}%` }} />
            </div>
            <span className="text-[11px] text-tinta-suave">{dia}</span>
          </div>
        ))}
      </div>

      <p className="mt-2.5 text-xs text-tinta-suave">Somadas do tempo de estudo dos seus posts.</p>
    </section>
  );
}

// Quem usa leitor de tela ouve as horas de cada dia, em vez de "gráfico".
function resumoParaLeitor(porDia: number[]): string {
  return "Horas por dia nesta semana: " + DIAS.map((d, i) => `${d} ${horas(porDia[i])}`).join(", ");
}
