"use client";

// RASCUNHO do feed: filtros só por matéria à esquerda e o atalho de postar em
// cima da lista (o "design 7", escolhido em 22/11 no lugar do atalho preso no
// pé da tela). Usa as
// cores, fontes e símbolos de verdade, mas os posts são de mentira (nada vem
// da API). Quando o feed de verdade existir, ele segue este e a pasta sai.

import { useRef, useState, type Dispatch, type SetStateAction } from "react";

import { BotaoCurtir } from "@/components/BotaoCurtir";
import { CardPost } from "@/components/CardPost";
import { LinkComentarios } from "@/components/Comentarios";
import { FormPost } from "@/components/FormPost";
import { SimboloMateria } from "@/components/SimboloMateria";
import type { Post } from "@/lib/api";
import { estiloDaTag } from "@/lib/materias";

// Os nomes ficam aqui só porque o rascunho não fala com o backend. No feed de
// verdade eles vêm de GET /opcoes (useOpcoes).
const MATERIAS = [
  { valor: "matematica", nome: "Matemática" },
  { valor: "fisica", nome: "Física" },
  { valor: "quimica", nome: "Química" },
  { valor: "biologia", nome: "Biologia" },
  { valor: "portugues", nome: "Português" },
  { valor: "literatura", nome: "Literatura" },
  { valor: "redacao", nome: "Redação" },
  { valor: "historia", nome: "História" },
  { valor: "geografia", nome: "Geografia" },
  { valor: "filosofia", nome: "Filosofia" },
  { valor: "sociologia", nome: "Sociologia" },
  { valor: "ingles", nome: "Inglês" },
  { valor: "espanhol", nome: "Espanhol" },
];
// O bate-papo é a tag dos posts que não são de uma matéria (decisão 2).
const BATE_PAPO = { valor: "bate-papo", nome: "Bate-papo" };
const NOMES: Record<string, string> = Object.fromEntries(
  [...MATERIAS, BATE_PAPO].map((m) => [m.valor, m.nome]),
);

// Os posts de mentira, mais as curtidas e os comentários que a Pessoa C ainda
// vai criar. Viram um Post de verdade em paraPost(), para usar o <CardPost>.
type PostFalso = {
  id: number;
  autor: string;
  minutosAtras: number; // há quanto tempo foi postado
  tag: string;
  minutos?: number;
  texto: string;
  comentarios: number;
  curtidas: number;
};

function paraPost(p: PostFalso): Post {
  return {
    id: -p.id, // negativo para não bater com o id de um post de verdade
    autor: { id: 0, username: p.autor.split(" ")[0].toLowerCase(), name: p.autor, avatar_url: "" },
    texto: p.texto,
    tag: p.tag,
    minutos: p.minutos ?? null,
    created_at: new Date(Date.now() - p.minutosAtras * 60000).toISOString(),
    comentarios: p.comentarios,
    curtidas: p.curtidas,
    curtido_por_mim: false,
  };
}

