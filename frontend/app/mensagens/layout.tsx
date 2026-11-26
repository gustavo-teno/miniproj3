"use client";

// As Mensagens (#91). No computador (a partir de `lg`), a lista de conversas
// fica de um lado e a conversa aberta do outro, como no WhatsApp Web. No
// celular continua uma tela de cada vez: /mensagens mostra a lista, e uma
// conversa aberta cobre a tela toda, com a setinha de voltar.

import { useSelectedLayoutSegment } from "next/navigation";
import type { ReactNode } from "react";

import { ListaConversas } from "@/components/mensagens/ListaConversas";

export default function MensagensLayout({ children }: { children: ReactNode }) {
  // O @ da conversa aberta; null em /mensagens, sem nenhuma aberta.
  const aberta = useSelectedLayoutSegment();

  // 7rem (112px) = a altura do menu do topo (uns 61px) + o espaço em cima e
  // embaixo da página (o py-6 do <main>, 48px), com uns 3px de folga. Se o topo
  // mudar de altura, ajuste aqui para a página não rolar no computador.
  return (
    <div className="lg:grid lg:h-[calc(100dvh-7rem)] lg:grid-cols-[380px_minmax(0,1fr)] lg:overflow-hidden lg:rounded-2xl lg:border lg:border-linha lg:bg-superficie">
      {/* No celular, a lista só aparece enquanto nenhuma conversa está aberta. */}
      <aside className={(aberta ? "hidden " : "") + "lg:block lg:min-h-0 lg:overflow-y-auto lg:border-r lg:border-linha"}>
        <ListaConversas aberta={aberta} />
      </aside>
      <div className={(aberta ? "" : "hidden ") + "lg:block lg:min-h-0 lg:min-w-0 lg:bg-fundo"}>{children}</div>
    </div>
  );
}
