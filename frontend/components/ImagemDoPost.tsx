"use client";

// A imagem de um post de matéria (#105, Pessoa A), dentro do CardPost. Ela só
// é buscada quando o card chega perto da tela: um feed com 20 posts não pede
// 20 imagens de uma vez. A busca leva o token (lib/imagem.ts), porque a
// imagem, como o post, só é vista por quem entrou.

import { useEffect, useRef, useState } from "react";

import { buscarImagem } from "@/lib/imagem";

// A caixa da foto segue o formato dela (#127), com dois limites: a altura até
// 28rem (o mesmo da largura máxima, max-w-md), e a proporção entre 1:2 (bem em
// pé) e 2:1 (bem deitada). Fora disso, a foto aparece inteira com faixas.
const ALTURA_MAXIMA_REM = 28;
const PROPORCAO_MINIMA = 1 / 2;
const PROPORCAO_MAXIMA = 2;
// Sem o tamanho (o backend não conseguiu ler), a caixa fica deitada, em 4:3.
const PROPORCAO_PADRAO = 4 / 3;

export function ImagemDoPost({
  postId,
  largura,
  altura,
  aoTirar,
}: {
  postId: number;
  largura?: number | null;
  altura?: number | null;
  aoTirar?: () => Promise<void>;
}) {
  const caixa = useRef<HTMLDivElement>(null);
  const [perto, setPerto] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [falhou, setFalhou] = useState(false);
  const [tirando, setTirando] = useState(false);
  // Tirar a imagem não tem volta: o primeiro clique só pergunta.
  const [confirmando, setConfirmando] = useState(false);

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
      setConfirmando(false);
    }
  }

  const proporcao =
    largura && altura
      ? Math.min(PROPORCAO_MAXIMA, Math.max(PROPORCAO_MINIMA, largura / altura))
      : PROPORCAO_PADRAO;

  // Sem a imagem (erro de rede, ou ela foi tirada noutra aba), o card segue sem ela.
  if (falhou) return null;

  return (
    <div ref={caixa} className="mt-2">
      {/* A caixa tem o mesmo tamanho antes e depois de a foto chegar: assim
          o card não cresce quando ela carrega, a lista não pula enquanto as
          fotos chegam, e o voltar (MemoriaDaNavegacao) cai no ponto certo.
          O formato vem do post (largura e altura), então a foto em pé ganha
          uma caixa em pé, sem as faixas dos lados (#127). */}
      <div
        style={{ aspectRatio: proporcao, width: `min(100%, ${ALTURA_MAXIMA_REM * proporcao}rem)` }}
        className="max-w-md overflow-hidden rounded-lg border border-linha bg-fundo"
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element -- endereço local (blob:), o next/image não serve
          <img src={url} alt="Imagem do post" className="size-full object-contain" />
        ) : (
          <div role="status" aria-label="Carregando a imagem" className="size-full animate-pulse bg-linha" />
        )}
      </div>
      {aoTirar && url && !confirmando && (
        <button
          type="button"
          onClick={() => setConfirmando(true)}
          className="mt-1 text-sm text-tinta-suave hover:text-tinta hover:underline"
        >
          Tirar a imagem
        </button>
      )}
      {aoTirar && url && confirmando && (
        <p role="group" aria-label="Confirmar" className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-tinta-suave">
          Tirar a imagem do post?
          <button type="button" onClick={tirar} disabled={tirando} className="font-medium text-tinta hover:underline">
            Sim, tirar
          </button>
          <button type="button" onClick={() => setConfirmando(false)} disabled={tirando} className="hover:text-tinta hover:underline">
            Cancelar
          </button>
        </p>
      )}
    </div>
  );
}
