"use client";

// Os posts salvos (#64, Pessoa A): o que a pessoa guardou para rever depois,
// do salvo mais recente para o mais antigo. Só ela vê. Tirar um post dos
// salvos não o tira da tela na hora: assim dá para desfazer um clique errado.
// Ele some na próxima vez que a página abrir.

import { useEffect, useState } from "react";

import { BotaoCurtir } from "@/components/BotaoCurtir";
import { BotaoSalvar } from "@/components/BotaoSalvar";
import { CardPost } from "@/components/CardPost";
import { LinkComentarios } from "@/components/Comentarios";
import { AvisoErro } from "@/components/FormAuth";
import { buscarSalvos, type Post } from "@/lib/api";
import { useExigeLogin } from "@/lib/useExigeLogin";

const POR_PAGINA = 20;

export default function SalvosPage() {
  const liberado = useExigeLogin();
  // undefined = carregando a primeira página.
  const [posts, setPosts] = useState<Post[] | undefined>(undefined);
  const [total, setTotal] = useState(0);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!liberado) return;
    buscarSalvos(0, POR_PAGINA)
      .then((pagina) => {
        setPosts(pagina.items);
        setTotal(pagina.total);
      })
      .catch((e: Error) => setErro(e.message));
  }, [liberado]);

  async function verMais() {
    if (!posts || carregandoMais) return;
    setCarregandoMais(true);
    try {
      const pagina = await buscarSalvos(posts.length, POR_PAGINA);
      setPosts([...posts, ...pagina.items]);
      setTotal(pagina.total);
      setErro(null);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível carregar mais posts.");
    } finally {
      setCarregandoMais(false);
    }
  }

  if (!liberado) return null;

  return (
    <div className="mx-auto max-w-2xl lg:max-w-none">
      {/* Duas colunas de cards no computador (#84); no celular, uma só. */}
      <h1 className="text-2xl font-semibold">Salvos</h1>
      <p className="mt-1 text-sm text-tinta-suave">Só você vê os posts que salvou.</p>

      <div className="mt-4 empty:hidden">
        <AvisoErro texto={erro} />
      </div>

      {posts === undefined && !erro && (
        <div role="status" aria-label="Carregando os salvos" className="mt-4 h-40 animate-pulse rounded-xl bg-linha" />
      )}

      {posts?.length === 0 && (
        <div className="mt-4 rounded-xl border border-linha bg-superficie p-6 text-center">
          <p className="font-semibold">Nenhum post salvo ainda</p>
          {/* Diz onde fica o botão, para a pessoa saber como usar. */}
          <p className="mx-auto mt-1 max-w-md text-sm text-tinta-suave">
            Achou uma explicação boa ou uma lista de questões para refazer? Toque em Salvar embaixo dele (na busca
            ou na página do post) para guardar aqui.
          </p>
        </div>
      )}

      {/* Os posts ficam soltos, como no feed e na busca: cada um já é uma folha. */}
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
    </div>
  );
}
