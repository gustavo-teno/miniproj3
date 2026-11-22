"use client";

// RASCUNHO do feed: filtros só por matéria à esquerda e o atalho de postar em
// cima da lista (o "design 7", escolhido em 22/11 no lugar do atalho preso no
// pé da tela). Usa as
// cores, fontes e símbolos de verdade, mas os posts são de mentira (nada vem
// da API). Quando o feed de verdade existir, ele segue este e a pasta sai.

import { useRef, useState } from "react";

import { SimboloMateria } from "@/components/SimboloMateria";
import { estiloDaTag } from "@/lib/materias";

// Os nomes ficam aqui só porque o rascunho não fala com o backend. No feed de
// verdade eles vêm de GET /opcoes (useOpcoes).
const MATERIAS = [
  { valor: "matematica", nome: "Matemática" },
  { valor: "fisica", nome: "Física" },
  { valor: "quimica", nome: "Química" },
  { valor: "biologia", nome: "Biologia" },
  { valor: "portugues", nome: "Português" },
  { valor: "literatura", nome: "Literatura" },
  { valor: "redacao", nome: "Redação" },
  { valor: "historia", nome: "História" },
  { valor: "geografia", nome: "Geografia" },
  { valor: "filosofia", nome: "Filosofia" },
  { valor: "sociologia", nome: "Sociologia" },
  { valor: "ingles", nome: "Inglês" },
  { valor: "espanhol", nome: "Espanhol" },
];
// O bate-papo é a tag dos posts que não são de uma matéria (decisão 2).
const BATE_PAPO = { valor: "bate-papo", nome: "Bate-papo" };
const NOMES: Record<string, string> = Object.fromEntries(
  [...MATERIAS, BATE_PAPO].map((m) => [m.valor, m.nome]),
);

type PostFalso = {
  id: number;
  autor: string;
  minutosAtras: number; // há quanto tempo foi postado
  tag: string;
  minutos?: number;
  texto: string;
  comentarios: number;
  curtidas: number;
};

const POSTS: PostFalso[] = [
  { id: 1, autor: "Maria Eduarda", minutosAtras: 25, tag: "biologia", minutos: 90,
    texto: "Revisei genética e fiz 20 questões de heredograma. Errei 6; amanhã refaço as de probabilidade.",
    comentarios: 4, curtidas: 12 },
  { id: 2, autor: "Caio Ramos", minutosAtras: 130, tag: "matematica", minutos: 135,
    texto: "Travei no tronco de cone, alguém tem uma dica de como visualizar?", comentarios: 9, curtidas: 7 },
  { id: 3, autor: "Bia Costa", minutosAtras: 190, tag: "redacao", minutos: 50,
    texto: "Comecem a redação pela proposta de intervenção, mudou tudo pra mim.", comentarios: 4, curtidas: 21 },
  { id: 4, autor: "Júlia Nogueira", minutosAtras: 245, tag: "bate-papo",
    texto: "Simulado amanhã cedo. Alguém mais vai dormir às 22h hoje pra ver se funciona?", comentarios: 15, curtidas: 21 },
  { id: 5, autor: "Pedro Lima", minutosAtras: 310, tag: "quimica", minutos: 60,
    texto: "Estequiometria finalmente fez sentido. Fiz a lista toda sem olhar o gabarito.", comentarios: 2, curtidas: 9 },
  { id: 6, autor: "Ana Clara", minutosAtras: 1600, tag: "historia", minutos: 45,
    texto: "Linha do tempo da Era Vargas num papel só, colada na parede. Ajuda demais.", comentarios: 3, curtidas: 14 },
];

// Há quanto tempo: com menos de 1 hora, só os minutos ("há 25min"); depois,
// só as horas, sem os minutos ("há 2h"); depois de um dia, os dias ("há 1d").
function tempoDesde(minutos: number) {
  if (minutos < 60) return `há ${minutos}min`;
  if (minutos < 24 * 60) return `há ${Math.floor(minutos / 60)}h`;
  return `há ${Math.floor(minutos / (24 * 60))}d`;
}

function duracao(minutos: number) {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return h ? `${h}h${m ? String(m).padStart(2, "0") : ""}` : `${m}min`;
}

