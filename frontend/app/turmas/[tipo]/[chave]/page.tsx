"use client";

// A página de uma turma (#17, Pessoa D; decisão 5; desenho "B · Folha", #94):
// o que as pessoas da turma postaram, com quem estudou hoje e o filtro por
// matéria (aba Posts), e quem está nela, numa chamada com o botão de seguir
// (aba Chamada). Toda turma é aberta para qualquer pessoa olhar.

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Avatar } from "@/components/Avatar";
import { BotaoCurtir } from "@/components/BotaoCurtir";
import { BotaoSalvar } from "@/components/BotaoSalvar";
import { CardPost } from "@/components/CardPost";
import { EsqueletoPosts } from "@/components/EsqueletoPosts";
import { LinkComentarios } from "@/components/Comentarios";
import { AvisoErro } from "@/components/FormAuth";
import { SimboloMateria } from "@/components/SimboloMateria";
import { CartaoMembro } from "@/components/turmas/CartaoMembro";
import { resumoDaTurma, useQuemEstudouHoje } from "@/components/turmas/CartaoTurma";
import {
  buscarEu,
  buscarMembros,
  buscarPostsDaTurma,
  buscarTurma,
  buscarTurmas,
  type Membro,
  type Post,
  type TipoTurma,
  type Turma,
} from "@/lib/api";
import { estiloDaTag } from "@/lib/materias";
import { useOpcoes } from "@/lib/opcoes";
import { useExigeLogin } from "@/lib/useExigeLogin";

type Aba = "posts" | "chamada";