const POSTS_FALSOS: PostFalso[] = [
  { id: 1, autor: "Maria Eduarda", minutosAtras: 25, tag: "biologia", minutos: 90,
    texto: "Revisei genética e fiz 20 questões de heredograma. Errei 6; amanhã refaço as de probabilidade.",
    comentarios: 4, curtidas: 12 },
  { id: 2, autor: "Caio Ramos", minutosAtras: 130, tag: "matematica", minutos: 135,
    texto: "Travei no tronco de cone, alguém tem uma dica de como visualizar?", comentarios: 9, curtidas: 7 },
  { id: 3, autor: "Bia Costa", minutosAtras: 190, tag: "redacao", minutos: 50,
    texto: "Comecem a redação pela proposta de intervenção, mudou tudo pra mim.", comentarios: 4, curtidas: 21 },
  { id: 4, autor: "Júlia Nogueira", minutosAtras: 245, tag: "bate-papo",
    texto: "Simulado amanhã cedo. Alguém mais vai dormir às 22h hoje pra ver se funciona?", comentarios: 15, curtidas: 21 },
  { id: 5, autor: "Pedro Lima", minutosAtras: 310, tag: "quimica", minutos: 60,
    texto: "Estequiometria finalmente fez sentido. Fiz a lista toda sem olhar o gabarito.", comentarios: 2, curtidas: 9 },
  { id: 6, autor: "Ana Clara", minutosAtras: 1600, tag: "historia", minutos: 45,
    texto: "Linha do tempo da Era Vargas num papel só, colada na parede. Ajuda demais.", comentarios: 3, curtidas: 14 },
  { id: 7, autor: "Lucas Andrade", minutosAtras: 40, tag: "fisica", minutos: 75,
    texto: "Cinemática: desenhar o gráfico v × t antes de fazer conta resolveu metade das questões.", comentarios: 3, curtidas: 11 },
  { id: 8, autor: "Rafaela Souza", minutosAtras: 70, tag: "bate-papo",
    texto: "Alguém mais estuda melhor de manhã cedo? Tô pensando em trocar a rotina.", comentarios: 18, curtidas: 25 },
  { id: 9, autor: "Gabriel Torres", minutosAtras: 100, tag: "matematica", minutos: 120,
    texto: "Lista de PA e PG feita. A fórmula da soma da PG infinita finalmente entrou na cabeça.", comentarios: 1, curtidas: 8 },
  { id: 10, autor: "Larissa Mendes", minutosAtras: 160, tag: "literatura", minutos: 40,
    texto: "Reli o resumo de Memórias Póstumas de Brás Cubas. O narrador defunto é muito bom.", comentarios: 6, curtidas: 17 },
  { id: 11, autor: "Thiago Rocha", minutosAtras: 220, tag: "geografia", minutos: 55,
    texto: "Climas do Brasil num mapa colorido: agora consigo diferenciar semiárido de tropical.", comentarios: 2, curtidas: 6 },
  { id: 12, autor: "Camila Freitas", minutosAtras: 280, tag: "ingles", minutos: 30,
    texto: "Treinei interpretação com 3 textos de prova antiga. Ler as perguntas antes ajuda muito.", comentarios: 4, curtidas: 10 },
  { id: 13, autor: "Beatriz Lopes", minutosAtras: 360, tag: "filosofia", minutos: 35,
    texto: "Mito da caverna explicado com série de TV. Fixou melhor que o livro.", comentarios: 5, curtidas: 13 },
  { id: 14, autor: "João Pedro", minutosAtras: 420, tag: "portugues", minutos: 50,
    texto: "Crase: se dá pra trocar por \"ao\", tem crase. Fiz 30 questões e errei só 2.", comentarios: 7, curtidas: 19 },
  { id: 15, autor: "Mariana Alves", minutosAtras: 540, tag: "sociologia", minutos: 45,
    texto: "Resumo de Durkheim, Weber e Marx em uma tabela de três colunas.", comentarios: 8, curtidas: 22 },
  { id: 16, autor: "Felipe Nunes", minutosAtras: 700, tag: "espanhol", minutos: 25,
    texto: "Falsos amigos que já caíram: \"exquisito\" é delicioso, não esquisito.", comentarios: 3, curtidas: 15 },
  { id: 17, autor: "Isabela Martins", minutosAtras: 900, tag: "bate-papo",
    texto: "Dia ruim, não rendeu nada. Amanhã volto. Tá tudo bem ter dias assim, né?", comentarios: 24, curtidas: 41 },
  { id: 18, autor: "Vinícius Melo", minutosAtras: 1200, tag: "redacao", minutos: 70,
    texto: "Primeira redação acima de 800! O repertório sociocultural fez diferença.", comentarios: 11, curtidas: 34 },
];