export function FeedRascunho() {
  const [materia, setMateria] = useState<string | null>(null);
  const [esconderBatePapo, setEsconderBatePapo] = useState(false);

  const posts = POSTS.filter(
    (p) => (!materia || p.tag === materia) && !(esconderBatePapo && p.tag === "bate-papo"),
  );

  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-[248px_1fr] lg:items-start">
        <Filtros
          materia={materia}
          setMateria={setMateria}
          esconderBatePapo={esconderBatePapo}
          setEsconderBatePapo={setEsconderBatePapo}
        />

        <div className="min-w-0 space-y-3">
          <Postar />

          <section aria-label="Posts" className="overflow-hidden rounded-2xl border border-linha bg-superficie">
            {posts.length ? (
              posts.map((p) => <CardPost key={p.id} post={p} />)
            ) : (
              <p className="p-6 text-sm text-tinta-suave">Nenhum post dessa matéria por enquanto.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

// O atalho de postar: uma linha só (foto, caixa e botão). Ao clicar na caixa,
// ela abre para escrever e mostra a matéria (obrigatória) e os minutos.
function Postar() {
  const [aberto, setAberto] = useState(false);
  const [texto, setTexto] = useState("");
  const campo = "rounded-lg border border-linha bg-superficie px-2 py-1.5 text-sm text-tinta";

  if (!aberto) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-linha bg-superficie p-2 pl-3">
        <Avatar nome="Lara Andrade" />
        <button
          type="button"
          onClick={() => setAberto(true)}
          className="min-w-0 flex-1 truncate rounded-lg px-2 py-1.5 text-left text-tinta-suave hover:bg-fundo"
        >
          O que você estudou agora?
        </button>
        <button
          type="button"
          onClick={() => setAberto(true)}
          className="whitespace-nowrap rounded-lg bg-destaque px-3 py-1.5 text-sm font-semibold text-sobre-destaque"
        >
          Postar
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setTexto("");
        setAberto(false);
      }}
      className="space-y-2 rounded-2xl border border-destaque bg-superficie p-3"
    >
      <div className="flex gap-3">
        <Avatar nome="Lara Andrade" />
        <textarea
          autoFocus
          rows={2}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="O que você estudou agora?"
          aria-label="O que você estudou agora?"
          className="min-w-0 flex-1 resize-none bg-transparent py-1 font-light text-tinta outline-none placeholder:text-tinta-suave"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2 pl-11">
        <select required defaultValue="" aria-label="Matéria" className={campo}>
          <option value="" disabled>
            Matéria
          </option>
          {[...MATERIAS, BATE_PAPO].map((m) => (
            <option key={m.valor} value={m.valor}>
              {m.nome}
            </option>
          ))}
        </select>
        <input type="number" min={1} placeholder="min" aria-label="Minutos de estudo" className={campo + " w-20 font-numeros"} />
        <div className="ml-auto flex gap-2">
          <button type="button" onClick={() => setAberto(false)} className="rounded-lg px-3 py-1.5 text-sm text-tinta-suave hover:text-tinta">
            Cancelar
          </button>
          <button type="submit" className="rounded-lg bg-destaque px-3 py-1.5 text-sm font-semibold text-sobre-destaque">
            Postar
          </button>
        </div>
      </div>
    </form>
  );
}

type PropsFiltros = {
  materia: string | null;
  setMateria: (m: string | null) => void;
  esconderBatePapo: boolean;
  setEsconderBatePapo: (v: boolean) => void;
};

// Os filtros: as matérias e o "Esconder bate-papo". No computador ficam numa
// coluna à esquerda. No celular viram um botão "Filtros" que abre uma caixa
// subindo do pé da tela, para não ocupar espaço em cima do feed.
function Filtros(props: PropsFiltros) {
  const caixa = useRef<HTMLDialogElement>(null);
  const { materia, esconderBatePapo } = props;

  // O que está ligado aparece no próprio botão, para a pessoa saber que o
  // feed está filtrado (senão parece que sumiram posts).
  const ligados = [
    ...(materia ? [NOMES[materia]] : []),
    ...(esconderBatePapo ? ["sem bate-papo"] : []),
  ];

  return (
    <>
      <aside
        aria-label="Filtrar por matéria"
        className="hidden min-w-0 rounded-2xl border border-linha bg-superficie p-3 lg:sticky lg:top-4 lg:block"
      >
        <ListaFiltros {...props} />
      </aside>

      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => caixa.current?.showModal()}
          className={
            "flex max-w-full items-center gap-2 rounded-lg border px-3 py-1.5 text-sm " +
            (ligados.length
              ? "border-destaque bg-destaque-fundo font-semibold text-destaque"
              : "border-linha bg-superficie text-tinta")
          }
        >
          <Icone d="M3 5h18M6 12h12M10 19h4" />
          <span className="truncate">{["Filtros", ...ligados].join(" · ")}</span>
        </button>

        {/* <dialog> com showModal(): o navegador já cuida do fundo escuro, de
            prender o foco do teclado na caixa e de fechar com Esc. */}
        <dialog
          ref={caixa}
          aria-label="Filtros"
          onClick={(e) => e.target === caixa.current && caixa.current?.close()}
          className="m-0 mt-auto max-h-[85vh] w-full max-w-none rounded-t-2xl bg-superficie p-4 pb-6 text-tinta backdrop:bg-black/40"
        >
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">Filtros</h2>
            {ligados.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  props.setMateria(null);
                  props.setEsconderBatePapo(false);
                }}
                className="text-sm text-tinta-suave hover:text-tinta"
              >
                Limpar
              </button>
            )}
          </div>
          <ListaFiltros {...props} grande />
          <button
            type="button"
            onClick={() => caixa.current?.close()}
            className="mt-4 w-full rounded-lg bg-destaque py-2.5 font-semibold text-sobre-destaque"
          >
            Ver posts
          </button>
        </dialog>
      </div>
    </>
  );
}

