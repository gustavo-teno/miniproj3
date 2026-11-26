"use client";

// Comentários (#12, Pessoa C). Dois pedaços:
// - <LinkComentarios post={post} /> vai no `rodape` do <CardPost>, ao lado do
//   <BotaoCurtir>, e leva para a página do post (/posts/{id}).
// - <Comentarios postId=... /> é a conversa, na página do post, dentro da folha
//   do post (CardPost `embaixo`): o campo para comentar vem logo embaixo do post,
//   e os comentários, do mais antigo para o mais novo, em caixinhas, com
//   "carregar mais". Cada comentário tem curtida e "Responder", e as respostas
//   ficam recuadas dentro da caixinha (comentários em árvore). Um comentário
//   com RECOLHER_A_PARTIR respostas ou mais mostra só "Ver conversa".
// - <ConversaDoComentario postId=... comentarioId=... /> é a tela "Ver
//   conversa" (/posts/{id}/comentarios/{comentarioId}): o comentário em
//   destaque, com todas as respostas dele.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";

import { Avatar } from "@/components/Avatar";
import { BotaoCurtir } from "@/components/BotaoCurtir";
import { apiGet, apiPost, type Comentario, type ComentarioPage, type Post } from "@/lib/api";
import { dataCompleta, tempoDesde } from "@/lib/tempo";

// O mesmo limite do backend (schemas/comentario.py), para avisar antes de enviar.
const MAX_TEXTO = 500;
const POR_PAGINA = 20;
// A partir de quantas respostas a conversa sai da página do post e vai para a
// tela dela, como no Twitter: a página do post continua curta.
const RECOLHER_A_PARTIR = 3;

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

// Põe a resposta nova embaixo do comentário que ela responde, no fim das
// respostas dele (a ordem é cronológica), em qualquer nível da árvore.
function pendurar(lista: Comentario[], nova: Comentario): Comentario[] {
  return lista.map((c) =>
    c.id === nova.parent_id
      ? { ...c, respostas: [...c.respostas, nova] }
      : { ...c, respostas: pendurar(c.respostas, nova) },
  );
}

// Do terceiro nível em diante as respostas não recuam mais (no celular o texto
// ficaria espremido): elas vêm numa lista só, cada uma dizendo a quem responde.
function achatar(c: Comentario): { comentario: Comentario; respondeA: string }[] {
  return c.respostas.flatMap((r) => [{ comentario: r, respondeA: c.autor.name }, ...achatar(r)]);
}

// Se o comentário de id `id` é este ou uma resposta dele, em qualquer nível.
function contem(c: Comentario, id: number): boolean {
  return c.id === id || c.respostas.some((r) => contem(r, id));
}

// Quantas respostas o comentário tem, em todos os níveis.
function contarRespostas(c: Comentario): number {
  return c.respostas.reduce((soma, r) => soma + 1 + contarRespostas(r), 0);
}

const CAIXINHA =
  "relative rounded-xl border bg-superficie px-3 py-2.5 before:absolute before:-top-1.5 before:left-3.5 before:h-3 before:w-11 before:rounded-[3px] before:bg-[color-mix(in_srgb,var(--destaque)_16%,var(--superficie))]";

