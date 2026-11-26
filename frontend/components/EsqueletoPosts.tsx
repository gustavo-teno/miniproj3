// O desenho de uma lista de posts enquanto ela carrega: várias folhas no
// formato do <CardPost> (foto, nome, matéria e linhas de texto), pulsando, em
// vez de um retângulo só. Assim a tela já tem a cara do feed antes dos posts
// chegarem. Serve para qualquer lista de posts: <EsqueletoPosts />.

// Larguras diferentes para as linhas de texto, para as folhas não parecerem
// todas iguais.
const LINHAS = [
  ["w-full", "w-4/5"],
  ["w-full", "w-full", "w-1/2"],
  ["w-11/12"],
  ["w-full", "w-2/3"],
];

export function EsqueletoPosts({ quantos = 4, rotulo = "Carregando os posts" }: { quantos?: number; rotulo?: string }) {
  return (
    <div role="status" aria-label={rotulo} className="space-y-3">
      {Array.from({ length: quantos }, (_, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="folha flex gap-3 rounded-xl border border-linha bg-superficie py-4 pl-7 pr-6 sm:gap-4"
        >
          <div className="size-11 flex-none animate-pulse rounded-full bg-linha" />
          <div className="min-w-0 flex-1">
            {/* Nome e há quanto tempo; embaixo, a matéria. */}
            <div className="h-4 w-1/3 animate-pulse rounded bg-linha" />
            <div className="mt-2 h-3 w-24 animate-pulse rounded bg-linha" />
            <div className="mt-3 space-y-2">
              {LINHAS[i % LINHAS.length].map((largura, j) => (
                <div key={j} className={`h-3.5 animate-pulse rounded bg-linha ${largura}`} />
              ))}
            </div>
            {/* A barra de curtir, comentar e salvar. */}
            <div className="mt-3 flex gap-6">
              <div className="h-3 w-8 animate-pulse rounded bg-linha" />
              <div className="h-3 w-8 animate-pulse rounded bg-linha" />
              <div className="h-3 w-12 animate-pulse rounded bg-linha" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
