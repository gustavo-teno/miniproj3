"use client";

// O atalho de postar (Pessoa B): fechado, é uma linha só (foto, caixa e botão).
// Ao clicar, abre para escrever, com a matéria (obrigatória, decisão 2) e a
// duração da sessão (opcional). Salva de verdade com POST /posts.

import { useState, type FormEvent } from "react";

import { Avatar } from "@/components/Avatar";
import { apiPost, type Autor, type Post } from "@/lib/api";
import { useOpcoes } from "@/lib/opcoes";

// Os mesmos limites do backend (schemas/post.py), para avisar antes de enviar.
const MAX_TEXTO = 1000;
const MAX_MINUTOS = 1440;

export function FormPost({
  autor,
  onPostado,
}: {
  autor?: Pick<Autor, "name" | "avatar_url">;
  // Quem usa o formulário decide o que fazer com o post novo (ex.: pôr no topo da lista).
  onPostado?: (post: Post) => void;
}) {
  const opcoes = useOpcoes();
  const [aberto, setAberto] = useState(false);
  const [texto, setTexto] = useState("");
  const [tag, setTag] = useState("");
  const [minutos, setMinutos] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const campo = "rounded-lg border border-linha bg-superficie px-2 py-1.5 text-sm text-tinta";

  function fechar() {
    setAberto(false);
    setTexto("");
    setTag("");
    setMinutos("");
    setErro(null);
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (!texto.trim() || !tag) return; // o navegador já avisa nos campos obrigatórios
    setEnviando(true);
    setErro(null);
    try {
      const post = await apiPost<Post>("/posts", {
        texto: texto.trim(),
        tag,
        minutos: minutos ? Number(minutos) : null,
      });
      onPostado?.(post);
      fechar();
    } catch (falha) {
      // O texto fica no campo: ninguém perde o que escreveu por causa de um erro.
      setErro(falha instanceof Error ? falha.message : "Não deu para postar. Tente de novo.");
    } finally {
      setEnviando(false);
    }
  }

  if (!aberto) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-linha bg-superficie p-2 pl-3">
        {autor && <Avatar autor={autor} />}
        <button
          type="button"
          onClick={() => setAberto(true)}
          className="min-w-0 flex-1 truncate rounded-lg px-2 py-1.5 text-left text-tinta-suave hover:bg-fundo"
        >
          O que você estudou agora?
        </button>
        <button
          type="button"
          onClick={() => setAberto(true)}
          className="whitespace-nowrap rounded-lg bg-destaque px-3 py-1.5 text-sm font-semibold text-sobre-destaque"
        >
          Postar
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="space-y-2 rounded-2xl border border-destaque bg-superficie p-3">
      <div className="flex gap-3">
        {autor && <Avatar autor={autor} />}
        <textarea
          autoFocus
          required
          rows={2}
          maxLength={MAX_TEXTO}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="O que você estudou agora?"
          aria-label="O que você estudou agora?"
          className="min-w-0 flex-1 resize-none bg-transparent py-1 font-light text-tinta outline-none placeholder:text-tinta-suave"
        />
      </div>

      <div className={`flex flex-wrap items-center gap-2 ${autor ? "pl-11" : ""}`}>
        <select
          required
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          aria-label="Matéria"
          className={campo}
        >
          <option value="" disabled>
            {opcoes ? "Matéria" : "Carregando..."}
          </option>
          {opcoes?.tags.map((t) => (
            <option key={t.valor} value={t.valor}>
              {t.nome}
            </option>
          ))}
        </select>
        <input
          type="number"
          min={1}
          max={MAX_MINUTOS}
          value={minutos}
          onChange={(e) => setMinutos(e.target.value)}
          placeholder="Tempo de estudo"
          aria-label="Tempo de estudo em minutos (opcional)"
          title="Em minutos (opcional)"
          className={campo + " w-40 font-numeros placeholder:font-texto"}
        />
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={fechar}
            className="rounded-lg px-3 py-1.5 text-sm text-tinta-suave hover:text-tinta"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={enviando || !texto.trim() || !tag}
            className="rounded-lg bg-destaque px-3 py-1.5 text-sm font-semibold text-sobre-destaque disabled:opacity-50"
          >
            {enviando ? "Postando..." : "Postar"}
          </button>
        </div>
      </div>

      {erro && (
        <p role="alert" className="text-sm text-tinta">
          {erro}
        </p>
      )}
    </form>
  );
}
