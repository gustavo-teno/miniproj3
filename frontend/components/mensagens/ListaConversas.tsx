"use client";

// A lista de conversas das DMs (#18, decisão 6): da mais recente para a mais
// antiga, com a última mensagem e quantas ainda não foram lidas.
//
// Ela mora no layout de /mensagens e fica sempre montada: no computador (a
// partir de `lg`) fica numa coluna à esquerda, com a conversa aberta
// destacada, e a conversa abre do lado (#91); no celular é a tela inteira de
// /mensagens, e a conversa abre por cima, como sempre.

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Avatar } from "@/components/Avatar";
import { AvisoErro } from "@/components/FormAuth";
import { buscarConversas, type Conversa } from "@/lib/api";
import { useAoLer } from "@/lib/naoLidas";
import { dataCompleta, tempoDesde } from "@/lib/tempo";
import { useExigeLogin } from "@/lib/useExigeLogin";
import { useRepetir } from "@/lib/useRepetir";

// `aberta` é o @ da conversa que está aberta ao lado, ou null.
export function ListaConversas({ aberta }: { aberta: string | null }) {
  const liberado = useExigeLogin();
  // undefined = carregando.
  const [conversas, setConversas] = useState<Conversa[] | undefined>(undefined);
  const [erro, setErro] = useState<string | null>(null);

  const atualizar = useCallback(() => {
    buscarConversas()
      .then((lista) => {
        setConversas(lista);
        setErro(null);
      })
      .catch((e: Error) => setErro(e.message));
  }, []);

  // Pede a lista ao abrir a tela e de novo a cada troca de conversa: ela mora
  // no layout e não é remontada quando a conversa muda.
  useEffect(() => {
    if (liberado) atualizar();
  }, [aberta, liberado, atualizar]);
  // Quando a conversa aberta é lida ou recebe mensagem nova, a bolinha de não
  // lidas e a prévia da última mensagem mudam na hora (o mesmo aviso que o
  // número do topo escuta).
  useAoLer(atualizar, liberado);
  // Uma conversa nova ou uma resposta de outra pessoa sobe para o topo sem recarregar.
  useRepetir(atualizar, 15_000, liberado);

  if (!liberado) return null;

  return (
    <div className="mx-auto max-w-2xl lg:max-w-none">
      <h1 className="text-2xl font-semibold lg:border-b lg:border-linha lg:px-4 lg:py-3 lg:text-xl">Mensagens</h1>

      <div className="mt-4 empty:hidden lg:mx-4">
        <AvisoErro texto={erro} />
      </div>

      {conversas === undefined && !erro && (
        <div role="status" aria-label="Carregando as conversas" className="mt-4 h-40 animate-pulse rounded-xl bg-linha" />
      )}

      {conversas?.length === 0 && (
        <div className="mt-4 rounded-xl border border-linha bg-superficie p-6 text-center lg:border-0">
          <p className="font-semibold">Nenhuma conversa ainda</p>
          {/* Explica a regra, para a pessoa não achar que a função está quebrada. */}
          <p className="mx-auto mt-1 max-w-md text-sm text-tinta-suave">
            As mensagens são só entre quem se segue mutuamente. Abra o diário de alguém que você segue e que
            te segue de volta para começar.
          </p>
        </div>
      )}

      {conversas && conversas.length > 0 && (
        <ul className="mt-4 overflow-hidden rounded-xl border border-linha bg-superficie lg:mt-0 lg:rounded-none lg:border-0">
          {conversas.map((c) => {
            const estaAberta = c.pessoa.username === aberta;
            return (
              <li key={c.pessoa.id} className="border-b border-linha last:border-b-0">
                <Link
                  href={`/mensagens/${c.pessoa.username}`}
                  aria-current={estaAberta ? "page" : undefined}
                  className={
                    "flex items-center gap-3 p-4 hover:bg-destaque-fundo lg:border-l-[3px] " +
                    (estaAberta ? "lg:border-destaque lg:bg-destaque-fundo" : "lg:border-transparent")
                  }
                >
                  <Avatar autor={c.pessoa} />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-baseline gap-2">
                      <span className={`truncate ${c.nao_lidas ? "font-semibold" : ""}`}>{c.pessoa.name}</span>
                      <time
                        dateTime={c.ultima.created_at}
                        title={dataCompleta(c.ultima.created_at)}
                        className="ml-auto flex-none text-xs text-tinta-suave"
                      >
                        {tempoDesde(c.ultima.created_at)}
                      </time>
                    </p>
                    <p className={`truncate text-sm ${c.nao_lidas ? "text-tinta" : "text-tinta-suave"}`}>
                      {c.ultima.minha && "Você: "}
                      {c.ultima.texto}
                    </p>
                  </div>
                  {c.nao_lidas > 0 && (
                    <span
                      aria-label={c.nao_lidas === 1 ? "1 não lida" : `${c.nao_lidas} não lidas`}
                      className="grid min-w-6 flex-none place-items-center rounded-full bg-destaque px-1.5 text-xs font-semibold leading-6 text-sobre-destaque"
                    >
                      {c.nao_lidas}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
