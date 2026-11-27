"use client";

// A tela de abertura: o que aparece em / para quem ainda não entrou, no lugar
// de cair direto no login. Mostra o que é a rede com dois posts de exemplo,
// desenhados pelo mesmo CardPost do feed, e leva ao cadastro ou ao login.

import Link from "next/link";

import { CardPost } from "@/components/CardPost";
import { LogoMargem } from "@/components/LogoMargem";
import type { Post } from "@/lib/api";
import { NOME_REDE } from "@/lib/rede";

// Posts de mentira, só para mostrar como o feed é. As horas são contadas a
// partir de agora, para o "há 40 min" fazer sentido em qualquer dia.
function exemplo(id: number, nome: string, tag: string, minutos: number | null, texto: string, haMinutos: number): Post {
  return {
    id,
    autor: { id, username: nome.toLowerCase(), name: nome, avatar_url: "" },
    texto,
    tag,
    minutos,
    created_at: new Date(Date.now() - haMinutos * 60_000).toISOString(),
    curtidas: 0,
    comentarios: 0,
    curtido_por_mim: false,
    salvo_por_mim: false,
  };
}

const EXEMPLOS = [
  exemplo(1, "Larissa", "matematica", 90, "Fiz 20 questões de função do 2º grau. Errei 6, quase todas de sinal. Amanhã refaço só essas.", 40),
  exemplo(2, "Caio", "biologia", 45, "Revisei citologia. Mitocôndria eu já sei de cor, o complexo de Golgi ainda não.", 130),
];

export function Abertura() {
  return (
    <section className="mx-auto grid max-w-5xl items-center gap-10 py-4 md:grid-cols-[1fr_minmax(0,26rem)] md:gap-16 md:py-14">
      <div>
        {/* No celular o topo do site esconde o logo, então ele aparece aqui; no
            computador o topo já mostra, e repetir ficaria estranho. */}
        <div className="mb-6 flex items-center gap-3 sm:hidden">
          <LogoMargem className="size-11" comPauta />
          <span className="text-xl font-semibold tracking-tight">{NOME_REDE}</span>
        </div>

        <h1 className="text-[34px] font-bold leading-[1.1] tracking-tight [text-wrap:balance] sm:text-5xl">
          A rede social para quem presta vestibulares.
        </h1>

        {/* A linha lavanda à esquerda é a margem do caderno, como nos posts. */}
        <ul className="mt-6 space-y-2 border-l-2 border-destaque pl-4 text-tinta-suave [text-wrap:pretty]">
          <li>Conte o que estudou hoje: a matéria, o tempo e o que travou.</li>
          <li>Ao criar a conta, você já entra na turma de quem vai prestar o mesmo que você.</li>
          <li>Postou todo dia? A sua ofensiva cresce.</li>
        </ul>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/cadastro"
            className="rounded-lg bg-destaque px-5 py-2.5 font-semibold text-sobre-destaque hover:opacity-90"
          >
            Criar conta
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-linha bg-superficie px-5 py-2.5 font-semibold hover:border-destaque"
          >
            Já tenho conta
          </Link>
        </div>
      </div>

      {/* inert: são só exemplos, nada aqui é clicável nem recebe o Tab. */}
      <div inert className="space-y-3">
        {EXEMPLOS.map((post) => (
          <CardPost key={post.id} post={post} abrirAoClicar={false} />
        ))}
      </div>
    </section>
  );
}
