"use client";

// Listas fixas do contrato (tags, vestibulares e cursos), vindas de
// GET /opcoes. Nenhuma tela copia essas listas: use useOpcoes().

import { useEffect, useState } from "react";

import { apiGet, type Opcao, type Opcoes } from "@/lib/api";

// Uma busca só por carregamento da página, mesmo com várias telas pedindo.
let emAndamento: Promise<Opcoes> | null = null;

export function carregarOpcoes(): Promise<Opcoes> {
  if (!emAndamento) {
    emAndamento = apiGet<Opcoes>("/opcoes").catch((erro) => {
      emAndamento = null; // deixa tentar de novo depois de uma falha
      throw erro;
    });
  }
  return emAndamento;
}

// null enquanto carrega (ou se o backend estiver fora do ar).
export function useOpcoes(): Opcoes | null {
  const [opcoes, setOpcoes] = useState<Opcoes | null>(null);
  useEffect(() => {
    let ativo = true;
    carregarOpcoes()
      .then((o) => ativo && setOpcoes(o))
      .catch(() => {});
    return () => {
      ativo = false;
    };
  }, []);
  return opcoes;
}

// "ita-ime" → "ITA/IME". Sem a lista ainda, mostra a própria chave.
export function nomeDaOpcao(lista: Opcao[] | undefined, valor: string): string {
  return lista?.find((o) => o.valor === valor)?.nome ?? valor;
}
