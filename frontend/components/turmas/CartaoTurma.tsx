// Uma turma na aba Turmas (#17, Pessoa D): o nome e quanta gente tem. Leva
// para a página da turma. "destaque" é o cartão maior de "Suas turmas".

import Link from "next/link";

import { enderecoDaTurma, type Turma } from "@/lib/api";

// "10 pessoas · 3 estudaram hoje". Ninguém estudou hoje: só as pessoas, sem
// um "0" que soa como cobrança (DESIGN.md, tom dos textos).
export function resumoDaTurma(turma: Turma): string {
  if (turma.pessoas === 0) return "Ninguém ainda";
  const pessoas = turma.pessoas === 1 ? "1 pessoa" : `${turma.pessoas} pessoas`;
  if (turma.estudaram_hoje === 0) return pessoas;
  const hoje = turma.estudaram_hoje === 1 ? "1 estudou hoje" : `${turma.estudaram_hoje} estudaram hoje`;
  return `${pessoas} · ${hoje}`;
}

export function CartaoTurma({ turma, destaque = false }: { turma: Turma; destaque?: boolean }) {
  return (
    <Link
      href={enderecoDaTurma(turma.tipo, turma.chave)}
      className={
        "block min-w-0 rounded-xl border bg-superficie hover:bg-destaque-fundo " +
        (destaque ? "border-destaque/40 p-4" : "border-linha px-4 py-3")
      }
    >
      {destaque && (
        <span className="block text-xs font-semibold uppercase tracking-wide text-tinta-suave">
          {turma.tipo === "vestibular" ? "Vestibular" : "Curso"}
        </span>
      )}
      <span className={"block truncate font-semibold " + (destaque ? "text-lg" : "")}>{turma.nome}</span>
      <span className="block truncate text-sm text-tinta-suave">{resumoDaTurma(turma)}</span>
    </Link>
  );
}
