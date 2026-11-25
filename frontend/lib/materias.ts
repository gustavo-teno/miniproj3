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

// Paleta por área de conhecimento (24/11, ideia da Camila): uma cor por área,
// igual para todas as matérias dela (o símbolo e o nome diferenciam uma da
// outra). O lavanda e o roxo ficam só para a rede (botões, "Todas"). Todas as
// cores passam no contraste de leitura (4,5) nos dois modos.
const EXATAS: CorTag = { claro: { fundo: "#8fc1ff", texto: "#0048a1" }, noturno: { fundo: "#17304f", texto: "#4a99fa" } };
const NATUREZA: CorTag = { claro: { fundo: "#bdffcd", texto: "#007d1f" }, noturno: { fundo: "#194324", texto: "#47f572" } };
const LINGUAGENS: CorTag = { claro: { fundo: "#ffbdbf", texto: "#b20006" }, noturno: { fundo: "#43191b", texto: "#f6555b" } };
const HUMANAS: CorTag = { claro: { fundo: "#fff4bd", texto: "#826c00" }, noturno: { fundo: "#433c19", texto: "#f5d847" } };
const IDIOMAS: CorTag = { claro: { fundo: "#ffd9bd", texto: "#a34700" }, noturno: { fundo: "#432b19", texto: "#f59247" } };
const BATE_PAPO: CorTag = { claro: { fundo: "#eef0f0", texto: "#4f5a5c" }, noturno: { fundo: "#262c35", texto: "#c3cad4" } };

// Cada matéria aponta para a cor da sua área: mudar a cor de uma área é
// mudar uma linha só.
const CORES: Record<string, CorTag> = {
  matematica: EXATAS,
  fisica: NATUREZA,
  quimica: NATUREZA,
  biologia: NATUREZA,
  portugues: LINGUAGENS,
  literatura: LINGUAGENS,
  redacao: LINGUAGENS,
  historia: HUMANAS,
  geografia: HUMANAS,
  filosofia: HUMANAS,
  sociologia: HUMANAS,
  ingles: IDIOMAS,
  espanhol: IDIOMAS,
  "bate-papo": BATE_PAPO,
};

// Tag nova no backend sem cor aqui ainda: aparece cinza em vez de quebrar.
const COR_PADRAO = BATE_PAPO;

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
