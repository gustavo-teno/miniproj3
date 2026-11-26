"use client";

// O número de mensagens não lidas, na aba Mensagens (decisão 6): é ele que
// avisa que o colega respondeu. Pergunta ao backend a cada 30 segundos, com a
// aba à vista, e na hora em que uma conversa é lida (avisarQueLeu), para o
// número não ficar velho depois de abrir a conversa.

import { useCallback, useEffect, useState } from "react";

import { contarNaoLidas } from "@/lib/api";
import { useRepetir } from "@/lib/useRepetir";

const EVENTO_LEU = "dms-lidas";

export function avisarQueLeu() {
  window.dispatchEvent(new Event(EVENTO_LEU));
}

// Roda `acao` sempre que uma conversa é lida ou recebe mensagem nova (o mesmo
// aviso de cima). A lista de conversas usa para a bolinha e a prévia da última
// mensagem mudarem na hora, sem esperar a próxima volta (#93).
export function useAoLer(acao: () => void, ligado: boolean) {
  useEffect(() => {
    if (!ligado) return;
    window.addEventListener(EVENTO_LEU, acao);
    return () => window.removeEventListener(EVENTO_LEU, acao);
  }, [acao, ligado]);
}

// ligado = false enquanto ninguém entrou (não há o que contar).
export function useNaoLidas(ligado: boolean): number {
  const [total, setTotal] = useState(0);

  const atualizar = useCallback(() => {
    // Erro aqui não merece aviso: o número só some até a próxima tentativa.
    contarNaoLidas()
      .then(setTotal)
      .catch(() => setTotal(0));
  }, []);

  useEffect(() => {
    if (!ligado) return;
    atualizar();
    window.addEventListener(EVENTO_LEU, atualizar);
    return () => window.removeEventListener(EVENTO_LEU, atualizar);
  }, [ligado, atualizar]);

  useRepetir(atualizar, 30_000, ligado);
  return total;
}
