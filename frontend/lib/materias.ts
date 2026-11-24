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

// Paleta de 24/11 (feedback do Gustavo): cada matéria com uma cor própria e
// viva, espalhada pela roda de cores e fora da faixa do lavanda/roxo, que fica
// só para a rede (botões, "Todas"). Todas passam no contraste de leitura (4,5)
// nos dois modos.
const CORES: Record<string, CorTag> = {
  matematica: { claro: { fundo: "#bdd7ff", texto: "#0052cc" }, noturno: { fundo: "#192a43", texto: "#5193f6" } },
  fisica: { claro: { fundo: "#bdffff", texto: "#007a7a" }, noturno: { fundo: "#194343", texto: "#47f5f5" } },
  quimica: { claro: { fundo: "#bdffe3", texto: "#007a47" }, noturno: { fundo: "#194331", texto: "#47f5ad" } },
  biologia: { claro: { fundo: "#bdffbd", texto: "#007f00" }, noturno: { fundo: "#194319", texto: "#47f547" } },
  portugues: { claro: { fundo: "#ffbfbd", texto: "#b20600" }, noturno: { fundo: "#431b19", texto: "#f65b55" } },
  literatura: { claro: { fundo: "#ffbdd5", texto: "#b20041" }, noturno: { fundo: "#431928", texto: "#f6518d" } },
  redacao: { claro: { fundo: "#ffd5bd", texto: "#a83e00" }, noturno: { fundo: "#432819", texto: "#f58747" } },
  historia: { claro: { fundo: "#fff9bd", texto: "#7a7000" }, noturno: { fundo: "#433f19", texto: "#f5e747" } },
  geografia: { claro: { fundo: "#e7ffbd", texto: "#4e7a00" }, noturno: { fundo: "#334319", texto: "#b5f547" } },
  filosofia: { claro: { fundo: "#f1d8c6", texto: "#8a5328" }, noturno: { fundo: "#3c2c20", texto: "#ca9872" } },
  sociologia: { claro: { fundo: "#ffbdeb", texto: "#a80076" }, noturno: { fundo: "#431936", texto: "#f64cc3" } },
  ingles: { claro: { fundo: "#bdebff", texto: "#006b99" }, noturno: { fundo: "#193643", texto: "#47c1f5" } },
  espanhol: { claro: { fundo: "#ffe9bd", texto: "#8f5f00" }, noturno: { fundo: "#433519", texto: "#f5bb47" } },
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
