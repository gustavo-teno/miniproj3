"use client";

// A escolha da meta (decisão 3): uma lista de /opcoes e, se a escolha for
// "Outro", um campo para escrever qual. Nasceu no cadastro (Pessoa A) e veio
// para cá para a tela de editar o perfil (Pessoa B) usar a mesma.

import { Campo, estiloCampo } from "@/components/FormAuth";
import type { Opcao } from "@/lib/api";

export function EscolhaMeta({
  rotulo,
  lista,
  valor,
  aoEscolher,
  outro,
  aoEscreverOutro,
  exemploOutro,
}: {
  rotulo: string;
  lista: Opcao[] | undefined;
  valor: string;
  aoEscolher: (valor: string) => void;
  outro: string;
  aoEscreverOutro: (texto: string) => void;
  exemploOutro: string;
}) {
  return (
    <>
      <Campo rotulo={rotulo}>
        {/* Sem a lista (backend fora do ar), a escolha fica para depois. */}
        <select
          value={valor}
          onChange={(e) => aoEscolher(e.target.value)}
          disabled={!lista}
          className={estiloCampo}
        >
          <option value="">{lista ? "Ainda não escolhi" : "Carregando..."}</option>
          {lista?.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.nome}
            </option>
          ))}
        </select>
      </Campo>
      {valor === "outro" && (
        <Campo rotulo={`Qual ${rotulo.toLowerCase()}?`}>
          <input
            value={outro}
            onChange={(e) => aoEscreverOutro(e.target.value)}
            maxLength={60}
            placeholder={exemploOutro}
            className={estiloCampo}
          />
        </Campo>
      )}
    </>
  );
}
