"use client";

// Comentários (#12, Pessoa C). Dois pedaços:
// - <LinkComentarios post={post} /> vai no `rodape` do <CardPost>, ao lado do
//   <BotaoCurtir>, e leva para a página do post (/posts/{id}).
// - <Comentarios postId=... /> é a conversa, na página do post, dentro da folha
//   do post (CardPost `embaixo`): o campo para comentar vem logo embaixo do post,
//   e os comentários, do mais antigo para o mais novo, em caixinhas, com
//   "carregar mais".

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";

import { Avatar } from "@/components/Avatar";
import { apiGet, apiPost, type Comentario, type Page, type Post } from "@/lib/api";
import { dataCompleta, tempoDesde } from "@/lib/tempo";

// O mesmo limite do backend (schemas/comentario.py), para avisar antes de enviar.
const MAX_TEXTO = 500;
const POR_PAGINA = 20;

export function LinkComentarios({ post }: { post: Pick<Post, "id" | "comentarios"> }) {
  return (
    <Link href={`/posts/${post.id}`} className="flex items-center gap-1.5 hover:text-destaque">
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
        <path
          d="M4.5 18.5V6.8c0-1 .8-1.8 1.8-1.8h11.4c1 0 1.8.8 1.8 1.8v7.4c0 1-.8 1.8-1.8 1.8H8.2Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
      <span className="font-numeros">{post.comentarios}</span>
      <span className="sr-only">{post.comentarios === 1 ? "comentário" : "comentários"}</span>
    </Link>
  );
}

export function Comentarios({ postId }: { postId: number }) {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [total, setTotal] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  // A pessoa comentou antes de carregar a conversa toda (ver adicionar).
  const [enviadoNoFim, setEnviadoNoFim] = useState(false);

  const carregar = useCallback(
    async (offset: number) => {
      setCarregando(true);
      setErro(null);
      try {
        const pagina = await apiGet<Page<Comentario>>(
          `/posts/${postId}/comentarios?offset=${offset}&limit=${POR_PAGINA}`,
        );
        setComentarios((atuais) => (offset === 0 ? pagina.items : [...atuais, ...pagina.items]));
        setTotal(pagina.total);
        // Chegou ao fim: o comentário que a pessoa mandou já está na lista.
        if (offset + pagina.items.length >= pagina.total) setEnviadoNoFim(false);
      } catch {
        setErro("Não foi possível carregar os comentários.");
      } finally {
        setCarregando(false);
      }
    },
    [postId],
  );

  useEffect(() => {
    carregar(0);
  }, [carregar]);

  function adicionar(novo: Comentario) {
    setTotal((t) => t + 1);
    // O novo é o mais recente, então o lugar dele é o fim da conversa. Se ainda
    // faltam comentários para carregar, ele não entra agora: o "carregar mais"
    // pede a partir de quantos a tela tem, e um a mais faria pular o próximo
    // do servidor e repetir o novo. Ele chega no fim, com a última página.
    if (comentarios.length < total) {
      setEnviadoNoFim(true);
      return;
    }
    setComentarios((atuais) => [...atuais, novo]);
  }

  return (
    <section aria-label="Comentários">
      <h2 className="text-sm font-semibold text-tinta-suave">
        {total === 1 ? "1 comentário" : `${total} comentários`}
      </h2>

      {/* A caixa de comentar fica logo embaixo do post, como no Twitter. */}
      <FormComentario postId={postId} onComentou={adicionar} />

      {enviadoNoFim && (
        <p className="mt-3 text-sm text-tinta-suave">
          Comentário enviado. Ele aparece no fim da conversa, depois dos que faltam carregar.
        </p>
      )}

      {comentarios.length > 0 && (
        <ul className="mt-5 space-y-4">
          {comentarios.map((c) => (
            // Cada comentário é uma caixinha com uma fitinha no topo, como um papel
            // colado na folha do post.
            <li
              key={c.id}
              className="relative flex gap-3 rounded-xl border border-linha bg-superficie px-3 py-2.5 before:absolute before:-top-1.5 before:left-3.5 before:h-3 before:w-11 before:rounded-[3px] before:bg-[color-mix(in_srgb,var(--destaque)_16%,var(--superficie))]"
            >
              <Avatar autor={c.autor} />
              <div className="min-w-0 flex-1">
                <p className="flex items-baseline gap-2 text-sm">
                  <Link href={`/u/${c.autor.username}`} className="truncate font-semibold hover:underline">
                    {c.autor.name}
                  </Link>
                  <time
                    dateTime={c.created_at}
                    title={dataCompleta(c.created_at)}
                    suppressHydrationWarning
                    className="flex-none text-tinta-suave"
                  >
                    {tempoDesde(c.created_at)}
                  </time>
                </p>
                <p className="mt-0.5 whitespace-pre-line break-words font-light">{c.texto}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!carregando && !erro && total === 0 && (
        <p className="mt-4 text-sm text-tinta-suave">Ninguém comentou ainda. Que tal uma dica ou um incentivo?</p>
      )}
      {erro && <p className="mt-4 text-sm text-erro">{erro}</p>}

      {comentarios.length < total && (
        <button
          type="button"
          onClick={() => carregar(comentarios.length)}
          disabled={carregando}
          className="mt-4 w-full rounded-lg border border-linha px-4 py-2 text-sm text-destaque hover:bg-destaque-fundo disabled:opacity-60"
        >
          {carregando ? "Carregando..." : "Carregar mais comentários"}
        </button>
      )}
    </section>
  );
}

function FormComentario({ postId, onComentou }: { postId: number; onComentou: (c: Comentario) => void }) {
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const campo = useRef<HTMLTextAreaElement>(null);

  // O campo cresce com o texto (uma linha, no começo) e volta ao tamanho de uma
  // linha depois de enviar.
  function ajustarAltura() {
    const el = campo.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }
  useEffect(ajustarAltura, [texto]);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (!texto.trim()) return;
    setEnviando(true);
    setErro(null);
    try {
      const novo = await apiPost<Comentario>(`/posts/${postId}/comentarios`, { texto: texto.trim() });
      onComentou(novo);
      setTexto("");
    } catch (falha) {
      // O texto fica no campo: ninguém perde o que escreveu por causa de um erro.
      setErro(falha instanceof Error ? falha.message : "Não foi possível comentar. Tente de novo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="mt-3">
      <div className="flex items-end gap-2 rounded-xl border border-destaque/40 bg-superficie p-2 pl-3">
        <label htmlFor="comentario" className="sr-only">
          Escreva um comentário
        </label>
        <textarea
          id="comentario"
          ref={campo}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          maxLength={MAX_TEXTO}
          required
          rows={1}
          placeholder="Escreva um comentário"
          className="max-h-40 min-w-0 flex-1 resize-none bg-transparent py-1 text-sm text-tinta outline-none placeholder:text-tinta-suave"
        />
        <button
          type="submit"
          disabled={enviando || !texto.trim()}
          className="flex-none rounded-full bg-destaque px-4 py-1.5 text-sm font-semibold text-sobre-destaque disabled:opacity-60"
        >
          {enviando ? "Enviando..." : "Comentar"}
        </button>
      </div>
      {erro && <p className="mt-2 text-sm text-erro">{erro}</p>}
    </form>
  );
}
