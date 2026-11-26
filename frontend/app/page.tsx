"use client";

import { BoasVindasDeVolta } from "@/components/BoasVindasDeVolta";
import { Feed } from "@/components/Feed";
import { useExigeLogin } from "@/lib/useExigeLogin";

export default function Home() {
  // O feed é só de quem entrou: sem login, vai para /login. Enquanto confere,
  // não mostra nada, para o feed não piscar na tela de quem não entrou.
  const liberado = useExigeLogin();
  if (!liberado) return null;
  return (
    <div className="space-y-3">
      {/* Pessoa B: a linha de boas-vindas depois do login, no topo do feed. */}
      <BoasVindasDeVolta />
      {/* Pessoa D (#16): o feed de quem você segue. */}
      <Feed />
    </div>
  );
}