export function Comentarios({ postId }: { postId: number }) {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  // `total` conta só os comentários diretos no post (é o que a página pagina);
  // `totalGeral` conta as respostas também, para o "N comentários".
  const [total, setTotal] = useState(0);
  const [totalGeral, setTotalGeral] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  // A pessoa comentou antes de carregar a conversa toda (ver adicionar).
  const [enviadoNoFim, setEnviadoNoFim] = useState(false);
  // O comentário cuja caixa de resposta está aberta (uma por vez).
  const [respondendo, setRespondendo] = useState<number | null>(null);
  const router = useRouter();

  const carregar = useCallback(
    async (offset: number) => {
      setCarregando(true);
      setErro(null);
      try {
        const pagina = await apiGet<ComentarioPage>(
          `/posts/${postId}/comentarios?offset=${offset}&limit=${POR_PAGINA}`,
        );
        setComentarios((atuais) => (offset === 0 ? pagina.items : [...atuais, ...pagina.items]));
        setTotal(pagina.total);
        setTotalGeral(pagina.total_com_respostas);
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
    setTotalGeral((t) => t + 1);
    // Uma resposta entra embaixo do comentário que ela responde, que já está na tela.
    if (novo.parent_id !== null) {
      setComentarios((atuais) => pendurar(atuais, novo));
      setRespondendo(null);
      // Se com ela a conversa passa a ser recolhida, a resposta sumiria da tela:
      // quem respondeu vai direto para a conversa, onde ela aparece.
      const raiz = comentarios.find((c) => contem(c, novo.parent_id!));
      if (raiz && contarRespostas(raiz) + 1 >= RECOLHER_A_PARTIR) {
        router.push(`/posts/${postId}/comentarios/${raiz.id}`);
      }
      return;
    }
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

  const conversa = { postId, respondendo, setRespondendo, onComentou: adicionar, recolher: true };

  return (
    <section aria-label="Comentários">
      <h2 className="text-sm font-semibold text-tinta-suave">
        {totalGeral === 1 ? "1 comentário" : `${totalGeral} comentários`}
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
            // colado na folha do post. As respostas ficam dentro dela.
            <li key={c.id} className={`${CAIXINHA} border-linha`}>
              <ItemComentario comentario={c} nivel={0} {...conversa} />
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

// A tela "Ver conversa": o comentário em destaque, com todas as respostas dele
// (nada recolhido), e o caminho de volta para a conversa do post.
export function ConversaDoComentario({ postId, comentarioId }: { postId: number; comentarioId: string }) {
  const [raiz, setRaiz] = useState<Comentario | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [respondendo, setRespondendo] = useState<number | null>(null);

  useEffect(() => {
    apiGet<Comentario>(`/posts/${postId}/comentarios/${comentarioId}`)
      .then(setRaiz)
      .catch((falha) =>
        setErro(falha instanceof Error ? falha.message : "Não foi possível carregar a conversa."),
      );
  }, [postId, comentarioId]);

  function adicionar(nova: Comentario) {
    setRaiz((atual) => (atual ? pendurar([atual], nova)[0] : atual));
    setRespondendo(null);
  }

  return (
    <section aria-label="Conversa">
      <Link href={`/posts/${postId}`} className="text-sm font-semibold text-destaque hover:underline">
        ← Todos os comentários
      </Link>
      {erro && <p className="mt-4 text-sm text-erro">{erro}</p>}
      {!raiz && !erro && <p className="mt-4 text-sm text-tinta-suave">Carregando...</p>}
      {raiz && (
        <>
          <h2 className="mt-3 text-sm font-semibold text-tinta-suave">
            {contarRespostas(raiz) === 1 ? "1 resposta" : `${contarRespostas(raiz)} respostas`}
          </h2>
          {/* O comentário da conversa fica em destaque, com a borda na cor do site. */}
          <div className={`${CAIXINHA} mt-4 border-destaque/50`}>
            <ItemComentario
              comentario={raiz}
              nivel={0}
              postId={postId}
              respondendo={respondendo}
              setRespondendo={setRespondendo}
              onComentou={adicionar}
              recolher={false}
            />
          </div>
        </>
      )}
    </section>
  );
}

type Conversa = {
  postId: number;
  respondendo: number | null;
  setRespondendo: (id: number | null) => void;
  onComentou: (c: Comentario) => void;
  // Na página do post, uma conversa grande vira o link "Ver conversa".
  recolher: boolean;
};

// Um comentário com a curtida, o "Responder" e as respostas dele. O nível 0 é o
// comentário direto no post; o 1, a resposta dele, recuada; do 2 em diante as
// respostas vêm numa lista só (achatar), sem recuar mais.
function ItemComentario({
  comentario: c,
  nivel,
  respondeA,
  ...conversa
}: Conversa & { comentario: Comentario; nivel: number; respondeA?: string }) {
  const { postId, respondendo, setRespondendo, onComentou, recolher } = conversa;
  const linkDaConversa = `/posts/${postId}/comentarios/${c.id}`;
  const quantas = contarRespostas(c);
  const recolhido = recolher && nivel === 0 && quantas >= RECOLHER_A_PARTIR;
  const respostas = recolhido
    ? []
    : nivel === 0
      ? c.respostas.map((r) => ({ comentario: r, respondeA: undefined }))
      : nivel === 1
        ? achatar(c)
        : [];

  return (
    <div>
      <div className="flex gap-3">
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
          {respondeA && <p className="text-xs text-tinta-suave">em resposta a {respondeA}</p>}
          <p className="mt-0.5 whitespace-pre-line break-words font-light">{c.texto}</p>

          <div className="mt-1.5 flex items-center gap-5 text-xs text-tinta-suave">
            <BotaoCurtir post={c} caminho={`/posts/${postId}/comentarios/${c.id}/curtir`} />
            <button
              type="button"
              onClick={() => setRespondendo(respondendo === c.id ? null : c.id)}
              aria-expanded={respondendo === c.id}
              className="font-semibold hover:text-destaque"
            >
              Responder
            </button>
            {recolhido && (
              <Link href={linkDaConversa} className="font-semibold text-destaque hover:underline">
                Ver conversa ({quantas} respostas)
              </Link>
            )}
          </div>

          {respondendo === c.id && (
            <FormComentario
              postId={postId}
              parentId={c.id}
              paraQuem={c.autor.name}
              onComentou={onComentou}
              onCancelar={() => setRespondendo(null)}
            />
          )}
        </div>
      </div>

      {/* As respostas ficam fora da coluna do texto: no celular, recuar também
          a largura da foto deixaria o texto espremido. */}
      {respostas.length > 0 && (
        // No celular, só o primeiro nível de respostas recua: as do terceiro
        // nível em diante ficam alinhadas a ele (o "em resposta a" já diz a
        // quem respondem). No computador, cada nível recua.
        <ul
          className={`mt-3 space-y-3 sm:ml-12 sm:border-l-2 sm:border-linha sm:pl-3 ${
            nivel === 0 ? "ml-4 border-l-2 border-linha pl-3" : ""
          }`}
        >
          {respostas.map(({ comentario, respondeA }) => (
            <li key={comentario.id}>
              <ItemComentario
                comentario={comentario}
                nivel={nivel + 1}
                respondeA={respondeA}
                {...conversa}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FormComentario({
  postId,
  onComentou,
  parentId,
  paraQuem,
  onCancelar,
}: {
  postId: number;
  onComentou: (c: Comentario) => void;
  // Para responder a um comentário: o id dele e o nome de quem escreveu.
  parentId?: number;
  paraQuem?: string;
  onCancelar?: () => void;
}) {
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const campo = useRef<HTMLTextAreaElement>(null);
  const resposta = parentId !== undefined;
  const rotulo = resposta ? `Responder a ${paraQuem}` : "Escreva um comentário";

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
      const novo = await apiPost<Comentario>(`/posts/${postId}/comentarios`, {
        texto: texto.trim(),
        parent_id: parentId ?? null,
      });
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
    <form onSubmit={enviar} className={resposta ? "mt-2" : "mt-3"}>
      <div className="flex items-end gap-2 rounded-xl border border-destaque/40 bg-superficie p-2 pl-3">
        <label htmlFor={`comentario-${parentId ?? "post"}`} className="sr-only">
          {rotulo}
        </label>
        <textarea
          id={`comentario-${parentId ?? "post"}`}
          ref={campo}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape" && onCancelar) onCancelar();
          }}
          maxLength={MAX_TEXTO}
          required
          rows={1}
          // Quem clicou em "Responder" já vai escrevendo.
          autoFocus={resposta}
          placeholder={rotulo}
          className="max-h-40 min-w-0 flex-1 resize-none bg-transparent py-1 text-sm text-tinta outline-none placeholder:text-tinta-suave"
        />
        {onCancelar && (
          <button
            type="button"
            onClick={onCancelar}
            className="flex-none px-2 py-1.5 text-sm text-tinta-suave hover:text-tinta"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={enviando || !texto.trim()}
          className="flex-none rounded-full bg-destaque px-4 py-1.5 text-sm font-semibold text-sobre-destaque disabled:opacity-60"
        >
          {enviando ? "Enviando..." : resposta ? "Responder" : "Comentar"}
        </button>
      </div>
      {erro && <p className="mt-2 text-sm text-erro">{erro}</p>}
    </form>
  );
}
