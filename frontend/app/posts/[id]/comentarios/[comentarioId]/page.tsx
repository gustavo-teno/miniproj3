"use client";

// A tela "Ver conversa" (comentários em árvore, Pessoa C): o post em cima e,
// na mesma folha, um comentário em destaque com todas as respostas dele. É
// para onde o "Ver conversa (N respostas)" da página do post leva.

import { useParams } from "next/navigation";

import { caminhoDaConversa, ConversaDoComentario } from "@/components/Comentarios";
import { FolhaDoPost } from "@/components/FolhaDoPost";

export default function PaginaDaConversa() {
  const { id, comentarioId } = useParams<{ id: string; comentarioId: string }>();
  return (
    <FolhaDoPost
      id={id}
      precarregar={caminhoDaConversa(id, comentarioId)}
      embaixo={(post) => <ConversaDoComentario postId={post.id} comentarioId={comentarioId} />}
    />
  );
}
