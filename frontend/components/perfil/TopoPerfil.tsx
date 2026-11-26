"use client";

// O topo do diário (#10, Pessoa B): foto, nome, @, desde quando está na rede,
// a meta no estilo "Fuvest · Medicina · USP", a bio e os contadores. O que
// muda com quem está vendo: "Editar perfil" para a dona; para quem visita, os
// botões Seguir e Mensagem e o fogo num painel à direita (no diário da dona o
// fogo fica na coluna da direita).

import type { ReactNode } from "react";

import { Avatar } from "@/components/Avatar";
import { BotaoMensagem } from "@/components/BotaoMensagem";
import { BotaoSeguir } from "@/components/BotaoSeguir";
import { PainelFogo } from "@/components/perfil/FogoDoDiario";
import type { Perfil } from "@/lib/api";
import { nomeDaOpcao, useOpcoes } from "@/lib/opcoes";
import { NOME_REDE } from "@/lib/rede";

// "nov/2026": desde quando a pessoa está na rede.
function mesAno(iso: string): string {
  const data = new Date(iso);
  const mes = data.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
  return `${mes}/${data.getFullYear()}`;
}

export function TopoPerfil({
  perfil,
  acao,
  aoMudarSeguidores,
}: {
  perfil: Perfil;
  acao?: ReactNode;
  // O BotaoSeguir avisa quando o número de seguidores muda (seguiu ou deixou de seguir).
  aoMudarSeguidores?: (seguidores: number) => void;
}) {
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
      {/* No celular, o avatar divide a linha só com o nome e o @, e o resto (meta,
          bio, contadores e botões) usa a largura toda embaixo. No computador, o
          avatar fica numa coluna à esquerda, como sempre. */}
      <div className="grid min-w-0 flex-1 grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-3.5 sm:gap-x-5 sm:gap-y-0">
        <div className="self-center sm:row-span-2 sm:self-start">
          <Avatar autor={perfil} enorme />
        </div>

        {/* Para quem visita, as informações vão até 560px (como no esboço) e o
            painel do fogo fica encostado à direita. */}
        <div className={`min-w-0 self-center sm:self-auto ${perfil.meu_perfil ? "" : "sm:max-w-[560px]"}`}>
          <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
            {/* No celular o nome ocupa a linha toda e o botão desce: nada de quebrar
                o nome no meio da palavra. */}
            <h1 className="min-w-0 basis-full break-words text-[26px] font-semibold leading-tight sm:basis-0 sm:flex-1">
              {perfil.name}
            </h1>
            {/* No computador, "Editar perfil" fica ao lado do nome; no celular, ele
                desce para a linha dos botões. */}
            <div className="hidden sm:block">{acao}</div>
          </div>
          <p className="mt-0.5 text-sm text-tinta-suave sm:mt-0">
            <span className="font-numeros">@{perfil.username}</span> · <span className="sm:hidden">desde</span>
            <span className="hidden sm:inline">no {NOME_REDE} desde</span> {mesAno(perfil.created_at)}
          </p>
        </div>

        <div className={`col-span-2 min-w-0 sm:col-span-1 ${perfil.meu_perfil ? "" : "sm:max-w-[560px]"}`}>
          {(meta.length > 0 || perfil.universidade) && (
            <p className="text-[15px] sm:mt-2">
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

          <p className="mt-2.5 text-sm">
            <span className="font-numeros font-semibold">{perfil.seguidores}</span>{" "}
            <span className="text-tinta-suave">{perfil.seguidores === 1 ? "seguidor" : "seguidores"}</span>
            <span className="mx-2" />
            <span className="font-numeros font-semibold">{perfil.seguindo}</span>{" "}
            <span className="text-tinta-suave">seguindo</span>
          </p>

          {/* Quem visita: Seguir (o BotaoSeguir da Pessoa D, que já sabe se você segue
              a pessoa) e Mensagem, que só aparece entre mútuos (decisão 6). A linha
              já guarda a altura dos botões enquanto eles carregam, para o topo
              não dar um pulo quando eles aparecem. No celular, os dois dividem a
              largura toda. */}
          {!perfil.meu_perfil && (
            <div className="mt-3.5 flex min-h-[34px] flex-wrap items-start gap-2 max-sm:flex-nowrap">
              <BotaoSeguir username={perfil.username} onMudou={aoMudarSeguidores} cheioNoCelular />
              <BotaoMensagem username={perfil.username} seguidores={perfil.seguidores} cheioNoCelular />
            </div>
          )}
          {perfil.meu_perfil && acao && <div className="mt-3.5 sm:hidden [&>button]:w-full">{acao}</div>}
        </div>
      </div>

      {/* Para quem visita, o fogo faz parte das informações da pessoa. */}
      {!perfil.meu_perfil && <PainelFogo username={perfil.username} />}
    </section>
  );
}
