"use client";

import Link from "next/link";
import { useState } from "react";

import { AvisoErro, CaixaAuth, Campo, estiloBotao, estiloCampo } from "@/components/FormAuth";
import { cadastrar, type Cadastro, type Opcao } from "@/lib/api";
import { useOpcoes } from "@/lib/opcoes";

const VAZIO: Cadastro = {
  username: "",
  name: "",
  password: "",
  vestibular: "",
  curso: "",
  vestibular_outro: "",
  curso_outro: "",
  universidade: "",
};

export default function CadastroPage() {
  const opcoes = useOpcoes();
  const [dados, setDados] = useState<Cadastro>(VAZIO);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Troca um campo só, mantendo os outros.
  function mudar(campo: keyof Cadastro, valor: string) {
    setDados((antes) => ({ ...antes, [campo]: valor }));
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErro(null);
    try {
      const entrou = await cadastrar(dados);
      if (!entrou) {
        // A conta existe, só o login automático falhou: a pessoa entra à mão.
        window.location.href = "/login?conta=criada";
        return;
      }
      // Por enquanto vai para o feed. Quando a tela de Turmas existir (D, #17),
      // vai para a turma da pessoa (decisão 3). Recarrega a página inteira para
      // o topo descobrir quem entrou.
      window.location.href = "/";
    } catch (err) {
      setErro(err instanceof Error ? err.message : "não consegui criar a conta");
      setEnviando(false);
    }
  }

  return (
    <CaixaAuth titulo="Criar conta">
      <form onSubmit={enviar} className="space-y-4">
        <Campo rotulo="Nome" dica="Como você quer aparecer para a turma.">
          <input
            value={dados.name}
            onChange={(e) => mudar("name", e.target.value)}
            autoComplete="name"
            required
            maxLength={80}
            className={estiloCampo}
          />
        </Campo>
        <Campo rotulo="Nome de usuário" dica="De 3 a 30 letras minúsculas, números ou _. Ex.: ana_enem">
          <input
            value={dados.username}
            onChange={(e) => mudar("username", e.target.value.trim().toLowerCase())}
            autoComplete="username"
            autoCapitalize="none"
            required
            minLength={3}
            maxLength={30}
            pattern="[a-z0-9_]+"
            title="Só letras minúsculas sem acento, números e _"
            className={estiloCampo}
          />
        </Campo>
        <Campo rotulo="Senha" dica="Pelo menos 8 caracteres.">
          <input
            type="password"
            value={dados.password}
            onChange={(e) => mudar("password", e.target.value)}
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={72}
            className={estiloCampo}
          />
        </Campo>

        <fieldset className="space-y-4 border-t border-linha pt-4">
          <legend className="pr-2 text-sm font-light text-tinta-suave">
            Sua meta (opcional, dá para mudar depois). É ela que forma a sua turma.
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
        <button type="submit" disabled={enviando} className={estiloBotao}>
          {enviando ? "Criando a conta..." : "Criar conta"}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-tinta-suave">
        Já tem conta?{" "}
        <Link href="/login" className="font-semibold text-destaque hover:underline">
          Entrar
        </Link>
      </p>
    </CaixaAuth>
  );
}

// Uma lista de /opcoes e, se a escolha for "Outro", um campo para escrever qual.
function EscolhaMeta({
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
