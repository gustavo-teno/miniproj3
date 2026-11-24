import type { Autor } from "@/lib/api";

// A foto da pessoa, ou as iniciais do nome quando ela não pôs foto.
export function Avatar({
  autor,
  pequeno = false,
  grande = false,
}: {
  autor: Pick<Autor, "name" | "avatar_url">;
  pequeno?: boolean;
  // O do card do post: do tamanho do antigo quadrado da matéria.
  grande?: boolean;
}) {
  const tamanho = grande ? "size-11 text-sm" : pequeno ? "size-6 text-[10px]" : "size-8 text-xs";

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
      className={`${tamanho} grid flex-none place-items-center rounded-full bg-destaque-fundo font-semibold text-destaque`}
    >
      {iniciais}
    </span>
  );
}
