"use client";

// O "← Voltar" da página do post e da tela "Ver conversa" (#116). Quem abre um
// post pelo feed, pelo perfil ou pelas turmas volta para a tela de onde veio,
// no mesmo ponto, como o voltar do navegador. Quem abriu o post direto por um
// link (não há tela anterior no site) vai para o feed, em vez de sair do site.

import { useRouter } from "next/navigation";

import { navegouNoSite } from "@/components/MemoriaDaNavegacao";

export function BotaoVoltar() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => (navegouNoSite() ? router.back() : router.push("/"))}
      className="-ml-2 mb-3 inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-sm text-tinta-suave hover:bg-destaque-fundo hover:text-tinta"
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      Voltar
    </button>
  );
}
