// O desenho de uma lista de posts enquanto ela carrega: várias folhas no
// formato do <CardPost> (foto, nome, matéria e linhas de texto), pulsando, em
// vez de um retângulo só. Assim a tela já tem a cara do feed antes dos posts
// chegarem. Serve para qualquer lista de posts: <EsqueletoPosts />.

import type { ReactNode } from "react";

// Larguras diferentes para as linhas de texto, para as folhas não parecerem
// todas iguais.
const LINHAS = [
  ["w-full", "w-4/5"],
  ["w-full", "w-full", "w-1/2"],
  ["w-11/12"],
  ["w-full", "w-2/3"],
];

// A mesma grade das listas em 2 colunas no computador (salvos e turma): as
// folhas ocupam o lugar dos posts, e a tela não muda de formato quando eles
// chegam.
const DUAS_COLUNAS = "lg:grid lg:grid-cols-2 lg:items-start lg:gap-4 lg:space-y-0";

export function EsqueletoPosts({
  quantos = 4,
  rotulo = "Carregando os posts",
  colunas = false,
}: {
  quantos?: number;
  rotulo?: string;
  colunas?: boolean;
}) {
  return (
    // space-y-4: o mesmo espaço das listas de posts.
    <div role="status" aria-label={rotulo} className={`space-y-4 ${colunas ? DUAS_COLUNAS : ""}`}>
      {Array.from({ length: quantos }, (_, i) => (
        <FolhaPulsando key={i} linhas={LINHAS[i % LINHAS.length]} />
      ))}
    </div>
  );
}

// Uma folha pulsando no formato do post. `children` vai embaixo, dentro da
// mesma folha: a página do post põe ali o lugar da conversa.
export function FolhaPulsando({
  linhas = LINHAS[0],
  barra = true,
  children,
}: {
  linhas?: string[];
  // A barra de curtir, comentar e salvar.
  barra?: boolean;
  children?: ReactNode;
}) {
  return (
    <div aria-hidden="true" className="folha rounded-xl border border-linha bg-superficie py-4 pl-7 pr-6">
      <div className="flex gap-3 sm:gap-4">
        <div className="size-11 flex-none animate-pulse rounded-full bg-linha" />
        <div className="min-w-0 flex-1">
          {/* Nome e há quanto tempo; embaixo, a matéria. */}
          <div className="h-4 w-1/3 animate-pulse rounded bg-linha" />
          <div className="mt-2 h-3 w-24 animate-pulse rounded bg-linha" />
          <div className="mt-3 space-y-2">
            {linhas.map((largura, j) => (
              <div key={j} className={`h-3.5 animate-pulse rounded bg-linha ${largura}`} />
            ))}
          </div>
          {barra && (
            <div className="mt-3 flex gap-6">
              <div className="h-3 w-8 animate-pulse rounded bg-linha" />
              <div className="h-3 w-8 animate-pulse rounded bg-linha" />
              <div className="h-3 w-12 animate-pulse rounded bg-linha" />
            </div>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
