"use client";

// Botão Mensagem do perfil (#18, decisão 6, Pessoa A):
//   <BotaoMensagem username="ana" seguidores={perfil.seguidores} />
//
// Só aparece entre mútuos: ele mesmo pergunta ao backend (GET
// /dms/{username}/pode-mandar) e leva à conversa. Enquanto não sabe, não
// aparece, para não mostrar um botão que some logo depois. Quando o número de
// seguidores muda (seguir de volta pode tornar vocês mútuos), ele pergunta de
// novo, mas mantém o que já mostrava até a resposta chegar: assim o botão não
// pisca ao clicar em Seguir.

import Link from "next/link";
import { useEffect, useState } from "react";

import { podeMandarMensagem } from "@/lib/api";

export function BotaoMensagem({ username, seguidores }: { username: string; seguidores: number }) {
  const [pode, setPode] = useState(false);

  useEffect(() => {
    // Se o username mudar antes da resposta chegar, a resposta velha é ignorada.
    let valendo = true;
    podeMandarMensagem(username)
      .then((resposta) => valendo && setPode(resposta))
      // Sem resposta, o botão só não aparece: a conversa continua na aba Mensagens.
      .catch(() => valendo && setPode(false));
    return () => {
      valendo = false;
    };
  }, [username, seguidores]);

  if (!pode) return null;

  return (
    <Link
      href={`/mensagens/${encodeURIComponent(username)}`}
      title="Mensagem"
      // No celular, só o balão (como a aba Mensagens): com a palavra, ele não
      // cabia ao lado do Seguir e caía para a linha de baixo. O min-h deixa o
      // botão só com o ícone da mesma altura do Seguir.
      className="inline-flex min-h-[34px] items-center gap-1.5 whitespace-nowrap rounded-lg border border-destaque px-2.5 py-1.5 text-sm font-semibold text-destaque hover:bg-destaque-fundo sm:px-4"
    >
      <svg
        viewBox="0 0 24 24"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.4A8 8 0 1 1 21 12z" />
      </svg>
      {/* No celular a palavra some da tela, mas o leitor de tela continua lendo. */}
      <span className="sr-only sm:not-sr-only">Mensagem</span>
    </Link>
  );
}
