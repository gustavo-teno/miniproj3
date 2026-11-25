"use client";

// Botão de seguir (#15, Pessoa D). Usado no perfil (/u/[username], Pessoa B)
// e na página da turma (D):  <BotaoSeguir username="ana" />
//
// Ele mesmo pergunta ao backend se você já segue a pessoa (GET
// /usuarios/{username}/follow) e some no seu próprio perfil. onMudou avisa a
// página quando o número de seguidores muda, para ela atualizar o contador.

import { useEffect, useState } from "react";

import { apiDelete, apiGet, apiPost } from "@/lib/api";

// Espelha EstadoFollow em backend/app/routers/follows.py.
type EstadoFollow = {
  seguindo: boolean;
  seguidores: number;
  eu_mesmo: boolean;
};

type Props = {
  username: string;
  onMudou?: (seguidores: number) => void;
};

export function BotaoSeguir({ username, onMudou }: Props) {
  // null = ainda carregando: o botão não aparece até saber o estado certo,
  // para não mostrar "Seguir" para quem você já segue.
  const [estado, setEstado] = useState<EstadoFollow | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    // Se o username mudar antes da resposta chegar, a resposta velha é ignorada.
    let valendo = true;
    apiGet<EstadoFollow>(`/usuarios/${encodeURIComponent(username)}/follow`)
      .then((e) => valendo && setEstado(e))
      .catch(() => valendo && setErro("Não foi possível carregar."));
    return () => {
      valendo = false;
    };
  }, [username]);

  async function alternar() {
    if (!estado || enviando) return;
    setEnviando(true);
    setErro(null);
    const caminho = `/usuarios/${encodeURIComponent(username)}/follow`;
    try {
      if (estado.seguindo) await apiDelete(caminho);
      else await apiPost<void>(caminho);
      // Relê do backend em vez de fazer a conta aqui: o número fica certo
      // mesmo que outra pessoa tenha seguido nesse meio-tempo.
      const novo = await apiGet<EstadoFollow>(caminho);
      setEstado(novo);
      onMudou?.(novo.seguidores);
    } catch {
      // Sempre o texto da ação: a mensagem do servidor vinha na frente e podia
      // ser "erro 500", que não diz à pessoa o que fazer.
      setErro(
        estado.seguindo
          ? "Não foi possível deixar de seguir este usuário. Tente de novo."
          : "Não foi possível seguir este usuário. Tente de novo.",
      );
    } finally {
      setEnviando(false);
    }
  }

  if (erro && !estado) return <span className="text-sm text-tinta-suave">{erro}</span>;
  if (!estado || estado.eu_mesmo) return null;

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={alternar}
        disabled={enviando}
        className={
          "whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold disabled:opacity-50 " +
          (estado.seguindo
            ? "border border-linha bg-superficie text-tinta hover:bg-fundo"
            : "bg-destaque text-sobre-destaque")
        }
      >
        {/* O estado vai no texto (Seguir / Seguindo): com o aria-pressed junto, o leitor
            de tela lia "Seguindo, pressionado". */}
        {estado.seguindo ? "Seguindo" : "Seguir"}
      </button>
      {erro && <span className="text-xs text-tinta-suave">{erro}</span>}
    </span>
  );
}