export function FeedRascunho() {
  // As matérias marcadas. Lista vazia = "Tudo".
  const [materias, setMaterias] = useState<string[]>([]);
  const [esconderBatePapo, setEsconderBatePapo] = useState(false);
  // Começa com os de mentira; o que você posta pelo formulário vai para o
  // banco de verdade e entra no topo.
  const [todos, setTodos] = useState<Post[]>(() =>
    // Do mais novo para o mais antigo, como no feed de verdade.
    [...POSTS_FALSOS].sort((x, y) => x.minutosAtras - y.minutosAtras).map(paraPost),
  );

  // O bate-papo não é matéria: só o botão dele decide se aparece, qualquer que
  // seja a matéria marcada. As matérias seguem a lista (ou todas, se vazia).
  // No feed de verdade essa escolha vai para a API (o feed é paginado).
  const posts = todos.filter((p) =>
    p.tag === BATE_PAPO.valor
      ? !esconderBatePapo
      : materias.length === 0 || materias.includes(p.tag),
  );

  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-[248px_1fr] lg:items-start">
        <Filtros
          materias={materias}
          setMaterias={setMaterias}
          esconderBatePapo={esconderBatePapo}
          setEsconderBatePapo={setEsconderBatePapo}
        />

        <div className="min-w-0 space-y-4">
          <FormPost onPostado={(novo) => setTodos((atuais) => [novo, ...atuais])} />

          <section aria-label="Posts" className="space-y-4">
            {posts.length ? (
              posts.map((p) => (
                <CardPost
                  key={p.id}
                  post={p}
                  rodape={
                    <>
                      {/* Os de mentira têm id negativo e não existem no backend. */}
                      {p.id > 0 ? (
                        <>
                          <LinkComentarios post={p} />
                          <BotaoCurtir post={p} />
                        </>
                      ) : (
                        <>
                          <span>{p.comentarios === 1 ? "1 comentário" : `${p.comentarios} comentários`}</span>
                          <span>{p.curtidas === 1 ? "1 curtida" : `${p.curtidas} curtidas`}</span>
                        </>
                      )}
                    </>
                  }
                />
              ))
            ) : (
              <p className="rounded-2xl border border-linha bg-superficie p-6 text-sm text-tinta-suave">
                Nenhum post com esses filtros por enquanto.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

type PropsFiltros = {
  materias: string[];
  // Aceita uma função, para marcar a partir da lista mais recente (dois cliques
  // rápidos não se atropelam).
  setMaterias: Dispatch<SetStateAction<string[]>>;
  esconderBatePapo: boolean;
  setEsconderBatePapo: (v: boolean) => void;
};

// Os filtros: as matérias e o "Esconder bate-papo". No computador ficam numa
// coluna à esquerda. No celular viram um botão "Filtros" que abre uma caixa
// subindo do pé da tela, para não ocupar espaço em cima do feed.
function Filtros(props: PropsFiltros) {
  const caixa = useRef<HTMLDialogElement>(null);
  const { materias, esconderBatePapo } = props;

  // O que está ligado aparece no próprio botão, para a pessoa saber que o
  // feed está filtrado (senão parece que sumiram posts). Com mais de duas
  // matérias, só o número, para o botão não estourar a linha.
  const ligados = [
    ...(materias.length > 2 ? [`${materias.length} matérias`] : materias.map((m) => NOMES[m])),
    ...(esconderBatePapo ? ["sem bate-papo"] : []),
  ];

  return (
    <>
      <aside
        aria-label="Filtrar por matéria"
        className="hidden min-w-0 rounded-2xl border border-linha bg-superficie p-3 lg:sticky lg:top-4 lg:block"
      >
        <ListaFiltros {...props} />
      </aside>

      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => caixa.current?.showModal()}
          className={
            "flex max-w-full items-center gap-2 rounded-lg border px-3 py-1.5 text-sm " +
            (ligados.length
              ? "border-destaque bg-destaque-fundo font-semibold text-destaque"
              : "border-linha bg-superficie text-tinta")
          }
        >
          <Icone d="M3 5h18M6 12h12M10 19h4" />
          <span className="truncate">{["Filtros", ...ligados].join(" · ")}</span>
        </button>

        {/* <dialog> com showModal(): o navegador já cuida do fundo escuro, de
            prender o foco do teclado na caixa e de fechar com Esc. */}
        <dialog
          ref={caixa}
          aria-label="Filtros"
          onClick={(e) => e.target === caixa.current && caixa.current?.close()}
          className="m-0 mt-auto max-h-[85vh] w-full max-w-none rounded-t-2xl bg-superficie p-4 pb-6 text-tinta backdrop:bg-black/40"
        >
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">Filtros</h2>
            {ligados.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  props.setMaterias([]);
                  props.setEsconderBatePapo(false);
                }}
                className="text-sm text-tinta-suave hover:text-tinta"
              >
                Limpar
              </button>
            )}
          </div>
          <ListaFiltros {...props} grande />
          <button
            type="button"
            onClick={() => caixa.current?.close()}
            className="mt-4 w-full rounded-lg bg-destaque py-2.5 font-semibold text-sobre-destaque"
          >
            Ver posts
          </button>
        </dialog>
      </div>
    </>
  );
}