// A lista em si, igual nos dois lugares. "grande" (celular) deixa cada item
// mais alto, mais fácil de tocar com o dedo, e põe as matérias em 2 colunas.
function ListaFiltros({
  materia,
  setMateria,
  esconderBatePapo,
  setEsconderBatePapo,
  grande = false,
}: PropsFiltros & { grande?: boolean }) {
  const altura = grande ? "py-2.5" : "py-1.5";
  const item = (ativo: boolean) =>
    `flex w-full items-center gap-2.5 whitespace-nowrap rounded-lg px-2.5 ${altura} text-left text-sm ` +
    (ativo ? "bg-destaque-fundo font-semibold text-destaque" : "text-tinta hover:bg-fundo");

  return (
    <>
      <h3 className="px-2.5 pb-1 text-sm font-semibold text-tinta-suave">Matéria</h3>
      {/* No celular, duas colunas: as 13 matérias cabem sem rolar a caixa. */}
      <div className={grande ? "grid grid-cols-2 gap-0.5" : "flex flex-col gap-0.5"}>
        <button type="button" aria-pressed={materia === null} onClick={() => setMateria(null)} className={item(materia === null)}>
          Tudo
        </button>
        {MATERIAS.map((m) => (
          <button
            key={m.valor}
            type="button"
            aria-pressed={materia === m.valor}
            onClick={() => setMateria(materia === m.valor ? null : m.valor)}
            className={item(materia === m.valor)}
          >
            <span className="cor-materia-texto" style={estiloDaTag(m.valor)}>
              <SimboloMateria tag={m.valor} className="size-4" />
            </span>
            {m.nome}
          </button>
        ))}
      </div>
      <div className="mt-2 border-t border-linha pt-2">
        <button
          type="button"
          role="switch"
          aria-checked={esconderBatePapo}
          onClick={() => setEsconderBatePapo(!esconderBatePapo)}
          className={`flex w-full items-center gap-2 whitespace-nowrap rounded-lg px-2.5 ${altura} text-left text-sm text-tinta-suave hover:bg-fundo`}
        >
          <SimboloMateria tag="bate-papo" className="size-4" />
          {/* min-w-0 + truncate: se a coluna ficar estreita, o texto encolhe
              em vez de empurrar o botão para fora da caixa. */}
          <span className="min-w-0 truncate">Esconder bate-papo</span>
          <span
            aria-hidden
            className={
              "ml-auto flex h-[18px] w-8 flex-none items-center rounded-full p-0.5 transition-colors " +
              (esconderBatePapo ? "justify-end bg-destaque" : "justify-start bg-tinta-suave")
            }
          >
            <span className="size-3.5 rounded-full bg-superficie" />
          </span>
        </button>
      </div>
    </>
  );
}

// Ícone de traço simples, no mesmo estilo dos da navegação.
function Icone({ d }: { d: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-4 flex-none" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round">
      <path d={d} />
    </svg>
  );
}

function CardPost({ post }: { post: PostFalso }) {
  return (
    <article className="flex gap-3 border-b border-linha p-4 last:border-b-0 sm:gap-4">
      <span className="cor-materia grid size-11 flex-none place-items-center rounded-xl" style={estiloDaTag(post.tag)}>
        <SimboloMateria tag={post.tag} className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="cor-materia-texto font-semibold" style={estiloDaTag(post.tag)}>
            {NOMES[post.tag]}
          </span>
          {post.minutos && <span className="font-numeros text-sm text-tinta-suave">{duracao(post.minutos)}</span>}
        </div>
        <p className="mt-1 flex items-center gap-2 text-sm">
          <Avatar nome={post.autor} pequeno />
          <span className="font-semibold">{post.autor}</span>
          <span className="text-tinta-suave">{tempoDesde(post.minutosAtras)}</span>
        </p>
        <p className="mt-1.5 font-light leading-relaxed">{post.texto}</p>
        <div className="mt-2 flex gap-6 text-sm text-tinta-suave">
          <span>{post.comentarios} comentários</span>
          <span>{post.curtidas} curtidas</span>
        </div>
      </div>
    </article>
  );
}

function Avatar({ nome, pequeno = false }: { nome: string; pequeno?: boolean }) {
  const iniciais = nome
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  return (
    <span
      aria-hidden
      className={
        "grid flex-none place-items-center rounded-full bg-destaque-fundo font-semibold text-destaque " +
        (pequeno ? "size-6 text-[10px]" : "size-8 text-xs")
      }
    >
      {iniciais}
    </span>
  );
}
