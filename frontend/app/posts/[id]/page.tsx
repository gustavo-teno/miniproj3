"use client";

// A página de um post (#12, Pessoa C): o card e a conversa embaixo. É para
// onde o "N comentários" do card leva, no feed, no perfil e nas turmas.

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { BotaoCurtir } from "@/components/BotaoCurtir";
import { CardPost } from "@/components/CardPost";
import { Comentarios } from "@/components/Comentarios";
import { apiGet, type Post } from "@/lib/api";
import { useExigeLogin } from "@/lib/useExigeLogin";

export default function PaginaDoPost() {
  const liberado = useExigeLogin();
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!liberado) return;
    apiGet<Post>(`/posts/${id}`)
      .then(setPost)
      .catch(() => setErro("Esse post não existe ou foi apagado."));
  }, [liberado, id]);

  if (!liberado) return null;
  if (erro) return <p className="text-tinta-suave">{erro}</p>;
  if (!post) return <p className="text-tinta-suave">Carregando...</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-3">
      <div className="overflow-hidden rounded-2xl border border-linha bg-superficie">
        <CardPost post={post} rodape={<BotaoCurtir post={post} />} />
      </div>
      <Comentarios postId={post.id} />
    </div>
  );
}
