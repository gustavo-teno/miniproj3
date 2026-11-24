"use client";

// Editar o perfil (#10, Pessoa B): uma caixa que abre por cima do diário, sem
// trocar de página (combinado em 24/11). Salva com PATCH /usuarios/eu, que
// devolve o perfil inteiro, e o diário se atualiza na hora.
//
// <dialog> com showModal(): o navegador já cuida do fundo escuro, de prender o
// foco do teclado na caixa e de fechar com Esc (como os filtros do feed).

import { useEffect, useRef, useState, type FormEvent } from "react";

import { EscolhaMeta } from "@/components/EscolhaMeta";
import { AvisoErro, Campo, estiloCampo } from "@/components/FormAuth";
import { editarPerfil, type EdicaoPerfil, type Perfil } from "@/lib/api";
import { useOpcoes } from "@/lib/opcoes";

// Os mesmos limites do backend (schemas/user.py).
const MAX_BIO = 280;

type Campos = Required<EdicaoPerfil>;

function camposDe(perfil: Perfil): Campos {
  return {
    name: perfil.name,
    bio: perfil.bio,
    avatar_url: perfil.avatar_url,
    vestibular: perfil.vestibular,
    curso: perfil.curso,
    vestibular_outro: perfil.vestibular_outro,
    curso_outro: perfil.curso_outro,
    universidade: perfil.universidade,
  };
}

export function EditarPerfil({
  perfil,
  aberto,
  fechar,
  aoSalvar,
}: {
  perfil: Perfil;
  aberto: boolean;
  fechar: () => void;
  aoSalvar: (perfil: Perfil) => void;
}) {
  const caixa = useRef<HTMLDialogElement>(null);
  const opcoes = useOpcoes();
  const [dados, setDados] = useState<Campos>(() => camposDe(perfil));
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  // Abre e fecha a caixa de verdade, e sempre começa com o que está salvo.
  useEffect(() => {
    const d = caixa.current;
    if (!d) return;
    if (aberto && !d.open) {
      setDados(camposDe(perfil));
      setErro(null);
      d.showModal();
    } else if (!aberto && d.open) {
      d.close();
    }
  }, [aberto, perfil]);

  function mudar(campo: keyof Campos, valor: string) {
    setDados((antes) => ({ ...antes, [campo]: valor }));
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro(null);
    // Só vai o que mudou, sem os espaços das pontas.
    const original = camposDe(perfil);
    const mudancas: EdicaoPerfil = {};
    for (const campo of Object.keys(dados) as (keyof Campos)[]) {
      const valor = dados[campo].trim();
      if (valor !== original[campo]) mudancas[campo] = valor;
    }
    try {
      const atualizado = Object.keys(mudancas).length ? await editarPerfil(mudancas) : perfil;
      aoSalvar(atualizado);
      fechar();
    } catch (falha) {
      // O que a pessoa escreveu fica nos campos.
      setErro(falha instanceof Error ? falha.message : "Não foi possível salvar o perfil. Tente de novo.");
    } finally {
      setSalvando(false);
    }
  }

  const foto = dados.avatar_url.trim();
  const fotoValida = foto.startsWith("https://");

  return (
    <dialog
      ref={caixa}
      aria-labelledby="titulo-editar"
      onClose={fechar}
      // Clicar no fundo escuro (fora da caixa) também fecha.
      onClick={(e) => e.target === caixa.current && fechar()}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-linha bg-superficie p-0 text-tinta shadow-md backdrop:bg-black/40"
    >
      <form onSubmit={salvar} className="flex max-h-[85vh] flex-col">
        <div className="flex items-center justify-between border-b border-linha px-5 py-3.5">
          <h2 id="titulo-editar" className="text-lg font-semibold">
            Editar perfil
          </h2>
          <button
            type="button"
            onClick={fechar}
            aria-label="Fechar"
            className="grid size-8 place-items-center rounded-md text-tinta-suave hover:bg-destaque-fundo"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto px-5 py-4">
          <Campo rotulo="Foto" dica="Um link de imagem que comece com https://. Deixe vazio para usar as suas iniciais.">
            <div className="flex items-center gap-3">
              {/* A prévia só aparece com um link que o backend aceita. */}
              {fotoValida ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={foto} alt="" className="size-11 flex-none rounded-full bg-destaque-fundo object-cover" />
              ) : (
                <span aria-hidden className="size-11 flex-none rounded-full bg-destaque-fundo" />
              )}
              <input
                type="url"
                value={dados.avatar_url}
                onChange={(e) => mudar("avatar_url", e.target.value)}
                maxLength={300}
                pattern="https://.*"
                title="Um link que comece com https://"
                placeholder="https://..."
                className={estiloCampo}
              />
            </div>
          </Campo>

          <Campo rotulo="Nome" dica="Como você quer aparecer para a turma.">
            <input
              value={dados.name}
              onChange={(e) => mudar("name", e.target.value)}
              required
              maxLength={80}
              autoComplete="name"
              className={estiloCampo}
            />
          </Campo>

          <Campo rotulo="Bio" dica={`Até ${MAX_BIO} caracteres.`}>
            <textarea
              value={dados.bio}
              onChange={(e) => mudar("bio", e.target.value)}
              maxLength={MAX_BIO}
              rows={3}
              placeholder="Ex.: Terceiro ano, estudando em casa."
              className={`${estiloCampo} resize-none font-light`}
            />
          </Campo>


          <fieldset className="space-y-4 border-t border-linha pt-4">
            <legend className="pr-2 text-sm font-light text-tinta-suave">
              Sua meta. É ela que forma a sua turma.
            </legend>
            <EscolhaMeta
              rotulo="Vestibular"
              lista={opcoes?.vestibulares}
              valor={dados.vestibular}
              aoEscolher={(v) => mudar("vestibular", v)}
              outro={dados.vestibular_outro}
              aoEscreverOutro={(v) => mudar("vestibular_outro", v)}
              exemploOutro="Ex.: o vestibular da sua estadual"
            />
            <EscolhaMeta
              rotulo="Curso"
              lista={opcoes?.cursos}
              valor={dados.curso}
              aoEscolher={(v) => mudar("curso", v)}
              outro={dados.curso_outro}
              aoEscreverOutro={(v) => mudar("curso_outro", v)}
              exemploOutro="Ex.: Geografia, ou ainda não sei"
            />
            <Campo rotulo="Universidade dos sonhos">
              <input
                value={dados.universidade}
                onChange={(e) => mudar("universidade", e.target.value)}
                maxLength={80}
                placeholder="Ex.: UFPB"
                className={estiloCampo}
              />
            </Campo>
          </fieldset>

          <AvisoErro texto={erro} />
        </div>

        <div className="flex justify-end gap-2 border-t border-linha px-5 py-3.5">
          <button type="button" onClick={fechar} className="rounded-lg px-4 py-2 text-sm text-tinta-suave hover:text-tinta">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={salvando}
            className="rounded-lg bg-destaque px-5 py-2 text-sm font-semibold text-sobre-destaque disabled:opacity-50"
          >
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
