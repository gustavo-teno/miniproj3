"use client";

// "Postar no diário" (#10, Pessoa B), no desenho aprovado em 24/11: uma caixa
// na coluna da direita, com o título, um campo grande para escrever, a matéria
// (a do caderno aberto já vem marcada), o tempo de estudo e o botão na largura
// toda. Salva com o mesmo POST /posts do feed.

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";

import { AnexarImagem } from "@/components/AnexarImagem";
import { BotaoEmoji, inserirNoCursor } from "@/components/BotaoEmoji";
import { SimboloMateria } from "@/components/SimboloMateria";
import { apiPost, type Post } from "@/lib/api";
import { enviarImagem } from "@/lib/imagem";
import { estiloDaTag } from "@/lib/materias";
import { useOpcoes } from "@/lib/opcoes";

// Os mesmos limites do backend (schemas/post.py).
const MAX_TEXTO = 1000;
const MAX_MINUTOS = 1440;

export function PostarNoDiario({ tagInicial, onPostado }: { tagInicial: string; onPostado: (post: Post) => void }) {
  const opcoes = useOpcoes();
  const [texto, setTexto] = useState("");
  const [tag, setTag] = useState(tagInicial);
  const [minutos, setMinutos] = useState("");
  // A foto do caderno ou da lista (#105), já reduzida. Sobe depois do post.
  const [imagem, setImagem] = useState<Blob | null>(null);
  const mudarImagem = useCallback((b: Blob | null) => setImagem(b), []);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const caixaTexto = useRef<HTMLTextAreaElement>(null);
  // Já escreveu, mas ainda não escolheu a matéria: é o que deixa o Postar apagado.
  const faltaMateria = texto.trim() !== "" && !tag;

  // Trocou de caderno: a matéria marcada acompanha. Em "Todas" (""), fica a
  // que a pessoa já tinha escolhido.
  useEffect(() => {
    if (tagInicial) setTag(tagInicial);
  }, [tagInicial]);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (!texto.trim() || !tag) return;
    setEnviando(true);
    setErro(null);
    try {
      const post = await apiPost<Post>("/posts", {
        texto: texto.trim(),
        tag,
        minutos: minutos ? Number(minutos) : null,
      });
      let falhaNaImagem: string | null = null;
      if (imagem) {
        try {
          await enviarImagem(post.id, imagem);
          post.tem_imagem = true;
        } catch (falha) {
          // O post já existe: ele aparece, e o aviso diz que a imagem não foi.
          falhaNaImagem = `O post foi publicado, mas a imagem não subiu. ${falha instanceof Error ? falha.message : ""}`.trim();
        }
      }
      onPostado(post);
      setTexto("");
      setMinutos("");
      setImagem(null);
      if (falhaNaImagem) setErro(falhaNaImagem);
    } catch (falha) {
      // O texto fica no campo: ninguém perde o que escreveu por causa de um erro.
      setErro(falha instanceof Error ? falha.message : "Não foi possível postar. Tente de novo.");
    } finally {
      setEnviando(false);
    }
  }

  const campo = "rounded-lg border border-linha bg-superficie px-2 py-1 text-sm";

  return (
    <form
      onSubmit={enviar}
      aria-label="Postar no diário"
      className="flex h-[280px] flex-col gap-3 lg:h-[var(--altura-bloco-diario)] rounded-2xl border border-linha bg-superficie p-4"
    >
      <h2 className="text-[17px] font-semibold">Postar no diário</h2>

      <textarea
        ref={caixaTexto}
        required
        maxLength={MAX_TEXTO}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="O que você estudou agora?"
        aria-label="O que você estudou agora?"
        className="pauta pauta-campo min-h-0 flex-1 resize-none rounded-[10px] border border-linha bg-superficie px-3.5 py-3 text-sm font-light leading-5 text-tinta outline-none [--altura-linha:20px] placeholder:text-tinta-suave focus:border-destaque"
      />

      <div className="flex flex-wrap items-center gap-1.5">
        {/* A matéria aparece com a cor e o símbolo dela, como uma etiqueta. */}
        <label
          className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold ${tag ? "cor-materia" : "border border-linha text-tinta-suave"}`}
          style={tag ? estiloDaTag(tag) : undefined}
        >
          {tag && <SimboloMateria tag={tag} className="size-3.5" />}
          <select
            required
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            aria-label="Matéria"
            className="max-w-28 bg-transparent outline-none"
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
        </label>
        <AnexarImagem imagem={imagem} aoMudar={mudarImagem} aoErro={setErro} bloqueado={tag === "bate-papo"} />
        {/* O emoji (Pessoa A) na linha de baixo do campo, depois da matéria. */}
        <BotaoEmoji
          abrirPara="baixo"
          aoEscolher={(emoji) => setTexto(inserirNoCursor(caixaTexto.current, texto, emoji, MAX_TEXTO))}
        />
        <input
          type="number"
          min={1}
          max={MAX_MINUTOS}
          value={minutos}
          onChange={(e) => setMinutos(e.target.value)}
          placeholder="Tempo de estudo"
          aria-label="Tempo de estudo em minutos (opcional)"
          title="Em minutos (opcional)"
          className={`${campo} min-w-[11.5rem] flex-1 font-numeros text-tinta placeholder:font-texto placeholder:text-tinta-suave`}
        />
      </div>

      {erro && (
        <p role="alert" className="rounded-lg border border-erro bg-erro-fundo p-2 text-sm text-erro">
          {erro}
        </p>
      )}

      {/* O botão fica apagado até escolher a matéria: sem este aviso, quem já
          escreveu não entendia o que faltava (#131). */}
      {faltaMateria && !erro && (
        <p id="diario-falta-materia" className="text-sm text-tinta-suave">
          Escolha a matéria (ou Bate-papo) para postar.
        </p>
      )}

      <button
        type="submit"
        disabled={enviando || !texto.trim() || !tag}
        aria-describedby={faltaMateria ? "diario-falta-materia" : undefined}
        className="rounded-lg bg-destaque py-2.5 text-sm font-semibold text-sobre-destaque disabled:opacity-50"
      >
        {enviando ? "Postando..." : "Postar"}
      </button>
    </form>
  );
}
