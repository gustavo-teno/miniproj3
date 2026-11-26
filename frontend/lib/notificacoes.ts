"use client";

// As notificações (#103, Pessoa A): os pedidos ao backend e o número do sino
// no topo. Ficam aqui, e não no lib/api.ts, para o PR não mexer no arquivo
// da Camila além do necessário. O número segue o jeito das não lidas das DMs
// (lib/naoLidas.ts): pergunta a cada 30 segundos, com a aba à vista, e na hora
// em que a página de notificações abre (avisarQueViu), para zerar sem esperar.

import { useCallback, useEffect, useState } from "react";

import { apiGet, type Autor } from "@/lib/api";
import { useRepetir } from "@/lib/useRepetir";

export type Notificacao = {
  tipo: "curtida" | "comentario" | "resposta" | "curtida_comentario" | "seguiu";
  // Quem fez a ação. Nas curtidas agrupadas, a mais recente; `outros` diz
  // quantas pessoas além dela.
  pessoa: Autor;
  outros: number;
  quando: string;
  nova: boolean;
  post_id: number | null;
  comentario_id: number | null;
  // A conversa que a linha abre (resposta e curtida de comentário).
  conversa_id: number | null;
  trecho: string;
};

// Abrir a lista conta como ver tudo: o backend zera o contador.
export function buscarNotificacoes(): Promise<Notificacao[]> {
  return apiGet<Notificacao[]>("/notificacoes");
}

export async function contarNovas(): Promise<number> {
  return (await apiGet<{ total: number }>("/notificacoes/novas")).total;
}

const EVENTO_VIU = "notificacoes-vistas";

export function avisarQueViu() {
  window.dispatchEvent(new Event(EVENTO_VIU));
}

// ligado = false enquanto ninguém entrou (não há o que contar).
export function useNovasNotificacoes(ligado: boolean): number {
  const [total, setTotal] = useState(0);

  const atualizar = useCallback(() => {
    // Erro aqui não merece aviso: o número só some até a próxima tentativa.
    contarNovas()
      .then(setTotal)
      .catch(() => setTotal(0));
  }, []);

  useEffect(() => {
    if (!ligado) return;
    atualizar();
    window.addEventListener(EVENTO_VIU, atualizar);
    return () => window.removeEventListener(EVENTO_VIU, atualizar);
  }, [ligado, atualizar]);

  useRepetir(atualizar, 30_000, ligado);
  return total;
}
