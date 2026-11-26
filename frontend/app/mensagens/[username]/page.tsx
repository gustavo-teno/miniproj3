"use client";

// Uma conversa das DMs (#18, decisão 6). Ao abrir, vêm as últimas mensagens;
// depois, a cada 4 segundos com a aba à vista, a tela pergunta só pelas que
// chegaram depois da última que ela já tem (?depois_de=<id>).

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";

import { Avatar } from "@/components/Avatar";
import { BotaoEmoji, inserirNoCursor } from "@/components/BotaoEmoji";
import { AvisoErro } from "@/components/FormAuth";
import {
  buscarConversa,
  curtirMensagem,
  descurtirMensagem,
  enviarMensagem,
  type Autor,
  type CurtidaMensagem,
  type Mensagem,
} from "@/lib/api";
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

// Quem curtiu cada mensagem: eu, a outra pessoa ou os dois (#68).
type Curtidas = Record<number, { minha: boolean; outro: boolean }>;

function porMensagem(lista: CurtidaMensagem[]): Curtidas {
  const curtidas: Curtidas = {};
  for (const { mensagem_id, minha } of lista) {
    const atual = curtidas[mensagem_id] ?? { minha: false, outro: false };
    curtidas[mensagem_id] = minha ? { ...atual, minha: true } : { ...atual, outro: true };
  }
  return curtidas;
}

