"use client";

// O botão Salvar (#64, Pessoa A): guarda o post para rever depois, na página
// /salvos. Vai no `rodape` do <CardPost>, ao lado do Curtir:
// <BotaoSalvar post={post} />. Só quem salvou fica sabendo.
// Muda na hora do clique e desfaz se o backend recusar, como o BotaoCurtir.

import { useState } from "react";

import { apiDelete, apiPost, type Post } from "@/lib/api";

export function BotaoSalvar({ post }: { post: Pick<Post, "id" | "salvo_por_mim"> }) {
  const [salvo, setSalvo] = useState(post.salvo_por_mim);
  const [enviando, setEnviando] = useState(false);

  // Quando a lista recarrega, o botão passa a mostrar o que veio do servidor
  // (o mesmo "ajustar o estado quando a prop muda" do BotaoCurtir).
  const [doServidor, setDoServidor] = useState(post);
  if (post.id !== doServidor.id || post.salvo_por_mim !== doServidor.salvo_por_mim) {
    setDoServidor(post);
    setSalvo(post.salvo_por_mim);
  }

  async function alternar() {
    if (enviando) return; // dois cliques rápidos não mandam duas chamadas
    const antes = salvo;
    setSalvo(!salvo);
    setEnviando(true);
    try {
      if (antes) await apiDelete(`/posts/${post.id}/salvar`);
      else await apiPost(`/posts/${post.id}/salvar`);
    } catch {
      setSalvo(antes);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <button
      type="button"
      onClick={alternar}
      aria-pressed={salvo}
      className={`flex items-center gap-1.5 hover:text-destaque ${salvo ? "text-destaque" : ""}`}
    >
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
        <path
          d="M6.5 4.5h11v15.5L12 16.2 6.5 20Z"
          fill={salvo ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
      {/* A palavra diz o estado, e o aria-pressed diz ao leitor de tela que é um botão que liga e desliga. */}
      {salvo ? "Salvo" : "Salvar"}
    </button>
  );
}
