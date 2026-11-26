// Começar um pedido antes de quem vai usá-lo aparecer na tela (Pessoa C).
//
// A página do post só desenha a conversa depois que o post chega, e a
// conversa só então pedia os comentários: as duas esperas se somavam. Agora a
// página pede os comentários junto com o post (precarregar) e a conversa, ao
// aparecer, pega a resposta que já está a caminho (usarPrecarregado).

import { apiGet } from "@/lib/api";

// Um pedido guardado vale por pouco tempo: se a pessoa saiu da página antes de
// usá-lo, a próxima visita busca de novo em vez de mostrar dados velhos.
const VALIDADE_MS = 10_000;

const pendentes = new Map<string, { pedido: Promise<unknown>; em: number }>();

export function precarregar(caminho: string): void {
  const guardado = pendentes.get(caminho);
  if (guardado && Date.now() - guardado.em < VALIDADE_MS) return;
  const pedido = apiGet(caminho);
  // Um erro aqui não pode virar "erro não tratado": quem usar o pedido trata.
  pedido.catch(() => {});
  pendentes.set(caminho, { pedido, em: Date.now() });
}

// Usa o pedido já feito, uma vez só: o próximo carregamento busca de novo.
export function usarPrecarregado<T>(caminho: string): Promise<T> {
  const guardado = pendentes.get(caminho);
  pendentes.delete(caminho);
  if (guardado && Date.now() - guardado.em < VALIDADE_MS) return guardado.pedido as Promise<T>;
  return apiGet<T>(caminho);
}
