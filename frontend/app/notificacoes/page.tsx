"use client";

// As notificações (#103, Pessoa A): quem curtiu, comentou, respondeu ou
// começou a te seguir, da mais nova para a mais antiga. Cada linha leva ao
// post ou ao perfil. Abrir a página zera o número do sino no topo; as novas
// ficam com o fundo lavanda até a próxima visita.

import Link from "next/link";
import { useEffect, useState } from "react";

import { Avatar } from "@/components/Avatar";
import { AvisoErro } from "@/components/FormAuth";
import { avisarQueViu, buscarNotificacoes, type Notificacao } from "@/lib/notificacoes";
import { dataCompleta, tempoDesde } from "@/lib/tempo";
import { useExigeLogin } from "@/lib/useExigeLogin";

export default function NotificacoesPage() {
  const liberado = useExigeLogin();
  // undefined = carregando.
  const [lista, setLista] = useState<Notificacao[] | undefined>(undefined);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!liberado) return;
    buscarNotificacoes()
      .then((avisos) => {
        setLista(avisos);
        // O backend já marcou como visto: o sino zera sem esperar 30 s.
        avisarQueViu();
      })
      .catch((e: Error) => setErro(e.message));
  }, [liberado]);

  if (!liberado) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold">Notificações</h1>

      <div className="mt-4 empty:hidden">
        <AvisoErro texto={erro} />
      </div>

      {lista === undefined && !erro && (
        <div role="status" aria-label="Carregando as notificações" className="mt-4 space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-linha" />
          ))}
        </div>
      )}

      {lista?.length === 0 && (
        <div className="mt-4 rounded-xl border border-linha bg-superficie p-6 text-center">
          <p className="font-semibold">Nenhuma notificação ainda</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-tinta-suave">
            Quando alguém curtir ou comentar uma sessão sua, ou começar a te seguir, aparece aqui.
          </p>
        </div>
      )}

      {lista && lista.length > 0 && (
        <ul className="mt-4 divide-y divide-linha overflow-hidden rounded-xl border border-linha bg-superficie">
          {lista.map((n) => (
            <li key={`${n.tipo}-${n.post_id}-${n.comentario_id}-${n.pessoa.id}-${n.quando}`}>
              <Link
                href={destino(n)}
                className={
                  "flex gap-3 px-4 py-3 transition-colors hover:bg-destaque-fundo " +
                  (n.nova ? "bg-destaque-fundo" : "")
                }
              >
                <Avatar autor={n.pessoa} />
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] leading-snug">
                    <span className="font-semibold">{n.pessoa.name}</span> {frase(n)}
                    {n.nova && <span className="sr-only"> (nova)</span>}
                  </p>
                  {n.trecho && (
                    // Uma linha só, cortada com "...": uma palavra enorme não empurra a tela para o lado no celular.
                    <p className="mt-0.5 truncate text-sm text-tinta-suave">“{n.trecho}”</p>
                  )}
                  <time dateTime={n.quando} title={dataCompleta(n.quando)} className="mt-0.5 block text-xs text-tinta-suave">
                    {tempoDesde(n.quando)}
                  </time>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// "Bia e mais 2 pessoas curtiram seu post".
function frase(n: Notificacao): string {
  const mais = n.outros === 0 ? "" : ` e mais ${n.outros} ${n.outros === 1 ? "pessoa" : "pessoas"}`;
  const curtiu = n.outros === 0 ? "curtiu" : "curtiram";
  switch (n.tipo) {
    case "curtida":
      return `${mais} ${curtiu} seu post`.trim();
    case "curtida_comentario":
      return `${mais} ${curtiu} seu comentário`.trim();
    case "comentario":
      return "comentou no seu post";
    case "resposta":
      return "respondeu seu comentário";
    case "seguiu":
      return "começou a te seguir";
  }
}

function destino(n: Notificacao): string {
  if (n.tipo === "seguiu" || n.post_id === null) return `/u/${n.pessoa.username}`;
  return `/posts/${n.post_id}`;
}
