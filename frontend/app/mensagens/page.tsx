"use client";

// A lista de conversas das DMs (#18, decisão 6): da mais recente para a mais
// antiga, com a última mensagem e quantas ainda não foram lidas.

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Avatar } from "@/components/Avatar";
import { AvisoErro } from "@/components/FormAuth";
import { buscarConversas, type Conversa } from "@/lib/api";
import { dataCompleta, tempoDesde } from "@/lib/tempo";
import { useExigeLogin } from "@/lib/useExigeLogin";
import { useRepetir } from "@/lib/useRepetir";

export default function MensagensPage() {
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

  useEffect(() => {
    if (liberado) atualizar();
  }, [liberado, atualizar]);
  // Uma conversa nova ou uma resposta sobe para o topo sem recarregar.
  useRepetir(atualizar, 15_000, liberado);

  if (!liberado) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold">Mensagens</h1>

      <div className="mt-4 empty:hidden">
        <AvisoErro texto={erro} />
      </div>

      {conversas === undefined && !erro && (
        <div role="status" aria-label="Carregando as conversas" className="mt-4 h-40 animate-pulse rounded-xl bg-linha" />
      )}

      {conversas?.length === 0 && (
        <div className="mt-4 rounded-xl border border-linha bg-superficie p-6 text-center">
          <p className="font-semibold">Nenhuma conversa ainda</p>
          {/* Explica a regra, para a pessoa não achar que a função está quebrada. */}
          <p className="mx-auto mt-1 max-w-md text-sm text-tinta-suave">
            As mensagens são só entre quem se segue mutuamente. Abra o diário de alguém que você segue e que
            te segue de volta para começar.
          </p>
        </div>
      )}

      {conversas && conversas.length > 0 && (
        <ul className="mt-4 overflow-hidden rounded-xl border border-linha bg-superficie">
          {conversas.map((c) => (
            <li key={c.pessoa.id} className="border-b border-linha last:border-b-0">
              <Link
                href={`/mensagens/${c.pessoa.username}`}
                className="flex items-center gap-3 p-4 hover:bg-destaque-fundo"
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
          ))}
        </ul>
      )}
    </div>
  );
}
