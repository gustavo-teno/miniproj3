"use client";

// O topo do diário (#10, Pessoa B): foto, nome, @, desde quando está na rede,
// a meta no estilo "Fuvest · Medicina · USP", a bio e os contadores. À direita,
// o que muda com quem está vendo: "Editar perfil" para a dona; para quem
// visita, o fogo da ofensiva entra aqui mesmo (no diário da dona ele fica na
// coluna da direita).

import type { ReactNode } from "react";

import { Ofensiva } from "@/components/Ofensiva";
import type { Perfil } from "@/lib/api";
import { nomeDaOpcao, useOpcoes } from "@/lib/opcoes";
import { NOME_REDE } from "@/lib/rede";

// "nov/2026": desde quando a pessoa está na rede.
function mesAno(iso: string): string {
  const data = new Date(iso);
  const mes = data.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
  return `${mes}/${data.getFullYear()}`;
}

export function TopoPerfil({ perfil, acao }: { perfil: Perfil; acao?: ReactNode }) {
  const opcoes = useOpcoes();

  // Quem escolheu "Outro" aparece com o que escreveu (ex.: "Geografia").
  const vestibular =
    perfil.vestibular === "outro" ? perfil.vestibular_outro : nomeDaOpcao(opcoes?.vestibulares, perfil.vestibular);
  const curso = perfil.curso === "outro" ? perfil.curso_outro : nomeDaOpcao(opcoes?.cursos, perfil.curso);
  // O que a pessoa não preencheu some, junto com a bolinha.
  const meta = [vestibular, curso].filter(Boolean);

  return (
    <section
      aria-label="Perfil"
      className="flex flex-col gap-5 rounded-2xl border border-linha bg-superficie p-5 sm:flex-row sm:p-6"
    >
      <div className="flex min-w-0 flex-1 gap-4 sm:gap-5">
        <FotoDoPerfil perfil={perfil} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
            {/* No celular o nome ocupa a linha toda e o botão desce: nada de quebrar
                o nome no meio da palavra. */}
            <h1 className="min-w-0 basis-full break-words text-2xl font-semibold sm:basis-0 sm:flex-1">{perfil.name}</h1>
            {acao}
          </div>
          <p className="text-sm text-tinta-suave">
            <span className="font-numeros">@{perfil.username}</span> · no {NOME_REDE} desde {mesAno(perfil.created_at)}
          </p>

          {(meta.length > 0 || perfil.universidade) && (
            <p className="mt-2">
              {meta.map((item, i) => (
                // A posição como chave: vestibular e curso "Outro" podem ter o mesmo texto.
                <span key={i}>
                  {i > 0 && <span className="mx-2 text-tinta-suave">·</span>}
                  {/* As turmas viram link quando a tela de Turmas (Pessoa D) existir. */}
                  <span className="font-semibold">{item}</span>
                </span>
              ))}
              {perfil.universidade && (
                <span className="text-tinta-suave">
                  {meta.length > 0 && <span className="mx-2">·</span>}
                  {perfil.universidade}
                </span>
              )}
            </p>
          )}

          {perfil.bio && <p className="mt-1 whitespace-pre-line break-words font-light">{perfil.bio}</p>}

          <p className="mt-3 text-sm">
            <span className="font-numeros font-semibold">{perfil.seguidores}</span>{" "}
            <span className="text-tinta-suave">{perfil.seguidores === 1 ? "seguidor" : "seguidores"}</span>
            <span className="mx-2 text-tinta-suave">·</span>
            <span className="font-numeros font-semibold">{perfil.seguindo}</span>{" "}
            <span className="text-tinta-suave">seguindo</span>
          </p>
        </div>
      </div>

      {/* Para quem visita, o fogo faz parte das informações da pessoa. */}
      {!perfil.meu_perfil && (
        <div className="flex items-center justify-center rounded-xl bg-fundo p-4 sm:w-56 sm:flex-none">
          <Ofensiva username={perfil.username} meuPerfil={false} />
        </div>
      )}
    </section>
  );
}

// A foto grande do topo (96px no computador). Fica aqui, e não no <Avatar>,
// enquanto o PR #41 (que mexe no Avatar) não entra na main. Depois dá para
// virar um tamanho do próprio <Avatar>.
function FotoDoPerfil({ perfil }: { perfil: Pick<Perfil, "name" | "avatar_url"> }) {
  const tamanho = "size-16 flex-none rounded-full sm:size-24";
  if (perfil.avatar_url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={perfil.avatar_url} alt="" className={`${tamanho} object-cover`} />;
  }
  const iniciais = perfil.name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span
      aria-hidden
      className={`${tamanho} grid place-items-center bg-destaque-fundo text-xl font-semibold text-destaque sm:text-3xl`}
    >
      {iniciais}
    </span>
  );
}
