"use client";

import { BoasVindasDeVolta } from "@/components/BoasVindasDeVolta";
import { useExigeLogin } from "@/lib/useExigeLogin";

export default function Home() {
  // O feed é só de quem entrou: sem login, vai para /login. Enquanto confere,
  // não mostra nada, para o feed não piscar na tela de quem não entrou.
  const liberado = useExigeLogin();
  if (!liberado) return null;
  return (
    <div className="space-y-3">
      {/* Pessoa B: a linha de boas-vindas depois do login. Fica no topo quando o feed de verdade (D) entrar. */}
      <BoasVindasDeVolta />
      <h1 className="text-2xl font-bold">Feed</h1>
      <p className="text-zinc-600">
        Aqui nasce o feed do seu nicho (feature do núcleo). Enquanto isso, veja
        o slice de exemplo em{" "}
        <a href="/usuarios" className="underline">
          /usuarios
        </a>{" "}
        — toda feature sua imita aquele caminho.
      </p>
    </div>
  );
}
