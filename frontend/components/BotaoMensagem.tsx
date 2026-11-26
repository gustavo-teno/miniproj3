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

export function BotaoMensagem({
  username,
  seguidores,
  cheioNoCelular = false,
}: {
  username: string;
  seguidores: number;
  // No celular, o botão ocupa a largura que o pai der, ao lado do Seguir.
  cheioNoCelular?: boolean;
}) {
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
      // Sem o cheioNoCelular, no celular só o balão (como a aba Mensagens): com a
      // palavra, ele não cabia ao lado do Seguir. Com ele, o botão divide a
      // linha com o Seguir e a palavra volta. O min-h deixa o botão só com o
      // ícone da mesma altura do Seguir.
      className={
        "inline-flex min-h-[34px] items-center gap-1.5 whitespace-nowrap rounded-lg border border-destaque py-1.5 text-sm font-semibold text-destaque hover:bg-destaque-fundo sm:px-4 " +
        (cheioNoCelular ? "px-4 max-sm:flex-1 max-sm:justify-center" : "px-2.5")
      }
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
      {/* Sem o cheioNoCelular, a palavra some da tela no celular, mas o leitor de
          tela continua lendo. */}
      <span className={cheioNoCelular ? "" : "sr-only sm:not-sr-only"}>Mensagem</span>
    </Link>
  );
}
