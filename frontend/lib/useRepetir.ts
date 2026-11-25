"use client";

// Roda `acao` a cada `intervalo` milissegundos, mas só com a aba à vista: com
// a aba escondida, para (ninguém está olhando, e o backend não recebe pedido à
// toa); ao voltar, roda na hora e retoma. É o "se atualiza sozinha" das DMs
// (decisão 6), sem WebSocket.

import { useEffect, useRef } from "react";

export function useRepetir(acao: () => void, intervalo: number, ligado = true) {
  // A ação mais recente, sem reiniciar o relógio a cada desenho da tela.
  const atual = useRef(acao);
  atual.current = acao;

  useEffect(() => {
    if (!ligado) return;
    let relogio: ReturnType<typeof setInterval> | undefined;

    function ligar() {
      clearInterval(relogio);
      relogio = setInterval(() => atual.current(), intervalo);
    }
    function aoMudarAba() {
      if (document.hidden) {
        clearInterval(relogio);
      } else {
        atual.current();
        ligar();
      }
    }

    if (!document.hidden) ligar();
    document.addEventListener("visibilitychange", aoMudarAba);
    return () => {
      clearInterval(relogio);
      document.removeEventListener("visibilitychange", aoMudarAba);
    };
  }, [intervalo, ligado]);
}
