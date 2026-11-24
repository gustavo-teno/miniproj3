"use client";

// "Horas estudadas" (#10, Pessoa B), no desenho aprovado em 24/11: só a dona do
// diário vê (privado). O total da semana e o da semana anterior vêm da rota da
// ofensiva (Gustavo); as barras de segunda a domingo somam os minutos dos
// posts desta semana, com a mesma regra dele: semana de segunda a domingo no
// horário de Brasília, e bate-papo não conta. Dia sem estudo fica com a barra
// vazia, sem marca de "falhou": descanso não é fracasso.

import { useEffect, useState } from "react";

import { buscarPostsDoPerfil, type Ofensiva } from "@/lib/api";
import { duracao } from "@/lib/tempo";

const DIAS = ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"];
const BRASILIA_MS = -3 * 60 * 60 * 1000; // o mesmo fuso fixo do backend (core/ofensiva.py)

// O dia em Brasília de um momento, como número de dias desde 1970 (para comparar).
function diaEmBrasilia(iso: string | Date): number {
  const ms = new Date(iso).getTime() + BRASILIA_MS;
  return Math.floor(ms / 86_400_000);
}

// A segunda-feira desta semana em Brasília (1/1/1970 foi uma quinta: +3 acerta para segunda).
function segundaDestaSemana(): number {
  const hoje = diaEmBrasilia(new Date());
  return hoje - ((hoje + 3) % 7);
}

function horas(minutos: number): string {
  return minutos ? duracao(minutos) : "0h";
}

export function HorasEstudadas({
  username,
  ofensiva,
  versao,
}: {
  username: string;
  ofensiva: Ofensiva | null;
  versao: number; // muda quando entra um post novo, para recalcular as barras
}) {
  const [porDia, setPorDia] = useState<number[] | null>(null);

  useEffect(() => {
    let ativo = true;
    const segunda = segundaDestaSemana();
    // Os 100 posts mais novos cobrem a semana de quem posta até ~14 vezes por dia.
    buscarPostsDoPerfil(username, null, 0, 100)
      .then((pagina) => {
        if (!ativo) return;
        const soma = [0, 0, 0, 0, 0, 0, 0];
        for (const p of pagina.items) {
          if (p.tag === "bate-papo" || !p.minutos) continue;
          const i = diaEmBrasilia(p.created_at) - segunda;
          if (i >= 0 && i < 7) soma[i] += p.minutos;
        }
        setPorDia(soma);
      })
      .catch(() => ativo && setPorDia(null));
    return () => {
      ativo = false;
    };
  }, [username, versao]);

  const maior = Math.max(1, ...(porDia ?? [0]));

  return (
    <section aria-labelledby="titulo-horas" className="rounded-2xl border border-linha bg-superficie px-4 py-3.5">
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
      <div className="mt-2.5 flex h-16 gap-1.5" role="img" aria-label={porDia ? resumoParaLeitor(porDia) : "Carregando as horas por dia"}>
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
