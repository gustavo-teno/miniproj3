# Design

O jeito visual da rede, tirado do que o código já usa. Serve para quem precisa
fazer uma tela ou um componente, inclusive algo provisório, sem inventar cor,
fonte ou espaçamento. O porquê das escolhas (público, tom, o que o time
rejeita) está no [`PRODUCT.md`](PRODUCT.md).

A área é da Pessoa B (Camila). Se algo aqui não servir, avise antes de criar
um padrão novo: se for bom, ele entra neste arquivo.

## A ideia em uma frase

Layout de rede social que o público já conhece, feito com capricho. A
personalidade vem das **cores e dos símbolos das matérias**, não de enfeite. A
tela precisa cansar pouco a vista de quem chega depois de horas de estudo.

## Regra de ouro: nunca uma cor solta

Toda cor vem de uma variável no [`globals.css`](frontend/app/globals.css). As
telas usam só as classes do Tailwind geradas delas, nunca um hex no
`className` nem no `style`. Assim, o modo noturno funciona sozinho: trocar de
modo é trocar as variáveis, e nenhuma tela precisa saber disso.

```tsx
// certo
<p className="text-tinta-suave">há 2h</p>

// errado: some no modo noturno e foge da paleta
<p className="text-gray-500">há 2h</p>
<p style={{ color: "#5a6b6e" }}>há 2h</p>
```

## Cores

### A paleta

| Classe (sufixo) | Para que serve | Claro | Noturno |
|---|---|---|---|
| `fundo` | atrás de tudo (`bg-fundo`) | `#f5f7f6` | `#13171d` |
| `superficie` | cards, caixas, menus | `#ffffff` | `#1b2028` |
| `linha` | bordas e divisões | `#e2e8e5` | `#2a313b` |
| `tinta` | texto principal | `#1e2a2c` | `#e6eaf0` |
| `tinta-suave` | texto secundário (hora, contagem, ajuda) | `#5a6b6e` | `#9aa4b2` |
| `destaque` | lavanda: botão principal, item ativo, o que é seu | `#665f82` | `#bdb5d8` |
| `destaque-fundo` | fundo suave do item ativo e do hover | `#efedf5` | `#2b2938` |
| `sobre-destaque` | texto em cima do `destaque` | `#ffffff` | `#13171d` |
| `erro` | texto e borda de aviso de erro | `#a3302a` | `#f2a7a0` |
| `erro-fundo` | fundo do aviso de erro | `#fbeeed` | `#3a2224` |

O `destaque` é pouco, de propósito: só o que é da pessoa, o botão principal e o
item ativo. Se tudo for lavanda, nada se destaca.

### As cores das matérias

Cada matéria tem uma cor e um símbolo, num único mapa:
[`lib/materias.ts`](frontend/lib/materias.ts) (cores) e
[`SimboloMateria.tsx`](frontend/components/SimboloMateria.tsx) (símbolos).
Toda tela que mostra uma matéria usa esse mapa. Ninguém cria cor de matéria em
outro lugar.

Cada cor tem um **fundo suave** e um **texto forte** da mesma família. Para
usar, junte a classe com o estilo da tag:

```tsx
// etiqueta ou quadrado com fundo (já existe pronto: <TagMateria tag=... />)
<span className="cor-materia" style={estiloDaTag(post.tag)}>...</span>

// só o texto na cor da matéria
<span className="cor-materia-texto" style={estiloDaTag(post.tag)}>...</span>
```

O símbolo existe para quem não distingue bem as cores: **nunca mostre a cor de
uma matéria sem o símbolo ou o nome**.

### Cores com significado próprio (ex.: o fogo da ofensiva)

