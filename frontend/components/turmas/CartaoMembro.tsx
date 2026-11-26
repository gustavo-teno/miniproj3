// Uma pessoa na aba Chamada da turma (#17, Pessoa D; desenho "B · Folha",
// #94): o número na chamada, o rosto (com um anel verde em quem estudou hoje),
// a outra turma dela (na turma ENEM, o curso; na turma Medicina, o
// vestibular) e, nas turmas "Outros", o que ela escreveu ("quer Geografia")
// marcado como um marca-texto, como pede a decisão 5.

import Link from "next/link";
import type { CSSProperties } from "react";

import { Avatar } from "@/components/Avatar";
import { BotaoSeguir } from "@/components/BotaoSeguir";
import type { Membro, Opcoes, TipoTurma } from "@/lib/api";
import { nomeDaOpcao } from "@/lib/opcoes";

type Props = {
  membro: Membro;
  numero: number;
  tipo: TipoTurma;
  chave: string;
  opcoes: Opcoes | null;
  // A própria pessoa aparece na turma dela: no lugar do Seguir, "você".
  souEu: boolean;
  // Está nas mesmas duas turmas que quem vê (o mesmo vestibular e o mesmo curso).
  mesmaDupla: boolean;
};

// O marca-texto amarelo do texto das turmas "Outros": a mesma classe
// .marca-materia dos posts, com as cores de um marca-texto.
const MARCA_TEXTO = {
  "--materia-texto": "#6b5600",
  "--materia-fundo": "#fff1a8",
  "--materia-texto-noturno": "#f3e39a",
  "--materia-fundo-noturno": "#4a4012",
} as CSSProperties;

const ETIQUETA = "rounded-full bg-destaque-fundo px-2 py-px text-[11px] font-semibold text-destaque";

export function CartaoMembro({ membro: m, numero, tipo, chave, opcoes, souEu, mesmaDupla }: Props) {
  const vestibular = m.vestibular === "outro" ? m.vestibular_outro : nomeDaOpcao(opcoes?.vestibulares, m.vestibular);
  const curso = m.curso === "outro" ? m.curso_outro : nomeDaOpcao(opcoes?.cursos, m.curso);
  const desteTipo = tipo === "vestibular" ? vestibular : curso;
  const doOutroTipo = tipo === "vestibular" ? curso : vestibular;
  // O texto que a pessoa escreveu ao escolher "Outro" ("quer Geografia") vai
  // marcado, como no desenho: é o que mais diz sobre ela.
  const outroEhTexto = (tipo === "vestibular" ? m.curso : m.vestibular) === "outro";
  // Nas turmas "Outros", o texto dela para esta turma é o que a diferencia.
  const textoDela = chave === "outro" ? desteTipo : "";

  return (
    <div className="flex items-center gap-3 py-3">
      <span aria-hidden className="w-7 flex-none text-right font-numeros text-lg font-light text-tinta-suave/70">
        {String(numero).padStart(2, "0")}
      </span>
      <span
        className={
          "flex-none rounded-full " +
          (m.estudou_hoje ? "ring-2 ring-presenca ring-offset-2 ring-offset-superficie" : "")
        }
      >
        <Avatar autor={m} />
      </span>
      <div className="min-w-0 flex-1 text-sm">
        {/* No celular, o nome tem até duas linhas e o resto até três: o
            "decidindo entre Direito e Psicologia" das turmas "Outros" não pode
            ser cortado. No computador, tudo corre numa linha, como no desenho. */}
        <p className="line-clamp-2 sm:inline">
          <Link href={`/u/${m.username}`} className="text-[15px] font-semibold hover:underline">
            {m.name}
          </Link>
          {souEu && <span className="ml-1.5 text-xs font-semibold text-destaque">você</span>}
        </p>
        {(doOutroTipo || m.universidade || textoDela) && (
          <p className="line-clamp-3 break-words text-tinta-suave sm:ml-1.5 sm:inline">
            {textoDela && <Marcado>{textoDela}</Marcado>}
            {textoDela && (doOutroTipo || m.universidade) && " · "}
            {doOutroTipo && (outroEhTexto ? <Marcado>{doOutroTipo}</Marcado> : doOutroTipo)}
            {doOutroTipo && m.universidade && " · "}
            {m.universidade}
          </p>
        )}
        {!souEu && (mesmaDupla || m.segue_voce) && (
          <p className="mt-1 flex flex-wrap gap-1.5">
            {mesmaDupla && <span className={ETIQUETA}>mesma dupla de turmas</span>}
            {m.segue_voce && <span className={ETIQUETA}>segue você</span>}
          </p>
        )}
      </div>
      {/* No celular fica só o anel verde no rosto; o leitor de tela lê o texto. */}
      {m.estudou_hoje && (
        <span className="sr-only flex-none text-sm font-semibold text-presenca sm:not-sr-only">estudou hoje</span>
      )}
      {/* Largura fixa no computador: "Seguir", "Seguindo" e a linha da própria
          pessoa (sem botão) deixam o "estudou hoje" sempre no mesmo lugar. */}
      <div className="flex flex-none justify-end sm:w-24">{!souEu && <BotaoSeguir username={m.username} />}</div>
    </div>
  );
}

function Marcado({ children }: { children: string }) {
  return (
    <span className="marca-materia font-semibold" style={MARCA_TEXTO}>
      {children}
    </span>
  );
}
