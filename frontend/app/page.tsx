"use client";

import { useEffect, useState } from "react";

import { Abertura } from "@/components/Abertura";
import { BoasVindasDeVolta } from "@/components/BoasVindasDeVolta";
import { Feed } from "@/components/Feed";
import { lerToken } from "@/lib/sessao";

export default function Home() {
  // Quem entrou vê o feed; quem não entrou vê a tela de abertura. O token só
  // pode ser lido no navegador, então até conferir a página não desenha nada,
  // para nem o feed nem a abertura piscarem na tela errada.
  const [entrou, setEntrou] = useState<boolean | null>(null);
  useEffect(() => {
    // Com o atalho de teste ligado (NEXT_PUBLIC_DEV_USER_ID), conta como quem entrou.
    setEntrou(Boolean(process.env.NEXT_PUBLIC_DEV_USER_ID || lerToken()));
  }, []);

  if (entrou === null) return null;
  if (!entrou) return <Abertura />;
  return (
    <div className="space-y-3">
      {/* Pessoa B: a linha de boas-vindas depois do login, no topo do feed. */}
      <BoasVindasDeVolta />
      {/* Pessoa D (#16): o feed de quem você segue. */}
      <Feed />
    </div>
  );
}
