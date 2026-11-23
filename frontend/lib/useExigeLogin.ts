"use client";

// Guarda de página (guia 01, Passo 6): chame no topo de toda página que só
// quem entrou pode ver. Sem token, manda para /login.
//
// Devolve true quando a página já pode aparecer. Até lá, a página não desenha
// o conteúdo: o token só pode ser lido no navegador, depois do primeiro
// desenho, e sem essa espera o conteúdo protegido piscaria na tela.

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { lerToken } from "@/lib/sessao";

export function useExigeLogin(): boolean {
  const router = useRouter();
  const [liberado, setLiberado] = useState(false);

  useEffect(() => {
    // Com o atalho de teste ligado (NEXT_PUBLIC_DEV_USER_ID no .env.local), o
    // backend já sabe quem é a pessoa: não precisa de login para ver a página.
    // Só confere se existe token. Token que deixou de valer é tratado no
    // lib/api.ts: a primeira resposta 401 apaga o token e manda para /login.
    if (process.env.NEXT_PUBLIC_DEV_USER_ID || lerToken()) setLiberado(true);
    else router.replace("/login");
  }, [router]);

  return liberado;
}
