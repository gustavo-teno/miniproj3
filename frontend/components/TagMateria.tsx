"use client";

import { SimboloMateria } from "@/components/SimboloMateria";
import { estiloDaTag } from "@/lib/materias";
import { nomeDaOpcao, useOpcoes } from "@/lib/opcoes";

// A etiqueta de uma tag: o símbolo e o nome da matéria, na cor dela, no modo
// claro ou no noturno. Usada no <CardPost>, no formulário de postar, nos
// filtros e nas divisórias do perfil.
export function TagMateria({ tag }: { tag: string }) {
  const opcoes = useOpcoes();
  return (
    <span
      className="cor-materia inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-xs"
      style={estiloDaTag(tag)}
    >
      <SimboloMateria tag={tag} className="size-3.5" />
      {nomeDaOpcao(opcoes?.tags, tag)}
    </span>
  );
}
