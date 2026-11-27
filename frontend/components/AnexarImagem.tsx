"use client";

// O botão de anexar a imagem nos formulários de postar (#105, Pessoa A): o
// feed (FormPost) e o diário (PostarNoDiario). Fechado, é só o ícone; com a
// imagem escolhida, vira a miniatura com um X para tirar. A imagem é reduzida
// aqui mesmo, antes de subir (lib/imagem.ts), e quem envia é o formulário,
// depois que o post existe.
//
// Bate-papo não leva imagem (decisão 1: a foto é o registro do estudo): com
// a matéria em bate-papo, o botão fica apagado e a imagem escolhida sai.

import { useEffect, useRef, useState } from "react";

import { reduzirImagem } from "@/lib/imagem";

export function AnexarImagem({
  imagem,
  aoMudar,
  aoErro,
  bloqueado,
}: {
  imagem: Blob | null;
  aoMudar: (imagem: Blob | null) => void;
  aoErro: (mensagem: string) => void;
  // true em post de bate-papo.
  bloqueado: boolean;
}) {
  const campo = useRef<HTMLInputElement>(null);
  const [preparando, setPreparando] = useState(false);
  const [miniatura, setMiniatura] = useState<string | null>(null);

  // A miniatura é um endereço local da imagem; ele é liberado quando a
  // imagem muda ou o formulário fecha, para não ficar na memória.
  useEffect(() => {
    if (!imagem) return setMiniatura(null);
    const url = URL.createObjectURL(imagem);
    setMiniatura(url);
    return () => URL.revokeObjectURL(url);
  }, [imagem]);

  useEffect(() => {
    if (bloqueado && imagem) aoMudar(null);
  }, [bloqueado, imagem, aoMudar]);

  async function escolher(arquivo: File | undefined) {
    if (!arquivo) return;
    setPreparando(true);
    try {
      aoMudar(await reduzirImagem(arquivo));
    } catch (falha) {
      aoErro(falha instanceof Error ? falha.message : "Não foi possível preparar a imagem.");
    } finally {
      setPreparando(false);
      // Escolher o mesmo arquivo de novo também dispara a troca.
      if (campo.current) campo.current.value = "";
    }
  }

  if (miniatura) {
    return (
      <span className="relative inline-block flex-none">
        {/* eslint-disable-next-line @next/next/no-img-element -- endereço local (blob:), o next/image não serve */}
        <img src={miniatura} alt="Imagem escolhida" className="size-9 rounded-md border border-linha object-cover" />
        <button
          type="button"
          onClick={() => aoMudar(null)}
          aria-label="Tirar a imagem"
          title="Tirar a imagem"
          className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-tinta text-[11px] leading-none text-superficie"
        >
          ✕
        </button>
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => campo.current?.click()}
        disabled={bloqueado || preparando}
        aria-label={bloqueado ? "Anexar imagem (bate-papo não leva imagem)" : "Anexar imagem"}
        title={bloqueado ? "Bate-papo não leva imagem" : "Anexar a foto do caderno ou da lista"}
        className="grid size-9 flex-none place-items-center rounded-lg text-tinta-suave hover:bg-fundo hover:text-tinta disabled:opacity-40 disabled:hover:bg-transparent"
      >
        {preparando ? (
          <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-linha border-t-destaque" />
        ) : (
          <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
        )}
      </button>
      <input
        ref={campo}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => escolher(e.target.files?.[0])}
      />
    </>
  );
}
