// Uma pessoa na aba Chamada da turma (#17, Pessoa D). Mostra a outra turma
// dela (na turma ENEM, o curso; na turma Medicina, o vestibular) e, nas turmas
// "Outros", o que ela escreveu ("quer Geografia"), como pede a decisão 5.

import Link from "next/link";

import { Avatar } from "@/components/Avatar";
import { BotaoSeguir } from "@/components/BotaoSeguir";
import type { Membro, Opcoes, TipoTurma } from "@/lib/api";
import { nomeDaOpcao } from "@/lib/opcoes";

type Props = {
  membro: Membro;
  tipo: TipoTurma;
  chave: string;
  opcoes: Opcoes | null;
  // A própria pessoa aparece na turma dela: no lugar do Seguir, "você".
  souEu: boolean;
};

export function CartaoMembro({ membro: m, tipo, chave, opcoes, souEu }: Props) {
  const vestibular = m.vestibular === "outro" ? m.vestibular_outro : nomeDaOpcao(opcoes?.vestibulares, m.vestibular);
  const curso = m.curso === "outro" ? m.curso_outro : nomeDaOpcao(opcoes?.cursos, m.curso);
  // Nas turmas "Outros", o texto da pessoa vem primeiro: é o que a diferencia.
  const desteTipo = tipo === "vestibular" ? vestibular : curso;
  const doOutroTipo = tipo === "vestibular" ? curso : vestibular;
  const meta = [chave === "outro" ? desteTipo : "", doOutroTipo, m.universidade].filter(Boolean).join(" · ");

  return (
    <div className="flex items-center gap-3 p-4">
      <Avatar autor={m} />
      <div className="min-w-0 flex-1">
        <p className="flex min-w-0 items-baseline gap-2">
          <Link href={`/u/${m.username}`} className="truncate font-semibold hover:underline">
            {m.name}
          </Link>
          {souEu && <span className="flex-none text-xs font-semibold text-destaque">você</span>}
        </p>
        {/* Duas linhas, e não uma: no celular, o "decidindo entre Direito e
            Psicologia" das turmas "Outros" não cabe numa linha só. */}
        {meta && <p className="line-clamp-2 break-words text-sm text-tinta-suave">{meta}</p>}
        {(m.estudou_hoje || m.segue_voce) && (
          <p className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-tinta-suave">
            {m.estudou_hoje && (
              <span className="inline-flex items-center gap-1">
                <span aria-hidden className="size-1.5 rounded-full bg-destaque" />
                estudou hoje
              </span>
            )}
            {m.segue_voce && !souEu && <span>segue você</span>}
          </p>
        )}
      </div>
      {!souEu && (
        <div className="flex-none">
          <BotaoSeguir username={m.username} />
        </div>
      )}
    </div>
  );
}
