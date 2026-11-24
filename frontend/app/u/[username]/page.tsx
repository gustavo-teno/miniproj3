"use client";

// O perfil-diário (#10, Pessoa B): /u/<username>. A mesma página serve para a
// dona do diário e para quem visita; o backend diz qual é o caso (meu_perfil).
//
// - Dona: coluna da direita presa ao rolar: postar, fogo e horas estudadas.
// - Quem visita: uma coluna só; o fogo vai para o topo e entra o "Seguir".

import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { CardPost } from "@/components/CardPost";
import { EditarPerfil } from "@/components/perfil/EditarPerfil";
import { EstanteCadernos } from "@/components/perfil/EstanteCadernos";
import { CaixaFogo, useOfensiva } from "@/components/perfil/FogoDoDiario";
import { HorasEstudadas } from "@/components/perfil/HorasEstudadas";
import { PostarNoDiario } from "@/components/perfil/PostarNoDiario";
import { TopoPerfil } from "@/components/perfil/TopoPerfil";
import { buscarPerfil, buscarPostsDoPerfil, type Perfil, type Post } from "@/lib/api";
import { useOpcoes } from "@/lib/opcoes";
import { useExigeLogin } from "@/lib/useExigeLogin";

export default function PaginaPerfil() {
  const liberado = useExigeLogin();
  const { username } = useParams<{ username: string }>();
  const opcoes = useOpcoes();

  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [aberto, setAberto] = useState<string | null>(null); // o caderno aberto; null = Todas
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [total, setTotal] = useState(0);
  const [carregandoMais, setCarregandoMais] = useState(false);
  // Muda a cada post novo: o fogo e as horas se recalculam.
  const [versao, setVersao] = useState(0);
  const [editando, setEditando] = useState(false);
  const ofensiva = useOfensiva(username, versao);
  // Erro ao buscar posts: aparece dentro da lista, sem esconder o perfil.
  const [erroPosts, setErroPosts] = useState<string | null>(null);

  // O caderno aberto "agora", para o verMais saber se a resposta ainda serve.
  const abertoAgora = useRef(aberto);
  abertoAgora.current = aberto;

  const carregarPerfil = useCallback(() => {
    return buscarPerfil(username)
      .then(setPerfil)
      .catch((e: Error) => setErro(e.message));
  }, [username]);

  // Trocou de pessoa sem sair da página (ex.: do seu diário para o de alguém):
  // começa do zero, em "Todas", em vez de mostrar o perfil anterior.
  useEffect(() => {
    setPerfil(null);
    setErro(null);
    setAberto(null);
  }, [username]);

  useEffect(() => {
    if (liberado) carregarPerfil();
  }, [liberado, carregarPerfil]);

  // Trocou de caderno (ou de pessoa): busca a primeira página daquele caderno.
  useEffect(() => {
    if (!liberado) return;
    let ativo = true;
    setPosts(null);
    setErroPosts(null);
    buscarPostsDoPerfil(username, aberto)
      .then((pagina) => {
        if (!ativo) return;
        setPosts(pagina.items);
        setTotal(pagina.total);
      })
      .catch((e: Error) => ativo && setErroPosts(e.message));
    return () => {
      ativo = false;
    };
  }, [liberado, username, aberto]);

  async function verMais() {
    if (!posts) return;
    const caderno = aberto;
    setCarregandoMais(true);
    setErroPosts(null);
    try {
      const pagina = await buscarPostsDoPerfil(username, caderno, posts.length);
      // Se a pessoa trocou de caderno enquanto carregava, esta página é de outro.
      if (caderno !== abertoAgora.current) return;
      setPosts((atuais) => [...(atuais ?? []), ...pagina.items]);
      setTotal(pagina.total);
    } catch (e) {
      setErroPosts(e instanceof Error ? e.message : "Não foi possível carregar mais posts.");
    } finally {
      setCarregandoMais(false);
    }
  }

  // Post novo: entra no topo se for do caderno aberto, e a estante recalcula.
  function aoPostar(post: Post) {
    if (aberto === null || post.tag === aberto) {
      setPosts((atuais) => [post, ...(atuais ?? [])]);
      setTotal((t) => t + 1);
    }
    carregarPerfil();
    setVersao((v) => v + 1);
  }

  if (!liberado) return null;
  if (erro && !perfil) {
    return (
      <p role="alert" className="rounded-lg border border-erro bg-erro-fundo p-3 text-sm text-erro">
        {erro}
      </p>
    );
  }
  if (!perfil) {
    return <div role="status" aria-label="Carregando o perfil" className="h-48 animate-pulse rounded-2xl bg-linha" />;
  }

  const eu = perfil.meu_perfil;
  const nomeDoCaderno = aberto ? (opcoes?.tags.find((t) => t.valor === aberto)?.nome ?? aberto) : null;
  const semNenhumPost = perfil.cadernos.length === 0;

  const acao = eu ? (
    // Abre a caixa de editar por cima do diário (combinado em 24/11).
    <button
      type="button"
      onClick={() => setEditando(true)}
      className="rounded-lg border border-destaque px-3 py-1.5 text-sm font-semibold text-destaque hover:bg-destaque-fundo"
    >
      Editar perfil
    </button>
  ) : null;
  // Para quem visita: o BotaoSeguir (Pessoa D, PR #33) entra no lugar de "acao"
  // quando chegar à main. Mensagem só aparece se as DMs existirem (decisão 6).

  const principal = (
    <div className="min-w-0 space-y-4">
      <TopoPerfil perfil={perfil} acao={acao} />
      {eu && (
        <EditarPerfil perfil={perfil} aberto={editando} fechar={() => setEditando(false)} aoSalvar={setPerfil} />
      )}

      {semNenhumPost ? (
        <ConviteVazio eu={eu} nome={perfil.name} />
      ) : (
        <>
          <section aria-labelledby="titulo-publicacoes" className="space-y-3">
            <h2 id="titulo-publicacoes" className="text-lg font-semibold">
              {eu ? "Minhas publicações:" : `Publicações de ${perfil.name}:`}
            </h2>
            <EstanteCadernos cadernos={perfil.cadernos} aberto={aberto} abrir={setAberto} />
          </section>

          <section aria-label="Posts" className="overflow-hidden rounded-2xl border border-linha bg-superficie">
            <div className="flex items-baseline gap-2 border-b border-linha px-4 py-3">
              <h3 className="font-semibold">{nomeDoCaderno ? `Caderno de ${nomeDoCaderno}` : "Todas as publicações"}</h3>
              <span className="font-numeros text-sm text-tinta-suave">{total === 1 ? "1 post" : `${total} posts`}</span>
            </div>

            {erroPosts && (
              <p role="alert" className="m-4 rounded-lg border border-erro bg-erro-fundo p-3 text-sm text-erro">
                {erroPosts}
              </p>
            )}
            {posts === null ? (
              erroPosts ? null : (
                <div role="status" aria-label="Carregando os posts" className="m-4 h-24 animate-pulse rounded-xl bg-linha" />
              )
            ) : posts.length === 0 ? (
              // O mesmo formato da lista vazia do feed (combinado em 24/11).
              <p className="p-6 text-sm text-tinta-suave">Nenhum post de {nomeDoCaderno} ainda.</p>
            ) : (
              <>
                {posts.map((p) => (
                  <CardPost key={p.id} post={p} />
                ))}
                {posts.length < total && (
                  <div className="border-t border-linha p-3 text-center">
                    <button
                      type="button"
                      onClick={verMais}
                      disabled={carregandoMais}
                      className="rounded-lg px-3 py-1.5 text-sm font-semibold text-destaque hover:bg-destaque-fundo disabled:opacity-50"
                    >
                      {carregandoMais ? "Carregando..." : "Ver mais posts"}
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </>
      )}
    </div>
  );

  if (!eu) return principal;

  // No celular, a coluna da direita vem antes dos posts (order) e rola junto.
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1fr)_248px] lg:items-start">
      {principal}
      <aside aria-label="Seu diário" className="-order-1 space-y-4 lg:sticky lg:top-4 lg:order-none">
        {/* A matéria do caderno aberto já vem marcada; em "Todas", fica a última escolhida. */}
        <PostarNoDiario tagInicial={aberto ?? ""} onPostado={aoPostar} />
        <CaixaFogo dados={ofensiva.dados} erro={ofensiva.erro} />
        <HorasEstudadas username={perfil.username} ofensiva={ofensiva.dados} versao={versao} />
      </aside>
    </div>
  );
}

// Diário sem nenhum post: um convite, nunca um beco sem saída (princípio 5).
function ConviteVazio({ eu, nome }: { eu: boolean; nome: string }) {
  return (
    <section className="rounded-2xl border border-linha bg-superficie px-6 py-10 text-center">
      <h2 className="text-lg font-semibold">{eu ? "Seu diário começa no primeiro post" : `${nome} ainda não postou`}</h2>
      <p className="mx-auto mt-1 max-w-md text-tinta-suave">
        {eu
          ? "Conte o que você estudou hoje e ele entra no caderno da matéria. Cada matéria vira um caderno aqui."
          : "Quando houver um estudo por aqui, ele aparece organizado por matéria."}
      </p>
    </section>
  );
}
