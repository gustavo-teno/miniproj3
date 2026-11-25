import type { Autor } from "@/lib/api";

// A foto da pessoa, ou as iniciais do nome quando ela não pôs foto. Sem foto,
// cada pessoa tem uma cor fixa (uma das 6 do globals.css, escolhida pelo nome),
// para ninguém parecer igual a todo mundo no feed.
const CORES = 6;

function corDoNome(nome: string): number {
  let soma = 0;
  for (const letra of nome) soma = (soma * 31 + letra.charCodeAt(0)) % 997;
  return soma % CORES;
}

export function Avatar({
  autor,
  pequeno = false,
  grande = false,
  enorme = false,
}: {
  autor: Pick<Autor, "name" | "avatar_url">;
  pequeno?: boolean;
  // O do card do post: do tamanho do antigo quadrado da matéria.
  grande?: boolean;
  // O do topo do perfil: 64px no celular e 96px no computador.
  enorme?: boolean;
}) {
  const tamanho = enorme
    ? "size-16 text-xl sm:size-24 sm:text-3xl"
    : grande
      ? "size-11 text-sm"
      : pequeno
        ? "size-6 text-[10px]"
        : "size-8 text-xs";

  if (autor.avatar_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={autor.avatar_url} alt="" className={`${tamanho} flex-none rounded-full object-cover`} />
    );
  }

  const iniciais = autor.name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span
      aria-hidden
      className={`${tamanho} avatar avatar-${corDoNome(autor.name)} grid flex-none place-items-center rounded-full font-semibold`}
    >
      {iniciais}
    </span>
  );
}
