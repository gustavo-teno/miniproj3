import Link from "next/link";

// A página de "não encontrado" da rede, no lugar da padrão do Next (preta e em
// inglês). Aparece em endereços errados e nas telas que ainda não existem.
export default function NaoEncontrada() {
  return (
    <div className="mx-auto max-w-md py-24 text-center">
      <h1 className="text-2xl font-semibold">Esta página ainda não existe</h1>
      <p className="mt-3 font-light text-tinta-suave">
        Ela pode estar em construção ou o endereço pode estar errado.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-lg bg-destaque px-5 py-2.5 text-sobre-destaque hover:opacity-90"
      >
        Voltar para o feed
      </Link>
    </div>
  );
}
