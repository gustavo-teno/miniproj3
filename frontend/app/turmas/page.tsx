"use client";

// A aba Turmas (#17, Pessoa D; decisão 5): as turmas de quem está vendo em
// cima e, embaixo, todas as outras, abertas para qualquer pessoa olhar. A
// turma sai da meta do perfil, então quem não escolheu a meta é convidado a
// escolher no diário.

import Link from "next/link";
import { useEffect, useState } from "react";

import { AvisoErro } from "@/components/FormAuth";
import { CartaoTurma } from "@/components/turmas/CartaoTurma";
import { buscarEu, buscarTurmas, type Turma, type Turmas } from "@/lib/api";
import { useExigeLogin } from "@/lib/useExigeLogin";

export default function TurmasPage() {
  const liberado = useExigeLogin();
  const [turmas, setTurmas] = useState<Turmas | null>(null);
  const [eu, setEu] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!liberado) return;
    buscarTurmas()
      .then(setTurmas)
      .catch(() => setErro("Não foi possível carregar as turmas. Tente de novo."));
    buscarEu()
      .then((e) => setEu(e.username))
      .catch(() => {});
  }, [liberado]);

  if (!liberado) return null;

  return (
    <div className="mx-auto max-w-2xl lg:max-w-none">
      <h1 className="text-2xl font-semibold">Turmas</h1>
      <p className="mt-1 text-sm text-tinta-suave">
        Cada vestibular e cada curso forma uma turma. Aqui você encontra quem tem a mesma meta que você.
      </p>

      <div className="mt-4 empty:hidden">
        <AvisoErro texto={erro} />
      </div>

      {!turmas && !erro && (
        <div role="status" aria-label="Carregando as turmas" className="mt-4 h-40 animate-pulse rounded-xl bg-linha" />
      )}

      {turmas && (
        <>
          <section aria-labelledby="suas-turmas" className="mt-6">
            <h2 id="suas-turmas" className="font-semibold">
              Suas turmas
            </h2>
            {turmas.minhas.length > 0 ? (
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                {turmas.minhas.map((t) => (
                  <CartaoTurma key={`${t.tipo}-${t.chave}`} turma={t} destaque />
                ))}
              </div>
            ) : (
              <div className="mt-2 rounded-xl border border-linha bg-superficie p-4 text-sm">
                <p>Você ainda não escolheu a sua meta. É ela que coloca você numa turma.</p>
                {eu && (
                  <Link href={`/u/${eu}`} className="mt-2 inline-block font-semibold text-destaque underline">
                    Escolher no seu diário (Editar perfil)
                  </Link>
                )}
              </div>
            )}
          </section>

          <ListaDeTurmas titulo="Vestibulares" id="vestibulares" turmas={turmas.vestibulares} />
          <ListaDeTurmas titulo="Cursos" id="cursos" turmas={turmas.cursos} />
        </>
      )}
    </div>
  );
}

function ListaDeTurmas({ titulo, id, turmas }: { titulo: string; id: string; turmas: Turma[] }) {
  return (
    <section aria-labelledby={id} className="mt-8">
      <h2 id={id} className="font-semibold">
        {titulo}
      </h2>
      <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {turmas.map((t) => (
          <CartaoTurma key={t.chave} turma={t} />
        ))}
      </div>
    </section>
  );
}
