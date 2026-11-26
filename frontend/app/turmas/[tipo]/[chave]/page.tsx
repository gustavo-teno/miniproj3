"use client";

// A página de uma turma (#17, Pessoa D; decisão 5): quem está nela, com o
// botão de seguir (aba Chamada), e o que essas pessoas postaram, com filtro
// por matéria (aba Posts). Toda turma é aberta para qualquer pessoa olhar.

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { BotaoCurtir } from "@/components/BotaoCurtir";
import { BotaoSalvar } from "@/components/BotaoSalvar";
import { CardPost } from "@/components/CardPost";
import { EsqueletoPosts } from "@/components/EsqueletoPosts";
import { LinkComentarios } from "@/components/Comentarios";
import { AvisoErro } from "@/components/FormAuth";
import { CartaoMembro } from "@/components/turmas/CartaoMembro";
import { resumoDaTurma } from "@/components/turmas/CartaoTurma";
import {
  buscarEu,
  buscarMembros,
  buscarPostsDaTurma,
  buscarTurma,
  type Membro,
  type Post,
  type TipoTurma,
  type Turma,
} from "@/lib/api";
import { useOpcoes } from "@/lib/opcoes";
import { useExigeLogin } from "@/lib/useExigeLogin";

type Aba = "chamada" | "posts";

export default function TurmaPage() {
  const liberado = useExigeLogin();
  const { tipo, chave } = useParams<{ tipo: string; chave: string }>();
  // Endereço com outro tipo (ex.: /turmas/escola/x) não é turma.
  const tipoTurma: TipoTurma | null = tipo === "vestibular" || tipo === "curso" ? tipo : null;
  const [turma, setTurma] = useState<Turma | null>(null);
  const [eu, setEu] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [aba, setAba] = useState<Aba>("chamada");

  useEffect(() => {
    if (!liberado || !tipoTurma) return;
    buscarTurma(tipoTurma, decodeURIComponent(chave))
      .then(setTurma)
      .catch((e: Error) => setErro(e.message));
    buscarEu()
      .then((e) => setEu(e.username))
      .catch(() => {});
  }, [liberado, tipoTurma, chave]);

  if (!liberado) return null;

  const estiloAba = (ativa: boolean) =>
    "border-b-[3px] px-1 py-2 text-[15px] " +
    (ativa ? "border-destaque font-semibold text-destaque" : "border-transparent text-tinta-suave hover:text-tinta");

  return (
    <div className="mx-auto max-w-2xl lg:max-w-none">
      <Link href="/turmas" className="text-sm text-tinta-suave hover:text-tinta">
        ← Todas as turmas
      </Link>

      <div className="mt-3 empty:hidden">
        <AvisoErro texto={tipoTurma ? erro : "Turma não encontrada."} />
      </div>

      {tipoTurma && !turma && !erro && (
        <div role="status" aria-label="Carregando a turma" className="mt-3 h-24 animate-pulse rounded-xl bg-linha" />
      )}

      {turma && (
        <>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-tinta-suave">
            {turma.tipo === "vestibular" ? "Vestibular" : "Curso"}
          </p>
          <h1 className="text-2xl font-semibold">Turma {turma.nome}</h1>
          <p className="mt-1 text-sm text-tinta-suave">{resumoDaTurma(turma)}</p>

          <div role="tablist" aria-label="O que ver na turma" className="mt-4 flex gap-6 border-b border-linha">
            <button type="button" role="tab" aria-selected={aba === "chamada"} onClick={() => setAba("chamada")} className={estiloAba(aba === "chamada")}>
              Chamada
            </button>
            <button type="button" role="tab" aria-selected={aba === "posts"} onClick={() => setAba("posts")} className={estiloAba(aba === "posts")}>
              Posts
            </button>
          </div>

          {aba === "chamada" ? (
            <AbaChamada tipo={turma.tipo} chave={turma.chave} eu={eu} />
          ) : (
            <AbaPosts tipo={turma.tipo} chave={turma.chave} />
          )}
        </>
      )}
    </div>
  );
}

const MEMBROS_POR_PAGINA = 50;
const POSTS_POR_PAGINA = 20;

// Quem está na turma, em ordem de nome, com o botão de seguir.
function AbaChamada({ tipo, chave, eu }: { tipo: TipoTurma; chave: string; eu: string | null }) {
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

  return (
    <>
      <div className="mt-4 empty:hidden">
        <AvisoErro texto={erro} />
      </div>

      {membros === undefined && !erro && (
        <div role="status" aria-label="Carregando a chamada" className="mt-4 h-40 animate-pulse rounded-xl bg-linha" />
      )}

      {membros?.length === 0 && (
        <p className="mt-6 text-center text-sm text-tinta-suave">
          Ninguém escolheu essa meta ainda. Quem escolher entra aqui.
        </p>
      )}

      {membros && membros.length > 0 && (
        <ul className="mt-4 overflow-hidden rounded-xl border border-linha bg-superficie lg:grid lg:grid-cols-2 lg:gap-3 lg:overflow-visible lg:border-0 lg:bg-transparent">
          {membros.map((m) => (
            <li key={m.id} className="border-b border-linha last:border-b-0 lg:rounded-xl lg:border lg:bg-superficie lg:last:border-b">
              <CartaoMembro membro={m} tipo={tipo} chave={chave} opcoes={opcoes} souEu={m.username === eu} />
            </li>
          ))}
        </ul>
      )}

      {membros && membros.length < total && (
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

// O que as pessoas da turma postaram, do mais novo para o mais antigo, com
// filtro por matéria.
function AbaPosts({ tipo, chave }: { tipo: TipoTurma; chave: string }) {
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

  return (
    <>
      <label className="mt-4 flex items-center gap-2 text-sm">
        <span className="text-tinta-suave">Matéria</span>
        <select
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className="min-w-0 rounded-lg border border-linha bg-superficie px-3 py-1.5 text-tinta"
        >
          <option value="">Todas</option>
          {opcoes?.tags.map((t) => (
            <option key={t.valor} value={t.valor}>
              {t.nome}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-4 empty:hidden">
        <AvisoErro texto={erro} />
      </div>

      {posts === undefined && !erro && (
        <div className="mt-4">
          <EsqueletoPosts />
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
