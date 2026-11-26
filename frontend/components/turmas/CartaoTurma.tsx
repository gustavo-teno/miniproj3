"use client";

// As peças da aba Turmas (#17; desenho "B · Folha", #94): o cartão de cada
// uma das "Suas turmas", com o marcador lavanda de caderno, e a folha de
// Vestibulares ou de Cursos, com uma linha por turma.

import Link from "next/link";
import { useEffect, useState } from "react";

import { Avatar } from "@/components/Avatar";
import { buscarMembros, enderecoDaTurma, type Membro, type Turma } from "@/lib/api";

// "10 pessoas · 3 estudaram hoje". Ninguém estudou hoje: só as pessoas, sem
// um "0" que soa como cobrança (DESIGN.md, tom dos textos).
export function resumoDaTurma(turma: Turma): string {
  if (turma.pessoas === 0) return "Ninguém ainda";
  const pessoas = turma.pessoas === 1 ? "1 pessoa" : `${turma.pessoas} pessoas`;
  if (turma.estudaram_hoje === 0) return pessoas;
  const hoje = turma.estudaram_hoje === 1 ? "1 estudou hoje" : `${turma.estudaram_hoje} estudaram hoje`;
  return `${pessoas} · ${hoje}`;
}

// A sigla de cada turma, como a etiqueta na lombada de um caderno: o
// vestibular em maiúsculas (EN, FU) e o curso com só a primeira (Me, Di).
const SIGLAS: Record<string, string> = {
  enem: "EN",
  fuvest: "FU",
  unicamp: "UC",
  unesp: "UN",
  uerj: "UJ",
  "ita-ime": "IT",
  militares: "MI",
  medicina: "Me",
  odontologia: "Od",
  enfermagem: "En",
  "outras-saude": "Sa",
  psicologia: "Ps",
  direito: "Di",
  engenharias: "Eg",
  computacao: "Cp",
  arquitetura: "Aq",
  "administracao-economia": "Ad",
  "relacoes-internacionais": "RI",
  comunicacao: "Cm",
  licenciaturas: "Li",
};

function sigla(turma: Turma): string {
  if (turma.chave === "outro") return "…";
  const conhecida = SIGLAS[turma.chave];
  if (conhecida) return conhecida;
  const duas = turma.nome.slice(0, 2);
  return turma.tipo === "vestibular" ? duas.toUpperCase() : duas;
}

// Uma das 6 cores pastel dos avatares (globals.css), fixa para cada turma.
function corDaTurma(chave: string): number {
  let soma = 0;
  for (const letra of chave) soma = (soma * 31 + letra.charCodeAt(0)) % 997;
  return soma % 6;
}

export function SiglaTurma({ turma }: { turma: Turma }) {
  return (
    <span
      aria-hidden
      className={`avatar avatar-${corDaTurma(turma.chave)} grid size-8 flex-none place-items-center rounded-lg text-xs font-semibold`}
    >
      {sigla(turma)}
    </span>
  );
}

// "18 pessoas · 4 estudaram hoje", com os números em destaque.
function Contagem({ turma }: { turma: Turma }) {
  if (turma.pessoas === 0) return <>Ninguém ainda</>;
  return (
    <>
      <b className="font-semibold text-tinta">{turma.pessoas}</b> {turma.pessoas === 1 ? "pessoa" : "pessoas"}
      {turma.estudaram_hoje > 0 && (
        <>
          {" · "}
          <b className="font-semibold text-tinta">{turma.estudaram_hoje}</b>{" "}
          {turma.estudaram_hoje === 1 ? "estudou hoje" : "estudaram hoje"}
        </>
      )}
    </>
  );
}

// Quem da turma estudou hoje (até `quantos`), para os rostos dos cartões. Usa
// a primeira página da Chamada: a turma maior do seed tem 10 pessoas.
export function useQuemEstudouHoje(turma: Pick<Turma, "tipo" | "chave">, quantos: number): Membro[] | null {
  const [quem, setQuem] = useState<Membro[] | null>(null);
  useEffect(() => {
    let vale = true;
    buscarMembros(turma.tipo, turma.chave, 0, 50)
      .then((p) => vale && setQuem(p.items.filter((m) => m.estudou_hoje).slice(0, quantos)))
      .catch(() => vale && setQuem([]));
    return () => {
      vale = false;
    };
  }, [turma.tipo, turma.chave, quantos]);
  return quem;
}

