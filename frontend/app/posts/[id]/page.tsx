"use client";

// A página de um post (#12, Pessoa C): o card e a conversa na mesma folha. É
// para onde o "N comentários" do card leva, e também o clique no próprio post,
// no feed, no perfil e nas turmas.

import { useParams } from "next/navigation";

import { caminhoDosComentarios, Comentarios } from "@/components/Comentarios";
import { FolhaDoPost } from "@/components/FolhaDoPost";

export default function PaginaDoPost() {
  const { id } = useParams<{ id: string }>();
  return (
    <FolhaDoPost
      id={id}
      precarregar={caminhoDosComentarios(id)}
      embaixo={(post) => <Comentarios postId={post.id} />}
    />
  );
}
