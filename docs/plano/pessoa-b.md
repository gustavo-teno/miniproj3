# Pessoa B — Camila (Front): Base visual → Posts → Perfil-diário

Plano e diário de progresso da Pessoa B, que é a Camila (@camilaabmf). O
papel está na tabela "Quem faz o quê" do [PLANO.md](../../PLANO.md), junto com o cronograma
do time e o contrato.

**Como usar:** marque `[x]` no que ficou pronto, no mesmo PR da tarefa. Anote
abaixo, em "Diário", o que mudou no plano, decisões pequenas e bugs. Bug que
trava outra pessoa vira issue, com o link aqui.

## Plano

**Sáb 21: base visual.** Não depende do esqueleto, começa logo.
- [x] Revisar e aprovar o PR do esqueleto da Pessoa A (Gustavo, #22), porque todo mundo
    parte dele.
- [x] `layout.tsx`: navegação com Feed, Turmas, Perfil e Sair.
- [x] Identidade de caderno (decisão 2): fonte, cores, fundo de papel e uma cor por
    matéria, num mapa único `tag → cor` que todas as telas usam. Os nomes das
    matérias vêm de `GET /opcoes`, não de uma cópia no front.
- [x] Nome da rede provisório, numa constante só, para trocar em um lugar quando o
    time decidir (até quarta, antes do vídeo).
- [x] `lib/api.ts`: enquanto o login não existe, mandar o header `X-User-Id`
    (de uma variável de ambiente, só em desenvolvimento). Tipos novos: `Post`,
    `Perfil`.

**Dom 22: posts.**
- [x] Backend: `POST`, `GET`, `PATCH` e `DELETE /posts` (só o autor edita e
    apaga), tag validada contra a lista, `minutos` opcional, e o autor no
    retorno. Aqui nasce o `PostOut`, o formato do post que feed, perfil e
    turmas usam; a C acrescenta nele as curtidas e os comentários. Ao apagar
    um post, apagar junto as curtidas e os comentários dele (o SQLite não faz
    isso sozinho). Tirar o `@skip` de `test_posts_crud` quando a auth do A entrar.
- [x] Tela: formulário de postar com a tag obrigatória e o campo de duração.
- [x] Componente `<CardPost>`, usado no feed, no perfil e nas turmas: autor, tag
    com a cor da matéria, duração, data, e um espaço para os botões de curtir e
    comentar.
- **Combinar com C e D:** o `<CardPost>` é a peça que mais gente usa. Avisar
    no grupo quando ele entrar na `main`.

**Seg 23: perfil (backend e topo).** As rotas ficam no `routers/users.py`, que
é seu. `GET /usuarios/{username}` vai depois de `/stats`, senão captura esse
caminho.
- [x] `GET /usuarios/{username}` com a meta e os contadores `seguidores` e
    `seguindo` (contados na tabela de follows, que já existe desde o esqueleto);
    `PATCH /usuarios/eu` (bio, avatar e meta); `GET /usuarios/{username}/posts`
    paginado, com filtro opcional por tag.
- [x] Tela `/u/[username]`: topo com nome, meta (com o texto de quem marcou
    "Outro", como "quer Geografia") e contadores.
- [x] Tirar o `@skip` de `test_perfil_editavel`.
- **Combinar com D:** o formato do `GET /usuarios/{username}`, que o teste de
    follow também lê.

**Ter 24: o diário.**
- [x] Divisórias por matéria: uma aba por tag, com a contagem de posts.
- [x] Tela de editar o perfil.
- [x] Colocar no perfil o botão de seguir (D) e, quando sair, o `<Ofensiva />` (A).

**Qua 25:** ajustes visuais nas telas de todo mundo, estados vazios e tela de
celular.
- [x] Estados vazios e tela de celular conferidos em 375px e 360px (#58, #61 e #71).

**Qui 26:** passada final no front, no celular e no computador, nos modos claro
e noturno, como a banca faria (cadastro, login, post, follow, feed), e os
prints para o time.
- [x] Página do post com o post e os comentários na mesma folha (#73).
- [ ] Respostas dentro dos comentários e curtidas em comentário: backend da
    Clarisse; o desenho está aprovado e o lugar no código está avisado no #73.

O vídeo (#19) saiu da minha lista em 25/11: o responsável novo está a definir.

**Revisa:** PRs que mexem em layout, navegação, `lib/api.ts` e componentes
compartilhados.

## Diário

<!-- Uma linha por anotação, a mais nova em cima. Ex.:
- **ter 24:** feed pronto; a paginação devolvia o post repetido (#12, corrigido).
-->
- **qui 26:** página do post e fechamento do front. Abri o #73: o post e os
  comentários ficam na mesma folha (a listra lavanda desce por toda ela), com a
  caixa de comentar logo embaixo do post e cada comentário numa caixinha com
  fitinha no topo. Clicar num post, em qualquer lista, abre a página dele (os
  botões e a seleção de texto continuam funcionando), e a pauta do caderno
  também está nas caixas de escrever o post (não nas mensagens nem nos
  comentários). As respostas dentro dos comentários e as curtidas em comentário
  ficam com a Clarisse (precisam de backend): já avisei ela e deixei no PR o
  lugar certo no código. Revisei os PRs do Gustavo (DMs na tela, botão
  Mensagem, salvar, emoji e curtir mensagem) e, com todos aprovados, mergeei o
  #58, o #65, o #67 e o #69 na `main`. Atualizei o DESIGN.md com o topo do
  perfil no celular, a página do post e as DMs.
- **qua 25:** estados vazios, celular e o lavanda. Conferi todas as telas em
  375px (e a barra do topo em 360px): no celular, o Meu diário passou a mostrar o
  perfil primeiro, e o texto da busca coube na caixa (#58). O lavanda ficou mais
  claro e pastel (`#7263b0`, com contraste acima de 4,5 nos botões e nos textos),
  os avatares sem foto ganharam uma cor pastel por pessoa e os números passaram
  para a Lexend (#54). Abri o #71: o topo do perfil no celular, com o avatar ao
  lado do nome e o resto em largura total, e os três blocos da coluna do diário
  no computador com a mesma altura (264px). Pedi mudanças e depois aprovei as
  telas das DMs (#61 e #62). O botão de seguir entrou no perfil (#50).
- **ter 24:** feedback de design do Gustavo e botão de seguir. O DESIGN.md (#35)
  e os ajustes do feedback (#52) entraram na `main`: uma cor por área de matéria
  (Exatas azul, Natureza verde, Linguagens vermelho, Humanas amarelo, Idiomas
  laranja), o lavanda do site mais vivo, o fogo da ofensiva em recorte de
  papel saindo do caderno e os posts como folhas de caderno com dobra e listra
  lavanda. Na revisão, o Gustavo pediu uma cor guardada por área no
  `materias.ts` (feito, sem repetir a cor em cada matéria) e viu que a página
  do post, da Clarisse, fica com borda dupla: combinei que ela tira a caixa no
  próximo PR dela. Com o Follow (#33) na `main`, abri o #50: o `BotaoSeguir` do
  Pedro no perfil, com o contador de seguidores ao vivo. Nele fiz os pontos da
  revisão que faltavam (textos de erro no padrão do DESIGN.md e tirei o
  `aria-pressed`, porque o texto "Seguir/Seguindo" já diz o estado); o Pedro
  vai revisar. O #49 dele mexe nos mesmos pontos, então os dois precisam ser
  combinados. Revisei e aprovei o #46 (busca) e o #45 (DMs, backend) do
  Gustavo. A Clarisse passou dicas de "cara de IA": já corrigi os pequenos
  erros (singular em "1 comentário" e "1 curtida" no rascunho do feed, campo
  "Tempo de estudo" cortado, número repetido no card "Todas" e a comemoração
  do recorde na legenda do fogo). As mudanças maiores (cor da matéria nos
  posts, fonte e avatares, feed e topo) ficam para a `fix/refinamento-visual`,
  com esboços para o time escolher; os esboços estão em
  `.impeccable/mocks/decision/`. As barras das horas por matéria dependem de o
  backend entregar as horas divididas por matéria (hoje só vem o total por dia).
- **seg 23:** perfil, backend e tela (#10, parte 1). Antes do código, desenhei
  o diário com a skill impeccable: escolhi a "estante de cadernos" (cada
  matéria é um caderno com quantos posts tem e quando foi o último, numa barra
  que passa para o lado), a meta no estilo LinkedIn ("Fuvest · Medicina ·
  USP") e, no meu diário, uma coluna presa ao rolar com o postar e a ofensiva.
  Para quem visita, uma coluna só, com o fogo no topo. Os esboços estão em
  `.impeccable/mocks/decision/`. No backend, o `GET /usuarios/{username}`
  devolve a meta, os contadores, `meu_perfil` e os `cadernos`; o PATCH
  devolve o perfil inteiro; a foto só aceita link `https` (sem o "s", a página
  publicada bloqueia a imagem). Decidi tirar as horas por matéria do perfil:
  num perfil que os outros visitam, isso vira comparação (princípio 3). As
  horas da semana são privadas. Escrevi `tests/test_perfil.py` e tirei o
  `@skip` do `test_perfil_editavel`. Também abri o PR #41 com ajustes do card
  (a foto de quem postou em destaque, "Tempo de estudo" no lugar de "min",
  símbolos novos de Biologia e Matemática e filtro por várias matérias no
  rascunho do feed). Bugs achados na revisão da tela: trocar de pessoa sem
  sair da página guardava o caderno da anterior, e o "Ver mais" podia
  misturar cadernos; corrigi os dois.
- **seg 23, para combinar:** com o Gustavo, o `<Ofensiva />` mostra as horas
  para quem visita, mas decidimos que as horas são privadas; o ícone novo do
  fogo (caderno aberto com a chama que cresce e muda de cor, ideia dele) fica
  para a `feat/icone-ofensiva`; e as horas por dia, para as barras da semana.
  Com a D, os endereços das turmas (a meta vira link) e o `BotaoSeguir` no
  perfil. Ideias para depois: post com várias matérias (muda o contrato do
  Post) e upload de foto em vez de link.
- **dom 22:** posts prontos (#9). Backend com o `PostOut` levando o autor
  dentro, só o autor edita e apaga (403), e apagar um post leva junto as
  curtidas e os comentários. Na revisão achei dois bugs: a data voltava sem
  fuso (o card ia mostrar 3 h de diferença) e um texto só com espaços passava
  como post; corrigi os dois. Escrevi `tests/test_posts.py` com o atalho do
  `X-User-Id` e estraguei o service de propósito em três pontos para ver os
  testes pegarem. O `<CardPost>` e o `<FormPost>` saíram do rascunho e viraram
  componentes; o card tem um `rodape` para a C pôr curtir e comentar. Com a
  auth do Gustavo na `main`, tirei o `@skip` do `test_posts_crud`. Avisar o
  Gustavo: o `created_at` de todos os models volta sem fuso do SQLite.
- **dom 22:** revisão do Gustavo no mockup do feed: a faixa do topo mostrava o
  perfil inteiro (nome, @, foto, bio, turmas e matérias) e espremia o feed. A
  faixa vira uma linha só: foto pequena, caixa de escrever e botão
  "Postar". Fiz duas versões (atalho em cima e embaixo) e fiquei
  com a de cima (o "design 7"); o rascunho está em `/rascunho-feed`. O "há
  2 h" virou "há 2h", e com menos de 1 hora aparecem só os minutos. A coluna de filtros fica só com as matérias. Testei seis
  cores de destaque calmas e troquei o verde-água pela lavanda. Os tipos de
  post (relato, dica, dúvida, desabafo) saíram de vez. O bate-papo (tag de post,
  não as DMs) continua.
- **dom 22:** base visual pronta. Troquei a identidade de caderno pautado por um
  layout de rede social mais limpo (Lexend, cores suaves, modo noturno e um
  símbolo e uma cor para cada matéria); o caderno ficou na organização do
  perfil por matéria. Na navegação, "Perfil" virou "Meu diário" e o "Sair" foi
  para a engrenagem de configurações; "Mensagens" fica escondida até as DMs
  existirem. Proposta para o time: uma foto por post, o que muda o
  contrato do Post.
