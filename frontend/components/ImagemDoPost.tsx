"use client";

// A imagem de um post de matéria (#105, Pessoa A), dentro do CardPost. Ela só
// é buscada quando o card chega perto da tela: um feed com 20 posts não pede
// 20 imagens de uma vez. A busca leva o token (lib/imagem.ts), porque a
// imagem, como o post, só é vista por quem entrou.

import { useEffect, useRef, useState } from "react";

import { buscarImagem } from "@/lib/imagem";

export function ImagemDoPost({ postId, aoTirar }: { postId: number; aoTirar?: () => Promise<void> }) {
  const caixa = useRef<HTMLDivElement>(null);
  const [perto, setPerto] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [falhou, setFalhou] = useState(false);
  const [tirando, setTirando] = useState(false);

  useEffect(() => {
    const el = caixa.current;
    if (!el) return;
    const observador = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          setPerto(true);
          observador.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  useEffect(() => {
    if (!perto) return;
    let endereco: string | null = null;
    let ativo = true;
    buscarImagem(postId)
      .then((u) => {
        endereco = u;
        if (ativo) setUrl(u);
        else URL.revokeObjectURL(u);
      })
      .catch(() => ativo && setFalhou(true));
    return () => {
      ativo = false;
      if (endereco) URL.revokeObjectURL(endereco);
    };
  }, [perto, postId]);

  async function tirar() {
    if (!aoTirar || tirando) return;
    setTirando(true);
    try {
      await aoTirar();
    } finally {
      setTirando(false);
    }
  }

  // Sem a imagem (erro de rede, ou ela foi tirada noutra aba), o card segue sem ela.
  if (falhou) return null;

  return (
    <div ref={caixa} className="mt-2">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element -- endereço local (blob:), o next/image não serve
        <img
          src={url}
          alt="Imagem do post"
          className="max-h-[420px] max-w-full rounded-lg border border-linha object-contain"
        />
      ) : (
        <div role="status" aria-label="Carregando a imagem" className="h-48 max-w-sm animate-pulse rounded-lg bg-linha" />
      )}
      {aoTirar && url && (
        <button
          type="button"
          onClick={tirar}
          disabled={tirando}
          className="mt-1 text-sm text-tinta-suave hover:text-tinta hover:underline"
        >
          Tirar a imagem
        </button>
      )}
    </div>
  );
}
