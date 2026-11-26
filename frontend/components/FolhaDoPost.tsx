"use client";

// A folha de um post com algo embaixo, na mesma folha (#12, Pessoa C): a
// página do post põe a conversa inteira, e a tela "Ver conversa" põe só a
// conversa de um comentário. As duas buscam o post do mesmo jeito.

import { useEffect, useState, type ReactNode } from "react";

import { BotaoCurtir } from "@/components/BotaoCurtir";
import { BotaoSalvar } from "@/components/BotaoSalvar";
import { CardPost } from "@/components/CardPost";
import { apiGet, type Post } from "@/lib/api";
import { useExigeLogin } from "@/lib/useExigeLogin";

export function FolhaDoPost({ id, embaixo }: { id: string; embaixo: (post: Post) => ReactNode }) {
  const liberado = useExigeLogin();
  const [post, setPost] = useState<Post | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!liberado) return;
    apiGet<Post>(`/posts/${id}`)
      .then(setPost)
      // A mensagem vem do backend: "post não encontrado" no 404, ou o aviso
      // de servidor fora do ar, em vez de dizer sempre que o post não existe.
      .catch((falha) =>
        setErro(falha instanceof Error ? falha.message : "Não foi possível carregar o post."),
      );
  }, [liberado, id]);

  if (!liberado) return null;
  if (erro) return <p className="text-tinta-suave">{erro}</p>;
  if (!post) return <p className="text-tinta-suave">Carregando...</p>;

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
      />
    </div>
  );
}