// Dois toques em até este tempo contam como "toque duplo".
const TOQUE_DUPLO_MS = 350;

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
  const [curtidas, setCurtidas] = useState<Curtidas>({});
  // As curtidas que a tela acabou de mudar e o backend ainda não confirmou: a
  // pergunta por novidades não as desfaz enquanto isso.
  const curtindo = useRef(new Set<number>());
  // O último toque num balão, para reconhecer o segundo.
  const ultimoToque = useRef({ id: 0, quando: 0 });
  const fim = useRef<HTMLDivElement>(null);
  const caixaTexto = useRef<HTMLTextAreaElement>(null);

  // O id da última mensagem que a tela tem, para pedir só as novas.
  const ultimoId = mensagens.at(-1)?.id;

  useEffect(() => {
    if (!liberado) return;
    buscarConversa(username)
      .then((c) => {
        setPessoa(c.pessoa);
        setPodeResponder(c.pode_responder);
        setMensagens(c.mensagens);
        setCurtidas(porMensagem(c.curtidas));
        avisarQueLeu();
      })
      .catch((e: Error) => setErro(e.message))
      .finally(() => setCarregou(true));
  }, [liberado, username]);

  const buscarNovas = useCallback(() => {
    buscarConversa(username, ultimoId ?? 0)
      .then((c) => {
        setPodeResponder(c.pode_responder);
        // As curtidas vêm todas, então substituem as da tela, menos as que
        // acabaram de ser mudadas aqui e ainda estão a caminho do backend.
        setCurtidas((atuais) => {
          const novas = porMensagem(c.curtidas);
          for (const id of curtindo.current) {
            if (atuais[id]) novas[id] = atuais[id];
            else delete novas[id];
          }
          return novas;
        });
        if (c.mensagens.length) {
          setMensagens((atuais) => juntar(atuais, c.mensagens));
          avisarQueLeu();
        }
      })
      // Uma pergunta que falhou não merece aviso: a próxima tenta de novo.
      .catch(() => {});
  }, [username, ultimoId]);

  useRepetir(buscarNovas, 4_000, carregou && pessoa !== null);

  // Mensagem nova (enviada ou recebida): rola até ela. Rola de novo quando o
  // carregamento termina: o bloco de "Carregando" sai da tela logo depois das
  // mensagens chegarem, e a página encolhe.
  useEffect(() => {
    fim.current?.scrollIntoView({ block: "end" });
  }, [mensagens.length, carregou]);

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

  // Põe ou tira o meu coração. Muda na hora e desfaz se o backend recusar,
  // como o curtir dos posts. Sem ser mútuos, só dá para tirar.
  async function alternarCurtida(id: number) {
    if (curtindo.current.has(id)) return;
    const antes = curtidas[id] ?? { minha: false, outro: false };
    if (!antes.minha && !podeResponder) return;
    const depois = { ...antes, minha: !antes.minha };
    setCurtidas((atuais) => ({ ...atuais, [id]: depois }));
    curtindo.current.add(id);
    try {
      if (antes.minha) await descurtirMensagem(id);
      else await curtirMensagem(id);
    } catch {
      setCurtidas((atuais) => ({ ...atuais, [id]: antes }));
    } finally {
      curtindo.current.delete(id);
    }
  }

  // Dois cliques (computador) ou dois toques (celular) no balão curtem. O
  // onClick serve para os dois: o "dblclick" não chega em todo celular.
  function tocarNoBalao(id: number) {
    const agora = Date.now();
    const anterior = ultimoToque.current;
    if (anterior.id === id && agora - anterior.quando < TOQUE_DUPLO_MS) {
      ultimoToque.current = { id: 0, quando: 0 };
      // O clique duplo do computador seleciona a palavra; aqui ele curte.
      window.getSelection()?.removeAllRanges();
      alternarCurtida(id);
    } else {
      ultimoToque.current = { id, quando: agora };
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
    <div className="mx-auto flex max-w-2xl flex-col lg:h-full lg:max-w-none">
      {/* O topo da conversa fica grudado no alto da tela, como nos apps de
          mensagem: por mais que a conversa seja longa, dá para ver com quem
          se fala e voltar sem rolar para cima. O -mx-6/px-6 estica o fundo
          até a borda da tela no celular (o <main> tem px-6). No computador, a
          conversa fica ao lado da lista (#91): o topo, as mensagens e a caixa
          de escrever cabem na coluna, e só as mensagens rolam. */}
      <header className="sticky top-0 z-20 -mx-6 -mt-6 flex items-center gap-2 border-b border-linha bg-fundo px-6 py-2.5 lg:static lg:m-0 lg:flex-none lg:bg-superficie lg:px-4 lg:py-3">
        <Link
          href="/mensagens"
          aria-label="Voltar para Mensagens"
          title="Mensagens"
          className="-ml-2 grid size-9 flex-none place-items-center rounded-full text-tinta-suave hover:bg-destaque-fundo hover:text-tinta lg:hidden"
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        {pessoa && (
          <Link href={`/u/${pessoa.username}`} className="flex min-w-0 items-center gap-3 hover:underline">
            <Avatar autor={pessoa} />
            <span className="min-w-0">
              <span className="block truncate font-semibold leading-tight">{pessoa.name}</span>
              <span className="block truncate text-sm text-tinta-suave">@{pessoa.username}</span>
            </span>
          </Link>
        )}
      </header>

      <div className="mt-4 empty:hidden lg:mx-4">
        <AvisoErro texto={erro} />
      </div>

      {!carregou && (
        <div role="status" aria-label="Carregando a conversa" className="mt-4 h-64 animate-pulse rounded-xl bg-linha lg:mx-4" />
      )}

      {pessoa && (
        <section
          aria-label={`Conversa com ${pessoa.name}`}
          className="mt-4 flex min-h-64 flex-col gap-2 rounded-xl border border-linha bg-superficie p-4 lg:m-0 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:rounded-none lg:border-0 lg:bg-transparent lg:px-6"
        >
          {mensagens.length === 0 && (
            <p className="m-auto text-center text-sm text-tinta-suave">
              Nenhuma mensagem ainda.{podeResponder && " Que tal combinar uma sessão de estudo?"}
            </p>
          )}
          {mensagens.map((m) => {
            const curtida = curtidas[m.id];
            const quantas = (curtida?.minha ? 1 : 0) + (curtida?.outro ? 1 : 0);
            return (
              <div
                key={m.id}
                onClick={() => tocarNoBalao(m.id)}
                title="Dois cliques para curtir"
                // touch-action: manipulation tira o zoom do toque duplo no celular.
                className={
                  "relative max-w-[80%] touch-manipulation rounded-2xl px-3.5 py-2 " +
                  (quantas ? "mb-3 " : "") +
                  (m.minha
                    ? "self-end rounded-br-md bg-destaque text-sobre-destaque"
                    : "self-start rounded-bl-md bg-destaque-fundo text-tinta")
                }
              >
                <p className="whitespace-pre-line break-words">{m.texto}</p>
                <time
                  dateTime={m.created_at}
                  title={dataCompleta(m.created_at)}
                  // No balão lavanda de quem escreveu, a hora vai sem transparência:
                  // com opacity-75 o branco dava contraste 3,65 (o mínimo é 4,5).
                  className={"mt-0.5 block text-right font-numeros text-[11px] " + (m.minha ? "" : "opacity-75")}
                >
                  {hora(m.created_at)}
                </time>
                {/* Para quem usa teclado ou leitor de tela: o toque duplo não
                    serve, então há um botão, que só aparece ao receber o foco. */}
                {(podeResponder || curtida?.minha) && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      alternarCurtida(m.id);
                    }}
                    className="sr-only focus:not-sr-only focus:mt-1 focus:block focus:text-xs focus:underline"
                  >
                    {curtida?.minha ? "Descurtir mensagem" : "Curtir mensagem"}
                  </button>
                )}
                {/* O coração fica no canto de baixo do balão, do lado de dentro
                    da conversa, como nos apps de mensagem. Com os dois, "2". */}
                {quantas > 0 && (
                  <span
                    aria-label={
                      curtida?.minha && curtida?.outro
                        ? "Vocês dois curtiram"
                        : curtida?.minha
                          ? "Você curtiu"
                          : `${pessoa.name} curtiu`
                    }
                    className={
                      "absolute -bottom-3 flex items-center gap-0.5 rounded-full border border-linha bg-superficie px-1.5 text-xs leading-5 text-tinta " +
                      (m.minha ? "left-2" : "right-2")
                    }
                  >
                    <span aria-hidden>❤️</span>
                    {quantas > 1 && <span aria-hidden className="font-numeros">{quantas}</span>}
                  </span>
                )}
              </div>
            );
          })}
          {/* A margem faz a última mensagem parar acima da caixa de escrever,
              que fica grudada no pé da tela. */}
          <div ref={fim} className="scroll-mb-28" />
        </section>
      )}

      {pessoa &&
        (podeResponder ? (
          // A caixa de escrever fica grudada no pé da tela, como o topo no alto.
          <form
            onSubmit={enviar}
            className="sticky bottom-0 z-20 -mx-6 -mb-6 mt-3 flex items-end gap-2 border-t border-linha bg-fundo px-6 pb-4 pt-3 lg:static lg:m-0 lg:flex-none lg:bg-superficie lg:px-4 lg:pb-3"
          >
            {/* O emoji à esquerda da caixa, como nos apps de mensagem. */}
            <div className="pb-1">
              <BotaoEmoji aoEscolher={(emoji) => setTexto(inserirNoCursor(caixaTexto.current, texto, emoji, MAX_TEXTO))} />
            </div>
            <textarea
              ref={caixaTexto}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={aoTeclar}
              maxLength={MAX_TEXTO}
              rows={2}
              aria-label={`Mensagem para ${pessoa.name}`}
              placeholder="Escreva uma mensagem"
              className="min-w-0 flex-1 resize-none rounded-xl border border-linha bg-superficie px-3 py-2 text-tinta"
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
          <p className="mt-3 rounded-xl bg-destaque-fundo p-3 text-center text-sm text-tinta-suave lg:m-4">
            As mensagens são só entre quem se segue mutuamente. Quando vocês se seguirem, dá para conversar
            aqui.
          </p>
        ))}
    </div>
  );
}
