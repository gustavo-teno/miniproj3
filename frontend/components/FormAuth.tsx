// Peças comuns das telas de entrar e de criar conta, para as duas ficarem
// iguais: a caixa no meio da tela, os campos e o aviso de erro.

import { NOME_REDE } from "@/lib/rede";

export const estiloCampo =
  "w-full rounded-lg border border-linha bg-superficie px-3 py-2 text-tinta " +
  "focus:border-destaque focus:outline-none focus:ring-2 focus:ring-destaque-fundo";

export const estiloBotao =
  "w-full rounded-lg bg-destaque px-5 py-2.5 font-semibold text-sobre-destaque " +
  "hover:opacity-90 disabled:opacity-50";

export function CaixaAuth({
  titulo,
  saudacao,
  children,
}: {
  titulo: string;
  // Uma linha acima do título no lugar do nome da rede (o cadastro usa
  // "Olá! Boas-vindas ao Caderno"). Sem ela, aparece só o nome da rede.
  saudacao?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-md py-10">
      {/* A saudação é o destaque da tela: grande, em negrito e em lavanda, maior
          que o título (combinado em 24/11). Sem ela, o nome da rede pequeno. */}
      {saudacao ? (
        // Numa linha só a partir do tablet: passa da largura da caixa e fica
        // centralizada na tela. No celular, quebra em duas linhas.
        <p className="saudacao relative left-1/2 w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 text-center text-[30px] font-bold leading-tight tracking-tight [text-wrap:balance] sm:max-w-none sm:whitespace-nowrap sm:text-[44px]">
          {saudacao}
        </p>
      ) : (
        <p className="text-center text-sm font-light text-tinta-suave">{NOME_REDE}</p>
      )}
      <h1 className="mt-1 text-center text-2xl font-semibold">{titulo}</h1>
      <div className="mt-6 rounded-xl border border-linha bg-superficie p-6">{children}</div>
    </div>
  );
}

// Um campo com o rótulo em cima e, se houver, uma dica embaixo.
export function Campo({
  rotulo,
  dica,
  children,
}: {
  rotulo: string;
  dica?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold">{rotulo}</span>
      {children}
      {dica && <span className="mt-1 block text-xs font-light text-tinta-suave">{dica}</span>}
    </label>
  );
}

// role="alert": o leitor de tela lê o erro assim que ele aparece.
export function AvisoErro({ texto }: { texto: string | null }) {
  if (!texto) return null;
  return (
    <p role="alert" className="rounded-lg border border-erro bg-erro-fundo p-3 text-sm text-erro">
      {texto}
    </p>
  );
}
