"use client";

// A aba Turmas (#17, Pessoa D; decisão 5; desenho "B · Folha", #94): as turmas
// de quem está vendo em cima, com o marcador de caderno, e embaixo uma folha
// de Vestibulares e uma de Cursos, abertas para qualquer pessoa olhar. A turma
// sai da meta do perfil, então quem não escolheu a meta é convidado a
// escolher no diário.

import Link from "next/link";
import { useEffect, useState } from "react";

import { AvisoErro } from "@/components/FormAuth";
import { CartaoMinhaTurma, FolhaDeTurmas } from "@/components/turmas/CartaoTurma";
import { buscarEu, buscarTurmas, type Turmas } from "@/lib/api";
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
    <div className="mx-auto max-w-2xl lg:max-w-5xl">
      <h1 className="text-2xl font-semibold">Turmas</h1>
      <p className="mt-1 text-sm text-tinta-suave">Quem estuda o mesmo que você.</p>

      <div className="mt-4 empty:hidden">
        <AvisoErro texto={erro} />
      </div>

      {!turmas && !erro && (
        <div role="status" aria-label="Carregando as turmas" className="mt-4 h-40 animate-pulse rounded-xl bg-linha" />
      )}

      {turmas && (
        <>
          <section aria-labelledby="suas-turmas" className="mt-6">
            <h2 id="suas-turmas" className="text-xs font-semibold uppercase tracking-wider text-tinta-suave">
              Suas turmas
            </h2>
            {turmas.minhas.length > 0 ? (
              <div className="mt-2 grid gap-3 sm:grid-cols-2 sm:gap-4">
                {turmas.minhas.map((t) => (
                  <CartaoMinhaTurma key={`${t.tipo}-${t.chave}`} turma={t} />
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

          {/* Uma folha de cada tipo, lado a lado no computador. */}
          <div className="mt-4 grid items-start gap-4 lg:grid-cols-2">
            <FolhaDeTurmas titulo="Vestibulares" id="vestibulares" turmas={turmas.vestibulares} />
            <FolhaDeTurmas titulo="Cursos" id="cursos" turmas={turmas.cursos} />
          </div>
        </>
      )}
    </div>
  );
}
