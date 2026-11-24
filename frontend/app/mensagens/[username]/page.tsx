"use client";

// Uma conversa das DMs (#18, decisão 6). Ao abrir, vêm as últimas mensagens;
// depois, a cada 4 segundos com a aba à vista, a tela pergunta só pelas que
// chegaram depois da última que ela já tem (?depois_de=<id>).

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";

import { Avatar } from "@/components/Avatar";
import { AvisoErro } from "@/components/FormAuth";
import { buscarConversa, enviarMensagem, type Autor, type Mensagem } from "@/lib/api";
import { avisarQueLeu } from "@/lib/naoLidas";
import { dataCompleta } from "@/lib/tempo";
import { useExigeLogin } from "@/lib/useExigeLogin";
import { useRepetir } from "@/lib/useRepetir";

// O mesmo limite do backend (schemas/dm.py), para avisar antes de enviar.
const MAX_TEXTO = 1000;

// Junta mensagens novas às que a tela já tem, sem repetir: a mensagem que a
// pessoa acabou de enviar também volta na próxima pergunta ao backend.
function juntar(atuais: Mensagem[], novas: Mensagem[]): Mensagem[] {
  const ids = new Set(atuais.map((m) => m.id));
  return [...atuais, ...novas.filter((m) => !ids.has(m.id))];
}

// "18:41"; o dia e a hora completos aparecem ao passar o mouse.
function hora(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default function ConversaPage() {
  const liberado = useExigeLogin();
  const { username } = useParams<{ username: string }>();

  const [pessoa, setPessoa] = useState<Autor | null>(null);
  const [podeResponder, setPodeResponder] = useState(false);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [carregou, setCarregou] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const fim = useRef<HTMLDivElement>(null);

  // O id da última mensagem que a tela tem, para pedir só as novas.
  const ultimoId = mensagens.at(-1)?.id;

  useEffect(() => {
    if (!liberado) return;
    buscarConversa(username)
      .then((c) => {
        setPessoa(c.pessoa);
        setPodeResponder(c.pode_responder);
        setMensagens(c.mensagens);
        avisarQueLeu();
      })
      .catch((e: Error) => setErro(e.message))
      .finally(() => setCarregou(true));
  }, [liberado, username]);

  const buscarNovas = useCallback(() => {
    buscarConversa(username, ultimoId ?? 0)
      .then((c) => {
        setPodeResponder(c.pode_responder);
        if (c.mensagens.length) {
          setMensagens((atuais) => juntar(atuais, c.mensagens));
          avisarQueLeu();
        }
      })
      // Uma pergunta que falhou não merece aviso: a próxima tenta de novo.
      .catch(() => {});
  }, [username, ultimoId]);

  useRepetir(buscarNovas, 4_000, carregou && pessoa !== null);

  // Mensagem nova (enviada ou recebida): rola até ela.
  useEffect(() => {
    fim.current?.scrollIntoView({ block: "end" });
  }, [mensagens.length]);

  async function enviar(e?: FormEvent) {
    e?.preventDefault();
    const limpo = texto.trim();
    if (!limpo || enviando) return;
    setEnviando(true);
    setErro(null);
    try {
      const nova = await enviarMensagem(username, limpo);
      setMensagens((atuais) => juntar(atuais, [nova]));
      setTexto("");
    } catch (err) {
      setErro((err as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  // Enter envia; Shift+Enter quebra a linha, como nos apps de mensagem.
  function aoTeclar(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  }

  if (!liberado) return null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col">
      <Link href="/mensagens" className="text-sm text-tinta-suave hover:text-tinta">
        ← Mensagens
      </Link>

      {pessoa && (
        <Link href={`/u/${pessoa.username}`} className="mt-3 flex items-center gap-3 self-start hover:underline">
          <Avatar autor={pessoa} />
          <span>
            <span className="block font-semibold leading-tight">{pessoa.name}</span>
            <span className="block text-sm text-tinta-suave">@{pessoa.username}</span>
          </span>
        </Link>
      )}

      <div className="mt-4 empty:hidden">
        <AvisoErro texto={erro} />
      </div>

      {!carregou && (
        <div role="status" aria-label="Carregando a conversa" className="mt-4 h-64 animate-pulse rounded-xl bg-linha" />
      )}

      {pessoa && (
        <section
          aria-label={`Conversa com ${pessoa.name}`}
          className="mt-4 flex min-h-64 flex-col gap-2 rounded-xl border border-linha bg-superficie p-4"
        >
          {mensagens.length === 0 && (
            <p className="m-auto text-center text-sm text-tinta-suave">
              Nenhuma mensagem ainda.{podeResponder && " Que tal combinar uma sessão de estudo?"}
            </p>
          )}
          {mensagens.map((m) => (
            <div
              key={m.id}
              className={
                "max-w-[80%] rounded-2xl px-3.5 py-2 " +
                (m.minha
                  ? "self-end rounded-br-md bg-destaque text-sobre-destaque"
                  : "self-start rounded-bl-md bg-destaque-fundo text-tinta")
              }
            >
              <p className="whitespace-pre-line break-words">{m.texto}</p>
              <time
                dateTime={m.created_at}
                title={dataCompleta(m.created_at)}
                className="mt-0.5 block text-right font-numeros text-[11px] opacity-75"
              >
                {hora(m.created_at)}
              </time>
            </div>
          ))}
          <div ref={fim} />
        </section>
      )}

      {pessoa &&
        (podeResponder ? (
          <form onSubmit={enviar} className="mt-3 flex items-end gap-2">
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={aoTeclar}
              maxLength={MAX_TEXTO}
              rows={2}
              aria-label={`Mensagem para ${pessoa.name}`}
              placeholder="Escreva uma mensagem"
              className="flex-1 resize-none rounded-xl border border-linha bg-superficie px-3 py-2 text-tinta"
            />
            <button
              type="submit"
              disabled={!texto.trim() || enviando}
              className="rounded-xl bg-destaque px-4 py-2.5 font-semibold text-sobre-destaque disabled:opacity-50"
            >
              {enviando ? "Enviando..." : "Enviar"}
            </button>
          </form>
        ) : (
          // A regra da decisão 6, explicada, para não parecer que a tela quebrou.
          <p className="mt-3 rounded-xl bg-destaque-fundo p-3 text-center text-sm text-tinta-suave">
            As mensagens são só entre quem se segue mutuamente. Quando vocês se seguirem, dá para conversar
            aqui.
          </p>
        ))}
    </div>
  );
}
