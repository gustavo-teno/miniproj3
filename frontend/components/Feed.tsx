"use client";

// O feed (#16, Pessoa D): cronológico, só de quem você segue (decisão 3).
// O visual é o do rascunho da Camila (o "design 7", antes em /rascunho-feed):
// filtros de matéria à esquerda, o atalho de postar em cima e os posts soltos,
// cada um uma folha. Os filtros vão para a API, porque o feed é paginado.

import Link from "next/link";
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";

import { BotaoCurtir } from "@/components/BotaoCurtir";
import { BotaoSalvar } from "@/components/BotaoSalvar";
import { CardPost } from "@/components/CardPost";
import { LinkComentarios } from "@/components/Comentarios";
import { AvisoErro } from "@/components/FormAuth";
import { FormPost } from "@/components/FormPost";
import { SimboloMateria } from "@/components/SimboloMateria";
import { buscarEu, buscarFeed, type Opcao, type Post } from "@/lib/api";
import { estiloDaTag } from "@/lib/materias";
import { useOpcoes } from "@/lib/opcoes";

const POR_PAGINA = 20;
const BATE_PAPO = "bate-papo";

export function Feed() {
  // As matérias de GET /opcoes, sem o bate-papo (ele tem o botão próprio).
  const opcoes = useOpcoes();
  const materiasDaLista = opcoes?.tags.filter((t) => t.valor !== BATE_PAPO) ?? [];

  // As matérias marcadas. Lista vazia = "Tudo".
  const [materias, setMaterias] = useState<string[]>([]);
  const [esconderBatePapo, setEsconderBatePapo] = useState(false);

  // undefined = carregando a primeira página.
  const [posts, setPosts] = useState<Post[] | undefined>(undefined);
  const [total, setTotal] = useState(0);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  // Para o aviso depois de postar, com o link do diário.
  const [eu, setEu] = useState<string | null>(null);
  const [acabouDePostar, setAcabouDePostar] = useState(false);

  // Cada troca de filtro recomeça da primeira página. Se a pessoa trocar de
  // novo antes da resposta chegar, a resposta velha é ignorada.
  const pedido = useRef(0);
  useEffect(() => {
    const meu = ++pedido.current;
    setPosts(undefined);
    setErro(null);
    buscarFeed({ materias, esconderBatePapo }, 0, POR_PAGINA)
      .then((pagina) => {
        if (meu !== pedido.current) return;
        setPosts(pagina.items);
        setTotal(pagina.total);
      })
      .catch(() => meu === pedido.current && setErro("Não foi possível carregar o feed. Tente de novo."));
  }, [materias, esconderBatePapo]);

  useEffect(() => {
    buscarEu()
      .then((e) => setEu(e.username))
      .catch(() => {});
  }, []);

  async function carregarMais() {
    if (!posts || carregandoMais) return;
    const meu = pedido.current;
    setCarregandoMais(true);
    try {
      const pagina = await buscarFeed({ materias, esconderBatePapo }, posts.length, POR_PAGINA);
      if (meu !== pedido.current) return; // o filtro mudou no meio
      setPosts([...posts, ...pagina.items]);
      setTotal(pagina.total);
      setErro(null);
    } catch {
      setErro("Não foi possível carregar mais posts. Tente de novo.");
    } finally {
      setCarregandoMais(false);
    }
  }

  const filtrado = materias.length > 0 || esconderBatePapo;

  return (
    <div className="grid gap-4 lg:grid-cols-[248px_1fr] lg:items-start">
      <Filtros
        lista={materiasDaLista}
        materias={materias}
        setMaterias={setMaterias}
        esconderBatePapo={esconderBatePapo}
        setEsconderBatePapo={setEsconderBatePapo}
      />

      <div className="min-w-0 space-y-4">
        {/* O próprio post não entra no feed (só quem você segue, decisão 3):
            o aviso diz onde ele ficou, em vez de ele sumir ao recarregar. */}
        <FormPost onPostado={() => setAcabouDePostar(true)} />
        {acabouDePostar && (
          <p role="status" className="rounded-lg bg-destaque-fundo p-3 text-sm text-tinta">
            Postado. Seus posts ficam no{" "}
            {eu ? (
              <Link href={`/u/${eu}`} className="font-semibold text-destaque underline">
                seu diário
              </Link>
            ) : (
              "seu diário"
            )}
            ; o feed mostra quem você segue.
          </p>
        )}

        <AvisoErro texto={erro} />

        {posts === undefined && !erro && (
          <div role="status" aria-label="Carregando o feed" className="h-40 animate-pulse rounded-xl bg-linha" />
        )}

        {posts?.length === 0 &&
          (filtrado ? (
            <p className="rounded-2xl border border-linha bg-superficie p-6 text-sm text-tinta-suave">
              Nenhum post com esses filtros por enquanto.
            </p>
          ) : (
            // Feed vazio: convite para a turma (decisão 3), onde está quem
            // tem a mesma meta para seguir.
            <div className="rounded-2xl border border-linha bg-superficie p-6 text-center">
              <p className="font-semibold">Seu feed ainda está vazio</p>
              <p className="mx-auto mt-1 max-w-md text-sm text-tinta-suave">
                Aqui aparecem os estudos de quem você segue. Na sua turma estão as pessoas com a mesma meta que
                você: comece seguindo algumas delas.
              </p>
              <Link
                href="/turmas"
                className="mt-4 inline-block rounded-lg bg-destaque px-4 py-2 text-sm font-semibold text-sobre-destaque"
              >
                Conhecer a sua turma
              </Link>
            </div>
          ))}

        {posts && posts.length > 0 && (
          <section aria-label="Posts" className="space-y-4">
            {posts.map((p) => (
              <CardPost
                key={p.id}
                post={p}
                rodape={
                  <>
                    <BotaoCurtir post={p} />
                    <LinkComentarios post={p} />
                    <BotaoSalvar post={p} />
                  </>
                }
              />
            ))}
          </section>
        )}

        {posts && posts.length < total && (
          <button
            type="button"
            onClick={carregarMais}
            disabled={carregandoMais}
            className="mx-auto block rounded-lg border border-linha px-4 py-2 text-sm font-semibold hover:bg-destaque-fundo disabled:opacity-60"
          >
            {carregandoMais ? "Carregando..." : "Carregar mais"}
          </button>
        )}
      </div>
    </div>
  );
}

