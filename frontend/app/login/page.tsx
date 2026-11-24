"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AvisoErro, CaixaAuth, Campo, estiloBotao, estiloCampo } from "@/components/FormAuth";
import { AVISO_ACABOU_DE_ENTRAR } from "@/components/BoasVindasDeVolta";
import { entrar } from "@/lib/api";
import { useSoSemLogin } from "@/lib/useExigeLogin";

export default function LoginPage() {
  const liberado = useSoSemLogin();
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
      // Avisa o feed para mostrar "Que bom te ver de novo" uma vez.
      try {
        sessionStorage.setItem(AVISO_ACABOU_DE_ENTRAR, "1");
      } catch {}
      // Recarrega a página inteira para o topo descobrir quem entrou.
      window.location.href = "/";
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível entrar.");
      setEnviando(false);
    }
  }

  if (!liberado) return null;

  return (
    // A saudação de chegada; o "Que bom te ver de novo" aparece no feed, depois de entrar (24/11).
    <CaixaAuth titulo="Entrar" saudacao="Seu caderno está te esperando">
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
