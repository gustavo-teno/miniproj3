"use client";

import { useExigeLogin } from "@/lib/useExigeLogin";

export default function Home() {
  // O feed é só de quem entrou: sem login, vai para /login.
  useExigeLogin();
  return (
    <div className="space-y-3">
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