// ---- filtros: do rascunho da Camila, com as matérias de GET /opcoes ----

type PropsFiltros = {
  lista: Opcao[];
  materias: string[];
  // Aceita uma função, para marcar a partir da lista mais recente (dois cliques
  // rápidos não se atropelam).
  setMaterias: Dispatch<SetStateAction<string[]>>;
  esconderBatePapo: boolean;
  setEsconderBatePapo: (v: boolean) => void;
};

// No computador, uma coluna à esquerda. No celular, um botão "Filtros" que
// abre uma caixa subindo do pé da tela, para não ocupar espaço em cima do feed.
function Filtros(props: PropsFiltros) {
  const caixa = useRef<HTMLDialogElement>(null);
  const { lista, materias, esconderBatePapo } = props;
  const nome = (valor: string) => lista.find((m) => m.valor === valor)?.nome ?? valor;

  // O que está ligado aparece no próprio botão, para a pessoa saber que o
  // feed está filtrado (senão parece que sumiram posts). Com mais de duas
  // matérias, só o número, para o botão não estourar a linha.
  const ligados = [
    ...(materias.length > 2 ? [`${materias.length} matérias`] : materias.map(nome)),
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
                  props.setMaterias([]);
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
  lista,
  materias,
  setMaterias,
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
      <h3 className="px-2.5 pb-1 text-sm font-semibold text-tinta-suave">Filtrar por matéria</h3>
      {/* No celular, duas colunas: as 13 matérias cabem sem rolar a caixa. */}
      <div className={grande ? "grid grid-cols-2 gap-0.5" : "flex flex-col gap-0.5"}>
        {/* "Tudo" desmarca as matérias; marcar qualquer uma desliga o "Tudo". */}
        <button type="button" aria-pressed={materias.length === 0} onClick={() => setMaterias([])} className={item(materias.length === 0)}>
          Tudo
        </button>
        {lista.map((m) => {
          const marcada = materias.includes(m.valor);
          // Clicar de novo desmarca; as outras marcadas continuam.
          const alternar = () =>
            setMaterias((atuais) =>
              atuais.includes(m.valor) ? atuais.filter((x) => x !== m.valor) : [...atuais, m.valor],
            );
          return (
            <button key={m.valor} type="button" aria-pressed={marcada} onClick={alternar} className={item(marcada)}>
              <span className="cor-materia-texto" style={estiloDaTag(m.valor)}>
                <SimboloMateria tag={m.valor} className="size-4" />
              </span>
              {m.nome}
            </button>
          );
        })}
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