export default function TurmaPage() {
  const liberado = useExigeLogin();
  const { tipo, chave } = useParams<{ tipo: string; chave: string }>();
  // Endereço com outro tipo (ex.: /turmas/escola/x) não é turma.
  const tipoTurma: TipoTurma | null = tipo === "vestibular" || tipo === "curso" ? tipo : null;
  const [turma, setTurma] = useState<Turma | null>(null);
  const [eu, setEu] = useState<string | null>(null);
  // As turmas de quem vê: dizem se esta é "sua turma" e qual é a sua dupla.
  const [minhas, setMinhas] = useState<Turma[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [aba, setAba] = useState<Aba>("posts");

  useEffect(() => {
    if (!liberado || !tipoTurma) return;
    buscarTurma(tipoTurma, decodeURIComponent(chave))
      .then(setTurma)
      .catch((e: Error) => setErro(e.message));
    buscarEu()
      .then((e) => setEu(e.username))
      .catch(() => {});
    buscarTurmas()
      .then((t) => setMinhas(t.minhas))
      .catch(() => {});
  }, [liberado, tipoTurma, chave]);

  if (!liberado) return null;

  const minha = turma !== null && minhas.some((t) => t.tipo === turma.tipo && t.chave === turma.chave);
  const meuVestibular = minhas.find((t) => t.tipo === "vestibular")?.chave ?? "";
  const meuCurso = minhas.find((t) => t.tipo === "curso")?.chave ?? "";

  const estiloAba = (ativa: boolean) =>
    "border-b-[3px] px-1 py-2 text-[15px] " +
    (ativa ? "border-destaque font-semibold text-destaque" : "border-transparent text-tinta-suave hover:text-tinta");

  return (
    <div className="mx-auto max-w-2xl lg:max-w-5xl">
      <Link href="/turmas" className="text-sm text-tinta-suave hover:text-tinta">
        ← Turmas
      </Link>

      <div className="mt-3 empty:hidden">
        <AvisoErro texto={tipoTurma ? erro : "Turma não encontrada."} />
      </div>

      {/* O cabeçalho da turma e, embaixo, as folhas dos posts: a turma abre na
          aba Posts, então a página já tem a cara dela enquanto carrega. */}
      {tipoTurma && !turma && !erro && (
        <>
          <div role="status" aria-label="Carregando a turma" className="mt-3 h-24 animate-pulse rounded-xl bg-linha" />
          <div className="mt-6">
            <EsqueletoPosts colunas />
          </div>
        </>
      )}

      {turma && (
        <>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            <h1 className="text-3xl font-semibold">Turma {turma.nome}</h1>
            {minha && (
              <span className="inline-flex items-center gap-1 rounded-full bg-destaque-fundo px-2.5 py-0.5 text-xs font-semibold text-destaque">
                <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path d="M12 21s-6-5.6-6-11a6 6 0 1 1 12 0c0 5.4-6 11-6 11Z" />
                  <circle cx="12" cy="10" r="2.2" />
                </svg>
                sua turma
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-tinta-suave">{resumoDaTurma(turma)}</p>

          <div role="tablist" aria-label="O que ver na turma" className="mt-4 flex gap-6 border-b border-linha">
            <button type="button" role="tab" aria-selected={aba === "posts"} onClick={() => setAba("posts")} className={estiloAba(aba === "posts")}>
              Posts
            </button>
            <button type="button" role="tab" aria-selected={aba === "chamada"} onClick={() => setAba("chamada")} className={estiloAba(aba === "chamada")}>
              Chamada · <span className="font-numeros">{turma.pessoas}</span>
            </button>
          </div>

          {aba === "posts" ? (
            <AbaPosts turma={turma} />
          ) : (
            <AbaChamada turma={turma} eu={eu} meuVestibular={meuVestibular} meuCurso={meuCurso} />
          )}
        </>
      )}
    </div>
  );
}

const MEMBROS_POR_PAGINA = 50;
const POSTS_POR_PAGINA = 20;

// Quem está na turma, numa chamada numerada, com o botão de seguir.
function AbaChamada({
  turma,
  eu,
  meuVestibular,
  meuCurso,
}: {
  turma: Turma;
  eu: string | null;
  meuVestibular: string;
  meuCurso: string;
}) {
  const { tipo, chave } = turma;
  const opcoes = useOpcoes();
  const [membros, setMembros] = useState<Membro[] | undefined>(undefined);
  const [total, setTotal] = useState(0);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    buscarMembros(tipo, chave, 0, MEMBROS_POR_PAGINA)
      .then((pagina) => {
        setMembros(pagina.items);
        setTotal(pagina.total);
      })
      .catch(() => setErro("Não foi possível carregar quem está na turma. Tente de novo."));
  }, [tipo, chave]);

  async function verMais() {
    if (!membros || carregandoMais) return;
    setCarregandoMais(true);
    try {
      const pagina = await buscarMembros(tipo, chave, membros.length, MEMBROS_POR_PAGINA);
      setMembros([...membros, ...pagina.items]);
      setTotal(pagina.total);
      setErro(null);
    } catch {
      setErro("Não foi possível carregar mais pessoas. Tente de novo.");
    } finally {
      setCarregandoMais(false);
    }
  }

  const presentes = turma.estudaram_hoje;

  return (
    <>
      <h2 className="mt-5 text-xs font-semibold uppercase tracking-wider text-tinta-suave">
        Chamada de hoje
        {presentes > 0 && ` · ${presentes} ${presentes === 1 ? "presente" : "presentes"}`}
      </h2>

      <div className="mt-2 empty:hidden">
        <AvisoErro texto={erro} />
      </div>

      {membros === undefined && !erro && (
        <div role="status" aria-label="Carregando a chamada" className="mt-2 h-40 animate-pulse rounded-xl bg-linha" />
      )}

      {membros?.length === 0 && (
        <p className="mt-6 text-center text-sm text-tinta-suave">
          Ninguém escolheu essa meta ainda. Quem escolher entra aqui.
        </p>
      )}

      {membros && membros.length > 0 && (
        <ol className="mt-2 divide-y divide-linha rounded-xl border border-linha bg-superficie px-3 sm:px-4">
          {membros.map((m, i) => (
            <li key={m.id}>
              <CartaoMembro
                membro={m}
                numero={i + 1}
                tipo={tipo}
                chave={chave}
                opcoes={opcoes}
                souEu={m.username === eu}
                mesmaDupla={
                  Boolean(meuVestibular && meuCurso) && m.vestibular === meuVestibular && m.curso === meuCurso
                }
              />
            </li>
          ))}
        </ol>
      )}

      {membros && membros.length < total && (
        <button
          type="button"
          onClick={verMais}
          disabled={carregandoMais}
          className="mt-3 text-sm font-semibold text-destaque hover:underline disabled:opacity-60"
        >
          {carregandoMais ? "Carregando..." : "Ver mais pessoas"}
        </button>
      )}
    </>
  );
}

// Quem da turma estudou hoje, com o anel verde: o mesmo da Chamada.
function EstudaramHoje({ turma }: { turma: Turma }) {
  const quem = useQuemEstudouHoje(turma, 12);
  if (!quem || quem.length === 0) return null;
  return (
    <section aria-labelledby="estudaram-hoje" className="mt-4 rounded-xl border border-linha bg-superficie p-4">
      <h2 id="estudaram-hoje" className="text-xs font-semibold uppercase tracking-wider text-tinta-suave">
        Estudaram hoje
      </h2>
      <ul className="mt-3 flex flex-wrap gap-3">
        {quem.map((m) => (
          <li key={m.id}>
            <Link
              href={`/u/${m.username}`}
              title={m.name}
              className="block rounded-full ring-2 ring-presenca ring-offset-2 ring-offset-superficie"
            >
              <Avatar autor={m} grande />
              <span className="sr-only">{m.name}</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-sm text-tinta-suave">
        <span className="font-numeros">{turma.estudaram_hoje}</span> de{" "}
        <span className="font-numeros">{turma.pessoas}</span> {turma.pessoas === 1 ? "pessoa" : "pessoas"}
      </p>
    </section>
  );
}

// O que as pessoas da turma postaram, do mais novo para o mais antigo, com
// filtro por matéria em etiquetas, nas cores de cada uma.
function AbaPosts({ turma }: { turma: Turma }) {
  const { tipo, chave } = turma;
  const opcoes = useOpcoes();
  const [tag, setTag] = useState("");
  const [posts, setPosts] = useState<Post[] | undefined>(undefined);
  const [total, setTotal] = useState(0);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Cada troca de matéria recomeça da primeira página; se a pessoa trocar de
  // novo antes da resposta chegar, a resposta velha é ignorada.
  const pedido = useRef(0);
  useEffect(() => {
    const meu = ++pedido.current;
    setPosts(undefined);
    setErro(null);
    buscarPostsDaTurma(tipo, chave, tag, 0, POSTS_POR_PAGINA)
      .then((pagina) => {
        if (meu !== pedido.current) return;
        setPosts(pagina.items);
        setTotal(pagina.total);
      })
      .catch(() => meu === pedido.current && setErro("Não foi possível carregar os posts da turma. Tente de novo."));
  }, [tipo, chave, tag]);

  async function verMais() {
    if (!posts || carregandoMais) return;
    const meu = pedido.current;
    setCarregandoMais(true);
    try {
      const pagina = await buscarPostsDaTurma(tipo, chave, tag, posts.length, POSTS_POR_PAGINA);
      if (meu !== pedido.current) return; // a matéria mudou no meio
      setPosts([...posts, ...pagina.items]);
      setTotal(pagina.total);
      setErro(null);
    } catch {
      setErro("Não foi possível carregar mais posts. Tente de novo.");
    } finally {
      setCarregandoMais(false);
    }
  }

  const chip = "inline-flex flex-none items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm font-semibold";

  return (
    <>
      <EstudaramHoje turma={turma} />

      {/* No celular as etiquetas rolam para o lado numa linha só; no
          computador, quebram em mais de uma linha. */}
      <div role="group" aria-label="Filtrar por matéria" className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1 pt-1 sm:flex-wrap">
        <button
          type="button"
          aria-pressed={tag === ""}
          onClick={() => setTag("")}
          className={chip + (tag === "" ? " bg-destaque text-sobre-destaque" : " border border-linha bg-superficie text-tinta-suave")}
        >
          Todas
        </button>
        {opcoes?.tags.map((t) => (
          <button
            key={t.valor}
            type="button"
            aria-pressed={tag === t.valor}
            onClick={() => setTag(tag === t.valor ? "" : t.valor)}
            style={estiloDaTag(t.valor)}
            className={
              chip +
              " cor-materia" +
              (tag === t.valor ? " ring-2 ring-destaque ring-offset-2 ring-offset-fundo" : " opacity-90 hover:opacity-100")
            }
          >
            <SimboloMateria tag={t.valor} className="size-3.5" />
            {t.nome}
          </button>
        ))}
      </div>

      <div className="mt-4 empty:hidden">
        <AvisoErro texto={erro} />
      </div>

      {posts === undefined && !erro && (
        <div className="mt-4">
          <EsqueletoPosts colunas />
        </div>
      )}

      {posts?.length === 0 && (
        <p className="mt-6 text-center text-sm text-tinta-suave">
          {tag ? "Ninguém da turma postou dessa matéria ainda." : "Ninguém da turma postou ainda."}
        </p>
      )}

      {/* Os posts ficam soltos, como no feed: cada um já é uma folha. */}
      {posts && posts.length > 0 && (
        <div className="mt-4 space-y-4 lg:grid lg:grid-cols-2 lg:items-start lg:gap-4 lg:space-y-0">
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
        </div>
      )}

      {posts && posts.length < total && (
        <button
          type="button"
          onClick={verMais}
          disabled={carregandoMais}
          className="mx-auto mt-4 block rounded-lg border border-linha px-4 py-2 text-sm font-semibold hover:bg-destaque-fundo disabled:opacity-60"
        >
          {carregandoMais ? "Carregando..." : "Ver mais"}
        </button>
      )}
    </>
  );
}
