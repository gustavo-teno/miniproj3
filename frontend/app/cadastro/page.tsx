"use client";

import Link from "next/link";
import { useState } from "react";

import { EscolhaMeta } from "@/components/EscolhaMeta";
import { AvisoErro, CaixaAuth, Campo, estiloBotao, estiloCampo } from "@/components/FormAuth";
import { cadastrar, type Cadastro } from "@/lib/api";
import { useOpcoes } from "@/lib/opcoes";
import { NOME_REDE } from "@/lib/rede";
import { useSoSemLogin } from "@/lib/useExigeLogin";

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
  const liberado = useSoSemLogin();
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
      // Sem os espaços das pontas: "  Ana " vira "Ana", e um nome só de
      // espaços chega vazio e recebe o aviso certo.
      const entrou = await cadastrar({
        ...dados,
        name: dados.name.trim(),
        universidade: dados.universidade.trim(),
        vestibular_outro: dados.vestibular_outro.trim(),
        curso_outro: dados.curso_outro.trim(),
      });
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
      setErro(err instanceof Error ? err.message : "Não foi possível criar a conta.");
      setEnviando(false);
    }
  }

  if (!liberado) return null;

  return (
    // "Boas-vindas" em vez de "bem-vindo": serve para qualquer pessoa (24/11).
    <CaixaAuth titulo="Criar conta" saudacao={`Olá! Boas-vindas ao ${NOME_REDE}`}>
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