Quando um componente precisa de cores que não são da paleta, siga o mesmo
esquema da `cor-materia`: uma classe no `globals.css` que escolhe o par claro
ou noturno, e as cores passadas por variáveis CSS. O `.cor-fogo` (PR #32) já
segue esse esquema.

> **A fazer:** os tons do fogo ainda moram em hex no `FAIXAS` do
> `components/Ofensiva.tsx` e são provisórios. A ideia é virarem variáveis
> no `globals.css` (`--fogo-1` a `--fogo-6`), para ajustar num lugar só.

### Modo noturno

Na primeira visita, segue o sistema da pessoa. Depois que ela escolhe no menu,
vale o `data-tema` do `<html>` (`"claro"` ou `"noturno"`). Toda variável nova
precisa dos dois valores, nos **três** lugares do `globals.css`: no `:root`, no
`@media (prefers-color-scheme: dark)` e no `:root[data-tema="noturno"]`.

Teste sempre nos dois modos antes de abrir o PR.

## Tipografia

Duas fontes, carregadas no [`layout.tsx`](frontend/app/layout.tsx):

| Classe | Fonte | Uso |
|---|---|---|
| `font-texto` (padrão do `body`) | Lexend | tudo |
| `font-numeros` | Atkinson Hyperlegible Mono | números (`1h30`, `45min`, contagens) e `@usuário` |

Pesos da Lexend (só esses três estão carregados):

| Peso | Classe | Uso |
|---|---|---|
| 300 | `font-light` | texto corrido (o texto do post) |
| 400 | (padrão) | interface: botões, menus, rótulos |
| 600 | `font-semibold` | nomes, títulos, botão principal |

Tamanhos: `text-sm` é o mais comum (metadados, botões, avisos), `text-xs` para
etiquetas, o padrão (`text-base`) para o texto do post, e `text-2xl` para
títulos de página. Texto longo leva `leading-relaxed`.

## Forma e espaço

| O quê | Classe |
|---|---|
| Caixa grande (lista de posts, coluna lateral, formulário de postar) | `rounded-2xl border border-linha bg-superficie` |
| Caixa média (formulário de login, menus, legendas) | `rounded-xl` |
| Botão, etiqueta, aviso | `rounded-lg` |
| Avatar, bolinhas | `rounded-full` |
| Sombra | só no que flutua por cima (menus, balões): `shadow-md` |

Espaçamentos mais usados: `gap-2` e `gap-3` entre itens, `p-3` e `p-4` dentro
de caixas, `p-6` em caixas de formulário. A página tem largura máxima
`max-w-6xl` com `px-6`, já no `layout.tsx`.

O layout é desenhado primeiro para **computador** (tela larga). Celular é um
extra, mas não deixe nada quebrar abaixo de `sm`.

## Padrões prontos

Use o que já existe antes de criar um novo.

**Botão principal**

```tsx
<button className="rounded-lg bg-destaque px-3 py-1.5 text-sm font-semibold text-sobre-destaque disabled:opacity-50">
  Postar
</button>
```

**Botão de ícone** (fechar, setinha)

```tsx
<button aria-label="Fechar" className="grid size-7 place-items-center rounded-md text-tinta-suave hover:bg-destaque-fundo">
  <svg ...>
</button>
```

**Aviso de erro**

```tsx
<p role="alert" className="rounded-lg border border-erro bg-erro-fundo p-3 text-sm text-erro">...</p>
```

**Aviso neutro**

```tsx
<p role="status" className="rounded-lg bg-destaque-fundo p-3 text-sm text-tinta">...</p>
```

**Carregando**: um bloco do tamanho do conteúdo com
`animate-pulse rounded-xl bg-linha` e `role="status"`.

**Componentes**

| Componente | Para quê |
|---|---|
| `<CardPost post rodape>` | o post, igual no feed, no perfil e nas turmas. Botões (curtir, comentar) entram no `rodape`, sem mexer no card |
| `<TagMateria tag>` | etiqueta com símbolo e nome da matéria |
| `<SimboloMateria tag>` | só o símbolo (usa a cor do texto em volta) |
| `<Avatar autor pequeno?>` | foto ou inicial da pessoa |
| `<UserCard>` | pessoa numa lista (seguir, turmas) |
| `<Ofensiva username>` | fogo e horas da semana, no topo do perfil |

## Ícones

Desenhados à mão em SVG de traço, sem biblioteca: `viewBox="0 0 24 24"`,
`fill="none"`, `stroke="currentColor"`, `strokeWidth` entre 1.6 e 2, pontas
arredondadas. Com `currentColor`, quem usa o ícone decide a cor. Ícone que só
enfeita leva `aria-hidden`; botão só de ícone leva `aria-label`.

## Acessibilidade

- Contraste é prioridade: quem usa chega cansado. Texto secundário é
  `tinta-suave`, nunca mais claro que isso.
- Nada depende só da cor: matéria tem símbolo, o fogo tem legenda.
- Tudo funciona com teclado. O contorno de foco (`:focus-visible`) já vem do
  `globals.css`; não tire.
- Menus e balões fecham com `Esc` e com um toque fora.

## Tom dos textos

Fala com "você", como colega de turma: acolhedor e informal, nunca coach nem
cobrança. Nada de ranking ou comparação com os outros ("você está atrás de
fulano"). Descanso não é fracasso. Exemplos que já estão no app: "O que você
estudou agora?" e "Estude hoje para não perder a ofensiva."

### Mensagens do sistema (erros)

Combinado com o Gustavo em 23/11. Quando algo dá errado, quem fala é o
sistema, não uma pessoa, então toda mensagem é:

- **impessoal:** sem "eu" ("não consegui") e sem "a gente";
- **com maiúscula e ponto final**;
- clara sobre **o que** deu errado e, quando a pessoa puder fazer algo,
  **o que fazer**.

São dois tipos:

- **Falha do sistema** (não carregou, não salvou, servidor fora do ar):
  começa com **"Não foi possível"**.
- **Aviso de campo ou de dado** (algo que a pessoa preencheu): diz o problema
  direto, sem "Não foi possível" na frente. Prefira frases que não dependam
  do gênero do campo ("Preencha o campo Senha.", e não "Senha é
  obrigatório.").

| Tipo | Certo | Errado |
|---|---|---|
| Falha | Não foi possível carregar a ofensiva. | não consegui carregar |
| Falha | Não foi possível postar. Tente de novo. | Não deu para postar |
| Falha | Não foi possível falar com o servidor. Tente de novo em breve. | Failed to fetch |
| Aviso | Nome não pode ficar vazio. | String should have at least 1 character |
| Aviso | Esse nome de usuário já está em uso. | Não foi possível usar esse nome de usuário. |
| Aviso | Usuário ou senha inválidos. | não consegui entrar |

Os avisos de campo saem traduzidos do `mensagemDoErro()` em
[`lib/api.ts`](frontend/lib/api.ts) (PR #37): campo novo no backend precisa
do nome dele em `NOMES_DOS_CAMPOS`.

As telas antigas vão sendo ajustadas aos poucos, cada pessoa nas próprias.

## Fazendo algo provisório

1. Procure aqui e nos componentes se já existe um padrão. Quase sempre existe.
2. Se precisar de cor nova, crie a variável no `globals.css` com os valores
   claro e noturno, e marque com um comentário `/* provisório (seu nome) */`.
3. Não use cores do Tailwind (`text-gray-500`, `bg-blue-600`) nem hex direto
   na tela.
4. Teste nos dois modos.
5. No PR, avise a Pessoa B do que ficou provisório, para ela ajustar.
