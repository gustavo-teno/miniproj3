"use client";

// A folha de um post com algo embaixo, na mesma folha (#12, Pessoa C): a
// página do post põe a conversa inteira, e a tela "Ver conversa" põe só a
// conversa de um comentário. As duas buscam o post do mesmo jeito.

import { useEffect, useState, type ReactNode } from "react";

import { BotaoCurtir } from "@/components/BotaoCurtir";
import { BotaoSalvar } from "@/components/BotaoSalvar";
import { CardPost } from "@/components/CardPost";
import { FolhaPulsando } from "@/components/EsqueletoPosts";
import { AvisoErro } from "@/components/FormAuth";
import { apiGet, buscarEu, type Post } from "@/lib/api";
import { tirarImagem } from "@/lib/imagem";
import { precarregar } from "@/lib/precarregar";
import { useExigeLogin } from "@/lib/useExigeLogin";

export function FolhaDoPost({
  id,
  embaixo,
  precarregar: caminhoDeBaixo,
}: {
  id: string;
  embaixo: (post: Post) => ReactNode;
  // O pedido do que vai embaixo (a conversa), feito junto com o do post para
  // as duas esperas não se somarem.
  precarregar?: string;
}) {
  const liberado = useExigeLogin();
  const [post, setPost] = useState<Post | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  // Quem está vendo: o autor pode tirar a imagem do post (#105).
  const [eu, setEu] = useState<string | null>(null);

  useEffect(() => {
    if (!liberado) return;
    buscarEu()
      .then((u) => setEu(u.username))
      .catch(() => setEu(null));
  }, [liberado]);

  useEffect(() => {
    if (!liberado) return;
    if (caminhoDeBaixo) precarregar(caminhoDeBaixo);
    apiGet<Post>(`/posts/${id}`)
      .then(setPost)
      // A mensagem vem do backend: "post não encontrado" no 404, ou o aviso
      // de servidor fora do ar, em vez de dizer sempre que o post não existe.
      .catch((falha) =>
        setErro(falha instanceof Error ? falha.message : "Não foi possível carregar o post."),
      );
  }, [liberado, id, caminhoDeBaixo]);

  if (!liberado) return null;
  if (erro) {
    return (
      <div className="mx-auto max-w-2xl">
        <AvisoErro texto={erro} />
      </div>
    );
  }
  if (!post) {
    // A mesma folha pulsando das listas de posts (EsqueletoPosts), com o lugar
    // da conversa embaixo, em vez de um "Carregando..." solto no canto.
    return (
      <div role="status" aria-label="Carregando o post" className="mx-auto max-w-2xl">
        <FolhaPulsando barra={false}>
          <div className="mt-6 h-20 animate-pulse rounded-xl bg-linha" />
        </FolhaPulsando>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* O post e a conversa ficam na mesma folha: nada de caixa separada. */}
      <CardPost
        post={post}
        abrirAoClicar={false}
        rodape={
          <>
            <BotaoCurtir post={post} />
            <BotaoSalvar post={post} />
          </>
        }
        embaixo={embaixo(post)}
        aoTirarImagem={
          eu === post.autor.username
            ? async () => {
                await tirarImagem(post.id);
                setPost({ ...post, tem_imagem: false });
              }
            : undefined
        }
      />
    </div>
  );
}
