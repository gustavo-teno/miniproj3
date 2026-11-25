"use client";

// "Que bom te ver de novo, Ada!" no topo do feed, só na primeira visita
// depois do login (combinado em 24/11). O login deixa um aviso guardado na
// aba (sessionStorage); esta linha lê, aparece uma vez e apaga o aviso. Quem
// acabou de criar a conta não vê, porque o cadastro não deixa o aviso.

import { useEffect, useState } from "react";

import { apiGet, type User } from "@/lib/api";

export const AVISO_ACABOU_DE_ENTRAR = "acabou-de-entrar";

export function BoasVindasDeVolta() {
  const [nome, setNome] = useState<string | null>(null);

  useEffect(() => {
    let acabouDeEntrar = false;
    try {
      acabouDeEntrar = sessionStorage.getItem(AVISO_ACABOU_DE_ENTRAR) === "1";
      sessionStorage.removeItem(AVISO_ACABOU_DE_ENTRAR);
    } catch {
      // Navegação anônima pode bloquear o sessionStorage: aí a linha não aparece.
    }
    if (!acabouDeEntrar) return;
    apiGet<User>("/auth/eu")
      .then((eu) => setNome(eu.name.split(" ")[0]))
      .catch(() => {});
  }, []);

  if (!nome) return null;
  return <p className="saudacao text-[28px] font-bold leading-tight tracking-tight">Que bom te ver de novo, {nome}!</p>;
}
