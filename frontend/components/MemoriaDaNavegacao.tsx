"use client";

// Lembra por onde a pessoa andou no site (#116), para o voltar levar de volta
// ao mesmo ponto: o "← Voltar" do post, e também o voltar do navegador e do
// celular. Fica no layout, sempre na tela, e não mostra nada.
//
// O feed, o diário e as turmas buscam os posts depois de abrir, então logo ao
// voltar a página ainda está curta e não dá para rolar até onde a pessoa
// estava. Por isso a posição é refeita aos poucos, enquanto os posts chegam,
// por até 3 s, e para se a pessoa mexer na tela antes.

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const ESPERA_MAXIMA_MS = 3000;

// Vira true na primeira troca de tela dentro do site. Recarregar a página
// zera, e aí o "← Voltar" leva ao feed: não sabemos de onde a pessoa veio.
let trocouDeTela = false;
let telaAtual: string | null = null;
// A posição de cada tela, guardada enquanto a pessoa rola.
const posicoes = new Map<string, number>();
// A posição a refazer na próxima tela, quando ela veio de um voltar.
let posicaoARefazer: number | null = null;

export function navegouNoSite() {
  return trocouDeTela;
}

export function MemoriaDaNavegacao() {
  const caminho = usePathname();

  useEffect(() => {
    function guardar() {
      // Ao trocar de tela, o endereço muda antes de a página nova aparecer:
      // só guarda se ainda é a mesma tela, para não gravar o topo da nova.
      if (location.pathname === telaAtual) posicoes.set(telaAtual, scrollY);
    }
    function aoVoltar() {
      posicaoARefazer = posicoes.get(location.pathname) ?? null;
    }
    addEventListener("scroll", guardar, { passive: true });
    addEventListener("popstate", aoVoltar);
    return () => {
      removeEventListener("scroll", guardar);
      removeEventListener("popstate", aoVoltar);
    };
  }, []);

  useEffect(() => {
    if (telaAtual !== null && telaAtual !== caminho) trocouDeTela = true;
    telaAtual = caminho;

    const alvo = posicaoARefazer;
    posicaoARefazer = null;
    if (!alvo) return;

    const inicio = Date.now();
    let quadro = 0;
    function tentar() {
      scrollTo(0, alvo!);
      const chegou = Math.abs(scrollY - alvo!) < 2;
      if (!chegou && Date.now() - inicio < ESPERA_MAXIMA_MS) quadro = requestAnimationFrame(tentar);
    }
    // Se a pessoa rolar ou tocar na tela antes, a escolha dela vale.
    const desistir = () => cancelAnimationFrame(quadro);
    const eventos = ["wheel", "touchstart", "keydown", "mousedown"];
    eventos.forEach((e) => addEventListener(e, desistir, { passive: true }));
    quadro = requestAnimationFrame(tentar);
    return () => {
      desistir();
      eventos.forEach((e) => removeEventListener(e, desistir));
    };
  }, [caminho]);

  return null;
}
