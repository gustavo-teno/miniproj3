"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AvisoErro, CaixaAuth, Campo, estiloBotao, estiloCampo } from "@/components/FormAuth";
import { entrar } from "@/lib/api";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [contaCriada, setContaCriada] = useState(false);

  // Vindo do cadastro em que só o login automático falhou (/login?conta=criada).
  // Lido no navegador, depois de desenhar: o useSearchParams obrigaria a
  // embrulhar a página num <Suspense> só por causa disto.
  useEffect(() => {
    setContaCriada(new URLSearchParams(window.location.search).get("conta") === "criada");
  }, []);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErro(null);
    try {
      await entrar(username, senha);
      // Recarrega a página inteira para o topo descobrir quem entrou.
      window.location.href = "/";
    } catch (err) {
      setErro(err instanceof Error ? err.message : "não consegui entrar");
      setEnviando(false);
    }
  }

  return (
    <CaixaAuth titulo="Entrar">
      <form onSubmit={enviar} className="space-y-4">
        {contaCriada && !erro && (
          <p role="status" className="rounded-lg bg-destaque-fundo p-3 text-sm text-tinta">
            Conta criada, agora é só entrar.
          </p>
        )}
        <Campo rotulo="Nome de usuário">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value.trim().toLowerCase())}
            autoComplete="username"
            autoCapitalize="none"
            required
            className={estiloCampo}
          />
        </Campo>
        <Campo rotulo="Senha">
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="current-password"
            required
            className={estiloCampo}
          />
        </Campo>
        <AvisoErro texto={erro} />
        <button type="submit" disabled={enviando} className={estiloBotao}>
          {enviando ? "Entrando..." : "Entrar"}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-tinta-suave">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="font-semibold text-destaque hover:underline">
          Criar conta
        </Link>
      </p>
    </CaixaAuth>
  );
}
