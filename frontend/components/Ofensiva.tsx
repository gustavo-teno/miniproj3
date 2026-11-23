"use client";

// A ofensiva de uma pessoa (#7, Pessoa A; decisão 4): o fogo, o número de dias
// seguidos, o recorde quando a ofensiva quebrou e as horas da semana. A Pessoa
// B só põe <Ofensiva username=... /> no topo do perfil.
//
// O fogo muda de cor com a ofensiva, como a temperatura de uma chama. Para não
// depender só da cor, há uma legenda:
// - com mouse: passar por cima mostra "N dias seguidos"; clicar abre a legenda;
// - no celular: tocar mostra "N dias seguidos" com uma setinha; tocar na
//   setinha abre a legenda.

import { useEffect, useRef, useState, type CSSProperties } from "react";

import { buscarEu, buscarOfensiva, type Ofensiva as DadosOfensiva } from "@/lib/api";
import { duracao } from "@/lib/tempo";

type Cores = { fogo: string; contorno: string };
type Faixa = { de: number; ate: number | null; cor: string; claro: Cores; noturno: Cores };

// Do mais frio ao mais quente. Sem nomes de nível, para não virar comparação.
// Tons provisórios: a Camila ajusta (combinado em 22/11). O branco ganha um
// contorno cinza no modo claro para não sumir no fundo.
const FAIXAS: Faixa[] = [
  { de: 1, ate: 6, cor: "vermelho", claro: { fogo: "#e0483a", contorno: "#a8281d" }, noturno: { fogo: "#f0675a", contorno: "#f0675a" } },
  { de: 7, ate: 13, cor: "laranja", claro: { fogo: "#f08a24", contorno: "#b55d0b" }, noturno: { fogo: "#f5a04a", contorno: "#f5a04a" } },
  { de: 14, ate: 29, cor: "amarelo", claro: { fogo: "#f2c230", contorno: "#a37c08" }, noturno: { fogo: "#f5d25c", contorno: "#f5d25c" } },
  { de: 30, ate: 59, cor: "branco", claro: { fogo: "#ffffff", contorno: "#8f979c" }, noturno: { fogo: "#f4f2ec", contorno: "#f4f2ec" } },
  { de: 60, ate: 99, cor: "azul-claro", claro: { fogo: "#7cc8f0", contorno: "#2f86b8" }, noturno: { fogo: "#9ad6f7", contorno: "#9ad6f7" } },
  { de: 100, ate: null, cor: "azul", claro: { fogo: "#2f6fe0", contorno: "#1d4ea8" }, noturno: { fogo: "#6f9cf2", contorno: "#6f9cf2" } },
];

// Ofensiva zero: o fogo fica apagado, só o contorno.
const APAGADO: Pick<Faixa, "claro" | "noturno"> = {
  claro: { fogo: "transparent", contorno: "#9aa4a6" },
  noturno: { fogo: "transparent", contorno: "#6b7480" },
};

function faixaDa(dias: number): Faixa | null {
  return FAIXAS.find((f) => dias >= f.de && (f.ate === null || dias <= f.ate)) ?? null;
}

function estiloDoFogo(faixa: Pick<Faixa, "claro" | "noturno">): CSSProperties {
  return {
    "--fogo": faixa.claro.fogo,
    "--fogo-contorno": faixa.claro.contorno,
    "--fogo-noturno": faixa.noturno.fogo,
    "--fogo-contorno-noturno": faixa.noturno.contorno,
  } as CSSProperties;
}

function Fogo({ faixa, className }: { faixa: Pick<Faixa, "claro" | "noturno">; className: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={`cor-fogo ${className}`} style={estiloDoFogo(faixa)} strokeWidth={1.6} strokeLinejoin="round">
      <path d="M12 2.5c.6 3.2 3.4 5 4.9 7.8 1.9 3.5.4 8.7-4.9 9.2-5.2-.5-6.8-5.2-5-8.6.5 1.4 1.4 2.2 2.4 2.4-.8-3.9.6-7.6 2.6-10.8z" />
    </svg>
  );
}

function intervalo(f: Faixa): string {
  return f.ate === null ? `${f.de} dias ou mais` : `${f.de} a ${f.ate} dias`;
}

function horas(minutos: number): string {
  return minutos ? duracao(minutos) : "0h";
}

function diasSeguidos(n: number): string {
  return n === 1 ? "1 dia seguido" : `${n} dias seguidos`;
}

