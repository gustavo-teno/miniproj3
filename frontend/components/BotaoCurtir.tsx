"use client";

// O botão de curtir (#11, Pessoa C). Vai no `rodape` do <CardPost>, em todo
// lugar que mostra post (feed, perfil e turmas): <BotaoCurtir post={post} />.
// Muda na hora do clique e desfaz se o backend recusar, para não parecer lento.

import { useState } from "react";

import { apiDelete, apiPost, type Post } from "@/lib/api";

export function BotaoCurtir({ post }: { post: Pick<Post, "id" | "curtidas" | "curtido_por_mim"> }) {
  const [curtido, setCurtido] = useState(post.curtido_por_mim);
  const [curtidas, setCurtidas] = useState(post.curtidas);
  const [enviando, setEnviando] = useState(false);

  async function alternar() {
    if (enviando) return; // dois cliques rápidos não mandam duas chamadas
    const antes = { curtido, curtidas };
    setCurtido(!curtido);
    setCurtidas(curtidas + (curtido ? -1 : 1));
    setEnviando(true);
    try {
      if (curtido) await apiDelete(`/posts/${post.id}/curtir`);
      else await apiPost(`/posts/${post.id}/curtir`);
    } catch {
      setCurtido(antes.curtido);
      setCurtidas(antes.curtidas);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <button
      type="button"
      onClick={alternar}
      aria-pressed={curtido}
      aria-label={curtido ? "Descurtir" : "Curtir"}
      className={`flex items-center gap-1.5 hover:text-destaque ${curtido ? "text-destaque" : ""}`}
    >
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
        <path
          d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2Z"
          fill={curtido ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
      <span className="font-numeros">{curtidas}</span>
      <span className="sr-only">{curtidas === 1 ? "curtida" : "curtidas"}</span>
    </button>
  );
}