// Uma das "Suas turmas": um cartão maior, com o marcador lavanda de caderno à
// esquerda, os rostos de quem estudou hoje e o "Entrar".
export function CartaoMinhaTurma({ turma }: { turma: Turma }) {
  const hoje = useQuemEstudouHoje(turma, 3);
  return (
    <Link
      href={enderecoDaTurma(turma.tipo, turma.chave)}
      className="group relative block min-w-0 rounded-xl border border-linha bg-superficie py-4 pl-16 pr-5 hover:border-destaque/50"
    >
      {/* O marcador de página (a fitinha que sai do alto do caderno). */}
      <span
        aria-hidden
        className="absolute left-5 top-0 h-11 w-7 bg-destaque [clip-path:polygon(0_0,100%_0,100%_100%,50%_72%,0_100%)]"
      />
      <span className="block truncate text-xl font-semibold">{turma.nome}</span>
      <span className="mt-0.5 block text-sm text-tinta-suave">
        <Contagem turma={turma} />
      </span>
      <span className="mt-3 flex items-center justify-between gap-3">
        <span className="flex -space-x-1">
          {hoje?.map((m) => (
            <span key={m.id} className="rounded-full ring-2 ring-superficie">
              <Avatar autor={m} pequeno />
            </span>
          ))}
        </span>
        <span className="text-sm font-semibold text-destaque group-hover:underline">
          Entrar <span aria-hidden>›</span>
        </span>
      </span>
    </Link>
  );
}

// A folha de Vestibulares ou de Cursos: uma folha de caderno (a mesma dos
// posts), com uma linha por turma.
export function FolhaDeTurmas({ titulo, id, turmas }: { titulo: string; id: string; turmas: Turma[] }) {
  return (
    <section aria-labelledby={id} className="folha min-w-0 rounded-xl border border-linha bg-superficie pb-2">
      <h2 id={id} className="py-3.5 pl-7 pr-8 text-lg font-semibold">
        {titulo}
      </h2>
      <ul>
        {turmas.map((t) => (
          <li key={t.chave} className="ml-7 mr-4 border-t border-linha">
            <Link
              href={enderecoDaTurma(t.tipo, t.chave)}
              className="group flex items-center gap-3 py-2.5 pr-1 hover:text-destaque"
            >
              <SiglaTurma turma={t} />
              {/* No computador, o nome e os números numa linha só. No celular, os
                  números descem para baixo do nome, que fica com a linha inteira
                  ("Militares (AFA, EFOMM...)" e "Odontologia" não cabem ao lado). */}
              <span className="min-w-0 flex-1 sm:flex sm:items-center sm:gap-3">
                <span className="block font-semibold leading-snug sm:line-clamp-2 sm:min-w-0 sm:flex-1">{t.nome}</span>
                <span className="mt-0.5 flex items-center gap-2 text-sm text-tinta-suave sm:mt-0 sm:flex-none">
                  <span>
                    {t.pessoas === 0 ? (
                      "ninguém ainda"
                    ) : (
                      <>
                        <b className="font-semibold text-tinta">{t.pessoas}</b> {t.pessoas === 1 ? "pessoa" : "pessoas"}
                      </>
                    )}
                  </span>
                  {/* Quem estudou hoje: um ponto verde e o número. */}
                  <span className="flex items-center gap-1 font-semibold text-presenca sm:w-9">
                    {t.estudaram_hoje > 0 && (
                      <>
                        <span aria-hidden className="size-1.5 rounded-full bg-presenca" />
                        {t.estudaram_hoje}
                        <span className="sr-only">{t.estudaram_hoje === 1 ? " estudou hoje" : " estudaram hoje"}</span>
                      </>
                    )}
                  </span>
                </span>
              </span>
              <span aria-hidden className="flex-none text-tinta-suave group-hover:text-destaque">
                ›
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
