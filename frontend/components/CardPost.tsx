"use client";

// O card de um post (Pessoa B). É o mesmo no feed, no perfil e nas turmas:
// ninguém cria o seu. A Pessoa C põe os botões de curtir e comentar no
// `rodape`, sem mexer no resto do card.

import Link from "next/link";
import type { ReactNode } from "react";

import { Avatar } from "@/components/Avatar";
import { SimboloMateria } from "@/components/SimboloMateria";
import type { Post } from "@/lib/api";
import { estiloDaTag } from "@/lib/materias";
import { nomeDaOpcao, useOpcoes } from "@/lib/opcoes";
import { dataCompleta, duracao, tempoDesde } from "@/lib/tempo";

export function CardPost({ post, rodape }: { post: Post; rodape?: ReactNode }) {
  const opcoes = useOpcoes();
  const estilo = estiloDaTag(post.tag);

  // Cada post é uma folha de caderno: a dobra e a margem vêm da classe .folha
  // (globals.css), e a lista põe um espaço entre as folhas.
  return (
    <article className="folha flex gap-3 rounded-xl border border-linha bg-superficie py-4 pl-7 pr-6 sm:gap-4">
      {/* A foto de quem postou em destaque, à esquerda: é uma rede de pessoas.
          Ela também leva ao perfil (o nome já faz isso, então o leitor de
          tela e o Tab pulam este link para não repetir). */}
      <Link href={`/u/${post.autor.username}`} aria-hidden tabIndex={-1} className="flex-none">
        <Avatar autor={post.autor} grande />
      </Link>

      <div className="min-w-0 flex-1">
        {/* Quem postou vem primeiro. A matéria fica na linha de baixo, com
            marca-texto na cor dela. */}
        <p className="flex min-w-0 items-center gap-2">
          <Link href={`/u/${post.autor.username}`} className="truncate font-semibold hover:underline">
            {post.autor.name}
          </Link>
          {/* suppressHydrationWarning: o servidor e o navegador calculam o
              "há 2h" em momentos diferentes, então o texto pode mudar. */}
          <time
            dateTime={post.created_at}
            title={dataCompleta(post.created_at)}
            suppressHydrationWarning
            className="flex-none text-tinta-suave"
          >
            {tempoDesde(post.created_at)}
          </time>
        </p>

        <div className="mt-0.5 flex items-center gap-2 text-sm">
          <span className="marca-materia flex items-center gap-1.5 px-1 font-semibold" style={estilo}>
            <SimboloMateria tag={post.tag} className="size-4 flex-none" />
            {/* Sem a lista de /opcoes ainda, o nome some em vez de aparecer como a
                chave ("biologia"); o espaço fica reservado para o texto não pular. */}
            <span className={opcoes ? "" : "invisible"}>{nomeDaOpcao(opcoes?.tags, post.tag)}</span>
          </span>
          {post.minutos != null && (
            <span className="font-numeros text-tinta-suave">{duracao(post.minutos)}</span>
          )}
        </div>

        {/* whitespace-pre-line: as quebras de linha que a pessoa digitou aparecem. */}
        <p className="pauta mt-1 whitespace-pre-line break-words font-light leading-6">{post.texto}</p>

        {rodape && <div className="mt-2 flex gap-6 text-sm text-tinta-suave">{rodape}</div>}
      </div>
    </article>
  );
}