export function Ofensiva({ username }: { username: string }) {
  const [dados, setDados] = useState<DadosOfensiva | null>(null);
  const [erro, setErro] = useState(false);
  // Os avisos ("estude hoje", folgas) falam com a pessoa: só no próprio perfil.
  const [meuPerfil, setMeuPerfil] = useState(false);
  const [balao, setBalao] = useState(false); // "N dias seguidos"
  const [legenda, setLegenda] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);
  const botao = useRef<HTMLButtonElement>(null);
  // Como foi o último toque no fogo: "touch" (dedo), "mouse" ou "pen".
  const tipoDoToque = useRef("");

  useEffect(() => {
    let ativo = true;
    setDados(null);
    setErro(false);
    setMeuPerfil(false);
    buscarOfensiva(username)
      .then((d) => ativo && setDados(d))
      .catch(() => ativo && setErro(true));
    buscarEu()
      .then((eu) => ativo && setMeuPerfil(eu.username === username))
      .catch(() => {}); // sem saber quem é, os avisos ficam escondidos
    return () => {
      ativo = false;
    };
  }, [username]);

  // Fecha o balão e a legenda ao tocar fora ou apertar Esc.
  useEffect(() => {
    if (!balao && !legenda) return;
    function toqueFora(e: PointerEvent) {
      if (caixa.current && !caixa.current.contains(e.target as Node)) {
        setBalao(false);
        setLegenda(false);
      }
    }
    function esc(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setBalao(false);
        setLegenda(false);
        botao.current?.focus();
      }
    }
    document.addEventListener("pointerdown", toqueFora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", toqueFora);
      document.removeEventListener("keydown", esc);
    };
  }, [balao, legenda]);

  if (erro) return <p className="text-sm text-tinta-suave">Não deu para carregar a ofensiva.</p>;
  if (!dados) return <div role="status" className="h-14 w-48 animate-pulse rounded-xl bg-linha" aria-label="Carregando a ofensiva" />;

  const faixa = faixaDa(dados.atual);
  const quebrou = dados.recorde > dados.atual;
  const folgasSobrando = dados.folgas_por_semana - dados.folgas_usadas_na_semana;

  function clicarNoFogo() {
    if (tipoDoToque.current === "touch") {
      // No celular o primeiro toque só mostra o balão (não há "passar por cima").
      setBalao((b) => !b);
      setLegenda(false);
    } else {
      // Mouse e teclado vão direto para a legenda.
      setLegenda((l) => !l);
      setBalao(false);
    }
    tipoDoToque.current = "";
  }

  return (
    <div ref={caixa} className="relative inline-flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <button
          ref={botao}
          type="button"
          onPointerDown={(e) => (tipoDoToque.current = e.pointerType)}
          onPointerEnter={(e) => e.pointerType === "mouse" && !legenda && setBalao(true)}
          onPointerLeave={(e) => e.pointerType === "mouse" && setBalao(false)}
          onClick={clicarNoFogo}
          aria-expanded={legenda}
          aria-label={`${diasSeguidos(dados.atual)}. Ver a legenda das cores do fogo`}
          className="flex items-center gap-1.5 rounded-xl px-1.5 py-1 hover:bg-destaque-fundo"
        >
          <Fogo faixa={faixa ?? APAGADO} className="size-8" />
          <span className="font-numeros text-3xl font-semibold leading-none">{dados.atual}</span>
        </button>

        <div className="text-sm leading-tight">
          <p>{dados.atual === 1 ? "dia seguido" : "dias seguidos"}</p>
          {quebrou && <p className="text-tinta-suave">recorde: {dados.recorde}</p>}
        </div>
      </div>

      <p className="text-sm text-tinta-suave">
        esta semana: <span className="font-numeros text-tinta">{horas(dados.minutos_esta_semana)}</span>
        {" · "}semana passada: <span className="font-numeros text-tinta">{horas(dados.minutos_semana_passada)}</span>
      </p>

      {meuPerfil &&
        (dados.precisa_estudar_hoje ? (
          <p className="text-sm text-destaque">Estude hoje para não perder a ofensiva.</p>
        ) : (
          dados.atual > 0 && (
            <p className="text-sm text-tinta-suave">
              {folgasSobrando === 1 ? "1 folga sobrando" : `${folgasSobrando} folgas sobrando`} esta semana
            </p>
          )
        ))}

      {balao && !legenda && (
        <div role="status" className="absolute left-0 top-full z-10 mt-1 flex items-center gap-1 rounded-lg border border-linha bg-superficie py-1 pl-3 pr-1 text-sm shadow-md">
          {diasSeguidos(dados.atual)}
          <button
            type="button"
            onClick={() => {
              setLegenda(true);
              setBalao(false);
            }}
            aria-label="Ver a legenda das cores do fogo"
            className="grid size-7 place-items-center rounded-md text-tinta-suave hover:bg-destaque-fundo"
          >
            <svg viewBox="0 0 24 24" aria-hidden className="size-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 6 6 6-6 6" />
            </svg>
          </button>
        </div>
      )}

      {legenda && (
        <div className="absolute left-0 top-full z-10 mt-1 w-64 rounded-xl border border-linha bg-superficie p-3 shadow-md">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold">A cor do fogo</p>
            <button
              type="button"
              onClick={() => {
                setLegenda(false);
                botao.current?.focus();
              }}
              aria-label="Fechar a legenda"
              className="grid size-7 place-items-center rounded-md text-tinta-suave hover:bg-destaque-fundo"
            >
              <svg viewBox="0 0 24 24" aria-hidden className="size-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
          <ul className="space-y-0.5 text-sm">
            {FAIXAS.map((f) => {
              const daPessoa = f === faixa;
              return (
                <li key={f.cor} className={`flex items-center gap-2 rounded-lg px-2 py-1 ${daPessoa ? "bg-destaque-fundo font-semibold" : ""}`}>
                  <Fogo faixa={f} className="size-5 flex-none" />
                  <span className="flex-1">{intervalo(f)}</span>
                  {daPessoa && <span className="text-xs text-destaque">agora</span>}
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-xs text-tinta-suave">
            Se a ofensiva quebrar, o fogo apaga e recomeça no vermelho. Folga mantém a ofensiva, mas não soma dia.
          </p>
        </div>
      )}
    </div>
  );
}
