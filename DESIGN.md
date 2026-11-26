# Design

O jeito visual da rede, tirado do que o código já usa. Serve para quem precisa
fazer uma tela ou um componente, inclusive algo provisório, sem inventar cor,
fonte ou espaçamento. O porquê das escolhas (público, tom, o que o time
rejeita) está no [`PRODUCT.md`](PRODUCT.md).

A área é da Pessoa B (Camila). Se algo aqui não servir, avise antes de criar
um padrão novo: se for bom, ele entra neste arquivo.

Atualizado em 26/11, depois do feedback do Gustavo (#52), das dicas da
Clarisse (#54), do topo do perfil no celular (#71) e da página do post (#73).

## A ideia em uma frase

Layout de rede social que o público já conhece, feito com capricho. A
personalidade vem das **cores e dos símbolos das matérias** e da **ideia de
caderno** (folha dobrada, margem, pauta, marca-texto), não de enfeite. A tela
precisa cansar pouco a vista de quem chega depois de horas de estudo.

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
| `destaque` | lavanda: botão principal, item ativo, o que é seu | `#7263b0` | `#c2b4ee` |
| `destaque-fundo` | fundo suave do item ativo e do hover | `#f3f0fc` | `#302a4c` |
| `sobre-destaque` | texto em cima do `destaque` | `#ffffff` | `#13171d` |
| `erro` | texto e borda de aviso de erro | `#a3302a` | `#f2a7a0` |
| `erro-fundo` | fundo do aviso de erro | `#fbeeed` | `#3a2224` |

O `destaque` é pouco, de propósito: só o que é da pessoa, o botão principal e o
item ativo. Se tudo for lavanda, nada se destaca. O tom é pastel e calmo,
sem roxo forte; o claro é o passo mais claro que ainda passa no contraste de
leitura (4,5) com letra branca nos botões e com texto lavanda em cima do
`destaque-fundo`. Se for clarear mais, revise esses dois usos. A listra de margem e a pauta
dos posts também usam o `destaque`, por isso mudam sozinhas no modo noturno.

### As cores das matérias

Cada matéria tem um símbolo e uma cor, num único mapa:
[`lib/materias.ts`](frontend/lib/materias.ts) (cores) e
[`SimboloMateria.tsx`](frontend/components/SimboloMateria.tsx) (símbolos).
Toda tela que mostra uma matéria usa esse mapa. Ninguém cria cor de matéria em
outro lugar.

A cor é **por área de conhecimento**: as matérias de uma área dividem a mesma
cor, e o símbolo e o nome diferenciam uma da outra. No `materias.ts`, cada área
é uma constante (`EXATAS`, `NATUREZA`...) e cada matéria aponta para a da sua
área.

| Área | Matérias | Claro (fundo / texto) | Noturno (fundo / texto) |
|---|---|---|---|
| Exatas (azul) | matemática | `#8fc1ff` / `#0048a1` | `#17304f` / `#4a99fa` |
| Natureza (verde) | física, química, biologia | `#bdffcd` / `#007d1f` | `#194324` / `#47f572` |
| Linguagens (vermelho) | português, literatura, redação | `#ffbdbf` / `#b20006` | `#43191b` / `#f6555b` |
| Humanas (amarelo) | história, geografia, filosofia, sociologia | `#fff4bd` / `#826c00` | `#433c19` / `#f5d847` |
| Idiomas (laranja) | inglês, espanhol | `#ffd9bd` / `#a34700` | `#432b19` / `#f59247` |
| Bate-papo (cinza) | bate-papo | `#eef0f0` / `#4f5a5c` | `#262c35` / `#c3cad4` |

O lavanda e o roxo ficam só para a rede (botões, item ativo, "Todas"): **nenhuma
matéria usa lavanda**, para a cor da matéria nunca se confundir com a do site.
Todas as combinações de fundo e texto passam no contraste de leitura (4,5) nos
dois modos. Tag nova no backend sem cor no mapa aparece em cinza.

Para usar, junte a classe com o estilo da tag (`estiloDaTag`):

```tsx
// fundo suave com texto forte (o quadradinho do símbolo, a caixa da estante)
<span className="cor-materia" style={estiloDaTag(post.tag)}>...</span>

// só o texto na cor da matéria
<span className="cor-materia-texto" style={estiloDaTag(post.tag)}>...</span>

// marca-texto: o nome da matéria grifado na cor dela (o card do post)
<span className="marca-materia" style={estiloDaTag(post.tag)}>...</span>
```

O símbolo existe para quem não distingue bem as cores: **nunca mostre a cor de
uma matéria sem o símbolo ou o nome**.

### Cores com significado próprio (o fogo da ofensiva)

Quando um componente precisa de cores que não são da paleta, siga o mesmo
esquema da `cor-materia`: uma classe no `globals.css` que escolhe o par claro
ou noturno, e as cores passadas por variáveis CSS.

O fogo da ofensiva segue esse esquema. As classes `.fogo-0` a `.fogo-6` do
`globals.css` definem as cores da chama (`--chama`, `--chama-contorno`,
`--chama-meio`, `--chama-miolo`), do número (`--fogo-texto`) e do painel de quem
visita (`--fogo-painel`). A `.fogo-0` é o fogo apagado; de 1 a 6, a chama muda
do vermelho ao azul conforme os dias seguidos (1, 7, 14, 30, 60 e 100 dias). O
desenho (`IconeFogo`, em
[`FogoDoDiario.tsx`](frontend/components/perfil/FogoDoDiario.tsx)) é um fogo em
recorte de papel saindo de um caderno aberto: com mais dias, a chama fica maior,
ganha pontas, brilho e faíscas. O caderno (`--caderno-capa`, `--caderno-folhas`,
`--caderno-pagina`, `--caderno-traco`, `--caderno-pauta`) é igual no claro e no
noturno.

### Modo noturno

Na primeira visita, segue o sistema da pessoa. Depois que ela escolhe no menu,
vale o `data-tema` do `<html>` (`"claro"` ou `"noturno"`). Toda variável nova
precisa dos dois valores, nos **três** lugares do `globals.css`: no `:root`, no
`@media (prefers-color-scheme: dark)` e no `:root[data-tema="noturno"]`.

Teste sempre nos dois modos antes de abrir o PR.

## Tipografia

Uma fonte só, a **Lexend**, carregada no [`layout.tsx`](frontend/app/layout.tsx).
Fonte de terminal (mono) ficou de fora: numa rede de estudantes, passava cara de
app de programador.

| Classe | Uso |
|---|---|
| `font-texto` (padrão do `body`) | tudo |
| `font-numeros` | números (`1h30`, `45min`, contagens) e `@usuário`: a mesma Lexend, com algarismos de largura igual (`tabular-nums`) |

Pesos da Lexend (só estes estão carregados):

| Peso | Classe | Uso |
|---|---|---|
| 300 | `font-light` | texto corrido (o texto do post) |
| 400 | (padrão) | interface: botões, menus, rótulos |
| 600 | `font-semibold` | nomes, títulos, botão principal |
| 700 | `font-bold` | só os números do fogo (dias seguidos e recorde) |

Tamanhos: `text-sm` é o mais comum (metadados, botões, avisos), `text-xs` para
etiquetas, o padrão (`text-base`) para o texto do post, e `text-2xl` para
títulos de página. Texto longo leva `leading-relaxed`; o texto do post leva
`leading-6`, para a pauta cair embaixo de cada linha.

## Forma e espaço

| O quê | Classe |
|---|---|
| Caixa grande (lista de posts, coluna lateral, formulário de postar) | `rounded-2xl border border-linha bg-superficie` |
| Caixa média (formulário de login, menus, legendas) | `rounded-xl` |
| Botão, etiqueta, aviso | `rounded-lg` |
| Avatar, bolinhas | `rounded-full` |
| Sombra | só no que flutua por cima (menus, balões): `shadow-md` |

Espaçamentos mais usados: `gap-2` e `gap-3` entre itens, `p-3` e `p-4` dentro
de caixas, `p-6` em caixas de formulário. A página tem largura máxima de
`1320px` com `px-6`, já no `layout.tsx`. No perfil, a coluna da direita (postar,
fogo e horas) tem 248px, com `gap-4` entre as colunas. No computador, os três
blocos dessa coluna têm a **mesma altura**, definida num lugar só: a variável
`--altura-bloco-diario` (264px, no `globals.css`). No celular, cada bloco tem a
altura que o conteúdo pede.

**O topo do perfil no celular.** O avatar divide a linha só com o nome e o @; a
meta, a bio, os contadores e os botões usam a largura toda embaixo. Os botões
**Seguindo** e **Mensagem** dividem a linha (o **Seguir** sozinho ocupa a linha
toda), e o **Editar perfil** desce para uma linha própria. No computador, o
avatar fica numa coluna à esquerda, como sempre. Para os botões ocuparem a
largura no celular, `<BotaoSeguir>` e `<BotaoMensagem>` aceitam o prop
`cheioNoCelular`; sem ele, ficam com o tamanho do texto.

O layout é desenhado primeiro para **computador** (tela larga). Celular é um
extra, mas não deixe nada quebrar abaixo de `sm`.

## O caderno nos posts

A identidade de caderno vive nos posts, não só na estante do perfil. Cada post é
uma **folha solta** (`<CardPost>`, classe `.folha` do `globals.css`):

- o canto de cima à direita é **dobrado** (a dobra usa a cor das bordas);
- uma **listra lavanda** fininha faz de margem de caderno, à esquerda;
- o texto do post tem **linhas de pauta** bem leves atrás (classe `.pauta`, que
  precisa de uma altura de linha fixa: `leading-6` por padrão, ou outra altura
  dita pela variável `--altura-linha`). As caixas de **escrever** um post
  ("Postar no diário" e o `<FormPost>`) também têm a pauta (`.pauta-campo`,
  que faz as linhas começarem no texto e rolarem com ele). As **mensagens** e os
  **comentários** não têm;
- o nome da matéria vem com **marca-texto** na cor dela (`.marca-materia`).

As folhas ficam soltas, com `space-y-4` entre elas, e a lista leva o nome do
caderno em cima ("Todas as publicações", "Caderno de Física"). **Não ponha uma
caixa com borda em volta de um `<CardPost>`**: a folha já tem a própria borda e
ficaria borda dupla.

**Clicar no post abre a página dele** (`/posts/{id}`), como no Twitter. Os
botões e links de dentro (curtir, salvar, o nome da pessoa) continuam fazendo o
que fazem, e selecionar texto para copiar não abre o post. Na própria página do
post, o card não é clicável (`abrirAoClicar={false}`).

### A página do post

O post e os comentários ficam na **mesma folha**, sem caixas separadas: o
`<CardPost>` recebe a conversa em `embaixo`. Logo embaixo do post vem o título
("N comentários") e a caixa de **comentar**, com contorno contínuo, que cresce
com o texto. Cada **comentário** é uma caixinha de fundo branco, com uma
**fitinha** lavanda no topo, como um papel colado na folha. As respostas dentro
de um comentário e a curtida em cada comentário estão desenhadas (a curtida com
número e o "Responder" embaixo do texto, as respostas recuadas dentro da
caixinha) e dependem do backend dos comentários.

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
| `<CardPost post rodape embaixo abrirAoClicar>` | o post, igual no feed, no perfil e nas turmas. Botões (curtir, comentar, salvar) entram no `rodape`; a conversa da página do post entra em `embaixo`. Clicar nele abre a página do post |
| `<FormPost autor onPostado>` | o atalho de postar: uma linha fechada, que abre com matéria e tempo de estudo |
| `<BotaoCurtir post>`, `<LinkComentarios post>` e `<BotaoSalvar post>` | curtir, comentar e salvar, no `rodape` do `<CardPost>`. Os salvos ficam na página `/salvos`, que abre pelo menu da engrenagem |
| `<Comentarios postId>` | a conversa da página do post: a caixa de comentar e as caixinhas dos comentários |
| `<BotaoEmoji aoEscolher>` | o botão de emoji (carinha) nas caixas de escrever: uma barra com os mais usados e um "+" com todos |
| `<BotaoMensagem username seguidores>` | o botão do perfil que leva à conversa; só aparece entre mútuos |
| `<BotaoSeguir username onMudou>` | seguir e deixar de seguir; o texto "Seguir"/"Seguindo" já diz o estado |
| `<TagMateria tag>` | etiqueta com símbolo e nome da matéria |
| `<SimboloMateria tag>` | só o símbolo (usa a cor do texto em volta) |
| `<Avatar autor>` | foto da pessoa ou as iniciais; tamanhos `pequeno`, padrão, `grande` (card do post) e `enorme` (topo do perfil) |
| `<UserCard>` | pessoa numa lista (seguir, turmas) |
| `<EstanteCadernos>` | a estante do perfil: um caderno por matéria, com posts e último post |
| `<FogoDoDiario>` / `<PainelFogo>` | o fogo da ofensiva com a legenda, no diário e no perfil de quem visita |
| `<HorasEstudadas>` | as horas da semana, só para a dona do perfil |
| `<BoasVindasDeVolta>` | a saudação do feed, só na primeira visita depois do login |

### Mensagens (DMs)

A conversa tem o **topo** (seta de voltar, foto e nome) e a **caixa de escrever**
grudados na tela, como nos apps de mensagem. Os balões de quem escreve são
lavanda cheio, e os do outro, lavanda suave. **Dois cliques (ou dois toques)** num
balão põem um ❤️ no canto; repetir tira. A aba "Mensagens" do topo mostra o
número de não lidas, e no celular vira só um balão com o número, para a barra
caber.

### Avatares

Quem não tem foto aparece com as iniciais, e **cada pessoa tem uma cor fixa**,
escolhida pelo nome entre 6 tons pastéis e calmos (lavanda, rosé, menta,
azul-poeira, areia e cinza-azulado), na mesma vibe do lavanda. Eles ficam no
`globals.css` (`.avatar-0` a `.avatar-5`): fundo suave com iniciais num tom mais
escuro da mesma família, e o inverso no noturno. Sem azul, verde, vermelho,
amarelo e laranja vivos, que são as cores das matérias. Quem usa o avatar usa o
`<Avatar>`: não crie uma cópia só para mudar o tamanho.

## Ícones

Desenhados à mão em SVG de traço, sem biblioteca: `viewBox="0 0 24 24"`,
`fill="none"`, `stroke="currentColor"`, `strokeWidth` entre 1.6 e 2, pontas
arredondadas. Com `currentColor`, quem usa o ícone decide a cor. Ícone que só
enfeita leva `aria-hidden`; botão só de ícone leva `aria-label`.

## Acessibilidade

- Contraste é prioridade: quem usa chega cansado. Texto secundário é
  `tinta-suave`, nunca mais claro que isso.
- Nada depende só da cor: matéria tem símbolo e nome, o fogo tem legenda, o
  botão de seguir diz "Seguir" ou "Seguindo".
- Tudo funciona com teclado. O contorno de foco (`:focus-visible`) já vem do
  `globals.css`; não tire.
- Menus e balões fecham com `Esc` e com um toque fora.

## Tom dos textos

Fala com "você", como colega de turma: acolhedor e informal, nunca coach nem
cobrança. Nada de ranking ou comparação com os outros ("você está atrás de
fulano"). Descanso não é fracasso. Exemplos que já estão no app: "O que você
estudou agora?", "Estude hoje para não perder a ofensiva." e a saudação de quem
acabou de entrar ("Que bom te ver de novo, Ada!", só na primeira visita depois
do login, no `<BoasVindasDeVolta>`). Quando a ofensiva bate o recorde, a
legenda comemora ("É o seu recorde!") em vez de repetir o número.

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
