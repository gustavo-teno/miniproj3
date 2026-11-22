// Uma cor e um símbolo por matéria (direção visual de 22/11). É o único mapa
// das tags: toda tela que mostra uma matéria usa corDaTag() e <SimboloMateria>.
//
// Só o visual mora no front. A lista de tags e os nomes ("Matemática") vêm de
// GET /opcoes (ver lib/opcoes.ts), que lê backend/app/constantes.py.

import type { CSSProperties } from "react";

// Fundo suave e texto/símbolo forte, da mesma família de cor. No noturno os
// papéis se invertem: fundo escuro e símbolo claro.
type Par = { fundo: string; texto: string };
export type CorTag = { claro: Par; noturno: Par };

const CORES: Record<string, CorTag> = {
  matematica: { claro: { fundo: "#e7eefc", texto: "#2f5bb7" }, noturno: { fundo: "#243049", texto: "#a8c0f5" } },
  fisica: { claro: { fundo: "#ece9fb", texto: "#5b45b8" }, noturno: { fundo: "#2e2a48", texto: "#c2b6f5" } },
  quimica: { claro: { fundo: "#e2f4f1", texto: "#157a70" }, noturno: { fundo: "#1c3633", texto: "#8fd9cd" } },
  biologia: { claro: { fundo: "#e6f4e8", texto: "#2e7d3e" }, noturno: { fundo: "#213626", texto: "#9ad9a7" } },
  portugues: { claro: { fundo: "#fce9e7", texto: "#b23a2e" }, noturno: { fundo: "#3d2522", texto: "#f2a99f" } },
  literatura: { claro: { fundo: "#fbe8f0", texto: "#a3305f" }, noturno: { fundo: "#3d2230", texto: "#f0a6c4" } },
  redacao: { claro: { fundo: "#fdeedf", texto: "#b05a12" }, noturno: { fundo: "#3d2b1a", texto: "#f3bc85" } },
  historia: { claro: { fundo: "#f8f0dc", texto: "#8a6411" }, noturno: { fundo: "#383019", texto: "#e6cb82" } },
  geografia: { claro: { fundo: "#eef4de", texto: "#5e7a16" }, noturno: { fundo: "#2e361a", texto: "#c6dd8a" } },
  filosofia: { claro: { fundo: "#f1eaf8", texto: "#7a3fa0" }, noturno: { fundo: "#322745", texto: "#d2b3ee" } },
  sociologia: { claro: { fundo: "#faeaf6", texto: "#973a84" }, noturno: { fundo: "#3d253a", texto: "#e9a9da" } },
  ingles: { claro: { fundo: "#e4f1fa", texto: "#1e6c9e" }, noturno: { fundo: "#1c3442", texto: "#93cbee" } },
  espanhol: { claro: { fundo: "#fdf5d8", texto: "#8c6a00" }, noturno: { fundo: "#393318", texto: "#edd67a" } },
  "bate-papo": { claro: { fundo: "#eef0f0", texto: "#4f5a5c" }, noturno: { fundo: "#262c35", texto: "#c3cad4" } },
};

// Tag nova no backend sem cor aqui ainda: aparece cinza em vez de quebrar.
const COR_PADRAO = CORES["bate-papo"];

export function corDaTag(tag: string): CorTag {
  return CORES[tag] ?? COR_PADRAO;
}

// As quatro cores da tag como variáveis CSS. Junto com a classe "cor-materia"
// (globals.css), o elemento usa o par claro ou o noturno sozinho, conforme o
// modo da tela.
export function estiloDaTag(tag: string): CSSProperties {
  const { claro, noturno } = corDaTag(tag);
  return {
    "--materia-fundo": claro.fundo,
    "--materia-texto": claro.texto,
    "--materia-fundo-noturno": noturno.fundo,
    "--materia-texto-noturno": noturno.texto,
  } as CSSProperties;
}
