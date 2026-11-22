"use client";

// Guarda de página (guia 01, Passo 6): chame no topo de toda página que só
// quem entrou pode ver. Sem token, manda para /login.

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { lerToken } from "@/lib/sessao";

export function useExigeLogin(): void {
  const router = useRouter();
  useEffect(() => {
    // Com o atalho de teste ligado (NEXT_PUBLIC_DEV_USER_ID no .env.local), o
    // backend já sabe quem é a pessoa: não precisa de login para ver a página.
    if (process.env.NEXT_PUBLIC_DEV_USER_ID) return;
    // Só confere se existe token. Token que deixou de valer é tratado no
    // lib/api.ts: a primeira resposta 401 apaga o token e manda para /login.
    if (!lerToken()) router.replace("/login");
  }, [router]);
}
