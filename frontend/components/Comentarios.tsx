"use client";

// Comentários (#12, Pessoa C). Dois pedaços:
// - <LinkComentarios post={post} /> vai no `rodape` do <CardPost>, ao lado do
//   <BotaoCurtir>, e leva para a página do post (/posts/{id}).
// - <Comentarios postId=... /> é a conversa, na página do post: do mais antigo
//   para o mais novo, com "carregar mais" e o campo para comentar no fim.

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";

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
    <section aria-label="Comentários" className="rounded-2xl border border-linha bg-superficie">
      <h2 className="border-b border-linha px-4 py-3 font-semibold">
        {total === 1 ? "1 comentário" : `${total} comentários`}
      </h2>

      {comentarios.length > 0 && (
        <ul>
          {comentarios.map((c) => (
            <li key={c.id} className="flex gap-3 border-b border-linha px-4 py-3">
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
        <p className="px-4 py-3 text-sm text-tinta-suave">Ninguém comentou ainda. Que tal uma dica ou um incentivo?</p>
      )}
      {erro && <p className="px-4 py-3 text-sm text-erro">{erro}</p>}

      {comentarios.length < total && (
        <button
          type="button"
          onClick={() => carregar(comentarios.length)}
          disabled={carregando}
          className="w-full border-b border-linha px-4 py-2 text-sm text-destaque hover:bg-destaque-fundo disabled:opacity-60"
        >
          {carregando ? "Carregando..." : "Carregar mais comentários"}
        </button>
      )}

      {enviadoNoFim && (
        <p className="px-4 pt-3 text-sm text-tinta-suave">
          Comentário enviado. Ele aparece no fim da conversa, depois dos que faltam carregar.
        </p>
      )}
      <FormComentario postId={postId} onComentou={adicionar} />
    </section>
  );
}

function FormComentario({ postId, onComentou }: { postId: number; onComentou: (c: Comentario) => void }) {
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

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
    <form onSubmit={enviar} className="space-y-2 p-4">
      <label htmlFor="comentario" className="sr-only">
        Escreva um comentário
      </label>
      <textarea
        id="comentario"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        maxLength={MAX_TEXTO}
        required
        rows={2}
        placeholder="Escreva um comentário"
        className="w-full resize-y rounded-lg border border-linha bg-superficie px-3 py-2 text-sm text-tinta"
      />
      {erro && <p className="text-sm text-erro">{erro}</p>}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={enviando || !texto.trim()}
          className="rounded-lg bg-destaque px-4 py-1.5 text-sm font-semibold text-sobre-destaque disabled:opacity-60"
        >
          {enviando ? "Enviando..." : "Comentar"}
        </button>
      </div>
    </form>
  );
}