// A lista em si, igual nos dois lugares. "grande" (celular) deixa cada item
// mais alto, mais fácil de tocar com o dedo, e põe as matérias em 2 colunas.
function ListaFiltros({
  materias,
  setMaterias,
  esconderBatePapo,
  setEsconderBatePapo,
  grande = false,
}: PropsFiltros & { grande?: boolean }) {
  const altura = grande ? "py-2.5" : "py-1.5";
  const item = (ativo: boolean) =>
    `flex w-full items-center gap-2.5 whitespace-nowrap rounded-lg px-2.5 ${altura} text-left text-sm ` +
    (ativo ? "bg-destaque-fundo font-semibold text-destaque" : "text-tinta hover:bg-fundo");

  return (
    <>
      <h3 className="px-2.5 pb-1 text-sm font-semibold text-tinta-suave">Filtrar por matéria</h3>
      {/* No celular, duas colunas: as 13 matérias cabem sem rolar a caixa. */}
      <div className={grande ? "grid grid-cols-2 gap-0.5" : "flex flex-col gap-0.5"}>
        {/* "Tudo" desmarca as matérias; marcar qualquer uma desliga o "Tudo". */}
        <button type="button" aria-pressed={materias.length === 0} onClick={() => setMaterias([])} className={item(materias.length === 0)}>
          Tudo
        </button>
        {MATERIAS.map((m) => {
          const marcada = materias.includes(m.valor);
          // Clicar de novo desmarca; as outras marcadas continuam.
          const alternar = () =>
            setMaterias((atuais) =>
              atuais.includes(m.valor) ? atuais.filter((x) => x !== m.valor) : [...atuais, m.valor],
            );
          return (
            <button key={m.valor} type="button" aria-pressed={marcada} onClick={alternar} className={item(marcada)}>
              <span className="cor-materia-texto" style={estiloDaTag(m.valor)}>
                <SimboloMateria tag={m.valor} className="size-4" />
              </span>
              {m.nome}
            </button>
          );
        })}
      </div>
      <div className="mt-2 border-t border-linha pt-2">
        <button
          type="button"
          role="switch"
          aria-checked={esconderBatePapo}
          onClick={() => setEsconderBatePapo(!esconderBatePapo)}
          className={`flex w-full items-center gap-2 whitespace-nowrap rounded-lg px-2.5 ${altura} text-left text-sm text-tinta-suave hover:bg-fundo`}
        >
          <SimboloMateria tag="bate-papo" className="size-4" />
          {/* min-w-0 + truncate: se a coluna ficar estreita, o texto encolhe
              em vez de empurrar o botão para fora da caixa. */}
          <span className="min-w-0 truncate">Esconder bate-papo</span>
          <span
            aria-hidden
            className={
              "ml-auto flex h-[18px] w-8 flex-none items-center rounded-full p-0.5 transition-colors " +
              (esconderBatePapo ? "justify-end bg-destaque" : "justify-start bg-tinta-suave")
            }
          >
            <span className="size-3.5 rounded-full bg-superficie" />
          </span>
        </button>
      </div>
    </>
  );
}

// Ícone de traço simples, no mesmo estilo dos da navegação.
function Icone({ d }: { d: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-4 flex-none" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round">
      <path d={d} />
    </svg>
  );
}
