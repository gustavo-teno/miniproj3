"use client";

// A busca (#38, Pessoa A): achar um colega pelo nome ou um post sobre um
// assunto ("logaritmo", "redação nota 1000"), sem depender da meta, que é o
// que as Turmas usam. Duas abas, Pessoas e Posts, sem diferença de acento nem
// de maiúscula. A busca espera a pessoa parar de digitar.

import Link from "next/link";
import { useEffect, useState } from "react";

import { Avatar } from "@/components/Avatar";
import { BotaoCurtir } from "@/components/BotaoCurtir";
import { BotaoSalvar } from "@/components/BotaoSalvar";
import { CardPost } from "@/components/CardPost";
import { LinkComentarios } from "@/components/Comentarios";
import { AvisoErro } from "@/components/FormAuth";
import { buscarPessoas, buscarPosts, type Page, type Post, type User } from "@/lib/api";
import { useExigeLogin } from "@/lib/useExigeLogin";

type Aba = "pessoas" | "posts";

// O backend só busca a partir de 2 letras: com uma, quase tudo bateria.
const MINIMO = 2;
// Quanto esperar depois da última tecla: digitando "logaritmo", vai um pedido
// só, e não nove.
const ESPERA_MS = 300;

export default function BuscaPage() {
  const liberado = useExigeLogin();
  const [texto, setTexto] = useState("");
  const [aba, setAba] = useState<Aba>("pessoas");
  // As duas buscas e o termo que as gerou, para não mostrar o resultado de
  // uma busca velha como se fosse da atual. As duas saem juntas para cada aba
  // mostrar quantos resultados tem (#129).
  const [resultado, setResultado] = useState<{
    termo: string;
    pessoas: Page<User>;
    posts: Page<Post>;
  } | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const termo = texto.trim();

  useEffect(() => {
    if (termo.length < MINIMO) return;
    let ativo = true;
    const relogio = setTimeout(() => {
      Promise.all([buscarPessoas(termo), buscarPosts(termo)])
        .then(([pessoas, posts]) => {
          if (!ativo) return;
          setResultado({ termo, pessoas, posts });
          setErro(null);
          // A aba aberta veio vazia e a outra não: abre a que tem resultado.
          // Antes, "genetica" abria em Pessoas dizendo "Nada encontrado",
          // com 7 posts esperando na outra aba. Só no resultado de um termo
          // novo: depois disso, a aba que a pessoa clica é a que vale.
          setAba((agora) => {
            const vazia = (agora === "pessoas" ? pessoas : posts).total === 0;
            const outra = agora === "pessoas" ? "posts" : "pessoas";
            const outraTem = (outra === "pessoas" ? pessoas : posts).total > 0;
            return vazia && outraTem ? outra : agora;
          });
        })
        .catch((e: Error) => ativo && setErro(e.message));
    }, ESPERA_MS);
    // Tecla nova antes do tempo: cancela a busca que ia sair.
    return () => {
      ativo = false;
      clearTimeout(relogio);
    };
  }, [termo]);

  if (!liberado) return null;

  const daBusca = resultado?.termo === termo ? resultado : null;
  // Só a aba aberta aparece embaixo, com o mesmo formato de antes.
  const atual = daBusca ? (aba === "pessoas" ? { pessoas: daBusca.pessoas } : { posts: daBusca.posts }) : null;
  const total = atual?.pessoas?.total ?? atual?.posts?.total;

  // Quantos resultados cada aba tem, ao lado do nome dela.
  const contagem = (pagina?: Page<unknown>) =>
    pagina ? <span className="font-numeros"> · {pagina.total}</span> : null;

  const estiloAba = (ativa: boolean) =>
    "border-b-[3px] px-1 py-2 text-[15px] " +
    (ativa ? "border-destaque font-semibold text-destaque" : "border-transparent text-tinta-suave hover:text-tinta");

  return (
    <div className="mx-auto max-w-2xl lg:max-w-none">
      {/* No computador a página abre para duas colunas de cards; cada card continua com
        uma largura boa para ler (#84). */}
      <h1 className="text-2xl font-semibold">Buscar</h1>

      <input
        type="search"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        autoFocus
        maxLength={100}
        aria-label="O que você procura"
        placeholder="Buscar pessoas ou posts"
        className="mt-4 w-full rounded-xl border border-linha bg-superficie px-4 py-3 text-tinta"
      />

      <div role="tablist" aria-label="O que buscar" className="mt-3 flex gap-6 border-b border-linha">
        <button type="button" role="tab" aria-selected={aba === "pessoas"} onClick={() => setAba("pessoas")} className={estiloAba(aba === "pessoas")}>
          Pessoas{contagem(daBusca?.pessoas)}
        </button>
        <button type="button" role="tab" aria-selected={aba === "posts"} onClick={() => setAba("posts")} className={estiloAba(aba === "posts")}>
          Posts{contagem(daBusca?.posts)}
        </button>
      </div>

      <div className="mt-4 empty:hidden">
        <AvisoErro texto={erro} />
      </div>

      {termo.length < MINIMO ? (
        <p className="mt-6 text-center text-sm text-tinta-suave">
          Digite pelo menos {MINIMO} letras. Acento e maiúscula não fazem diferença.
        </p>
      ) : !atual ? (
        !erro && <div role="status" aria-label="Buscando" className="mt-4 h-32 animate-pulse rounded-xl bg-linha" />
      ) : total === 0 ? (
        <p className="mt-6 text-center text-sm text-tinta-suave">
          Nada encontrado para “{termo}”{aba === "pessoas" ? " entre as pessoas" : " nos posts"}.
        </p>
      ) : (
        <>
          {/* O número avisa quem usa leitor de tela que o resultado mudou. */}
          <p role="status" className="mt-4 text-sm text-tinta-suave">
            {total === 1 ? "1 resultado" : `${total} resultados`}
            {(atual.pessoas ?? atual.posts)!.items.length < total! && ", mostrando os primeiros"}
          </p>
          {atual.pessoas && (
            <div className="mt-2 overflow-hidden rounded-xl border border-linha bg-superficie lg:grid lg:grid-cols-2 lg:gap-3 lg:overflow-visible lg:border-0 lg:bg-transparent">
              {atual.pessoas.items.map((u) => (
                <Link
                  key={u.id}
                  href={`/u/${u.username}`}
                  className="flex items-center gap-3 border-b border-linha p-4 last:border-b-0 hover:bg-destaque-fundo lg:rounded-xl lg:border lg:bg-superficie lg:last:border-b"
                >
                  <Avatar autor={u} />
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{u.name}</span>
                    <span className="block truncate text-sm text-tinta-suave">
                      @{u.username}
                      {u.bio && ` · ${u.bio}`}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          )}
          {/* Os posts ficam soltos, como no feed: cada um já é uma folha com
              a própria borda (#52). */}
          {atual.posts && (
            <div className="mt-2 space-y-4 lg:grid lg:grid-cols-2 lg:items-start lg:gap-4 lg:space-y-0">
              {atual.posts.items.map((p) => (
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
        </>
      )}
    </div>
  );
}
