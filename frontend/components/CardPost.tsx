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

  return (
    <article className="flex gap-3 border-b border-linha p-4 last:border-b-0 sm:gap-4">
      <span className="cor-materia grid size-11 flex-none place-items-center rounded-xl" style={estilo}>
        <SimboloMateria tag={post.tag} className="size-5" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="cor-materia-texto font-semibold" style={estilo}>
            {nomeDaOpcao(opcoes?.tags, post.tag)}
          </span>
          {post.minutos != null && (
            <span className="font-numeros text-sm text-tinta-suave">{duracao(post.minutos)}</span>
          )}
        </div>

        <p className="mt-1 flex min-w-0 items-center gap-2 text-sm">
          <Avatar autor={post.autor} pequeno />
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

        {/* whitespace-pre-line: as quebras de linha que a pessoa digitou aparecem. */}
        <p className="mt-1.5 whitespace-pre-line break-words font-light leading-relaxed">{post.texto}</p>

        {rodape && <div className="mt-2 flex gap-6 text-sm text-tinta-suave">{rodape}</div>}
      </div>
    </article>
  );
}
