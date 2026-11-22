# Pessoa B — Camila (Front): Base visual → Posts → Perfil-diário

Plano e diário de progresso da Pessoa B, que é a Camila (@camilaabmf). O
papel está na tabela "Quem faz o quê" do [PLANO.md](../../PLANO.md), junto com o cronograma
do time e o contrato.

**Como usar:** marque `[x]` no que ficou pronto, no mesmo PR da tarefa. Anote
abaixo, em "Diário", o que mudou no plano, decisões pequenas e bugs. Bug que
trava outra pessoa vira issue, com o link aqui.

## Plano

**Sáb 21: base visual.** Não depende do esqueleto, começa logo.
- [ ] Revisar e aprovar o PR do esqueleto da Pessoa A (Gustavo, #22), porque todo mundo
    parte dele.
- [ ] `layout.tsx`: navegação com Feed, Turmas, Perfil e Sair.
- [ ] Identidade de caderno (decisão 2): fonte, cores, fundo de papel e uma cor por
    matéria, num mapa único `tag → cor` que todas as telas usam. Os nomes das
    matérias vêm de `GET /opcoes`, não de uma cópia no front.
- [ ] Nome da rede provisório, numa constante só, para trocar em um lugar quando o
    time decidir (até quarta, antes do vídeo).
- [ ] `lib/api.ts`: enquanto o login não existe, mandar o header `X-User-Id`
    (de uma variável de ambiente, só em desenvolvimento). Tipos novos: `Post`,
    `Perfil`.

**Dom 22: posts.**
- [ ] Backend: `POST`, `GET`, `PATCH` e `DELETE /posts` (só o autor edita e
    apaga), tag validada contra a lista, `minutos` opcional, e o autor no
    retorno. Aqui nasce o `PostOut`, o formato do post que feed, perfil e
    turmas usam; a C acrescenta nele as curtidas e os comentários. Ao apagar
    um post, apagar junto as curtidas e os comentários dele (o SQLite não faz
    isso sozinho). Tirar o `@skip` de `test_posts_crud` quando a auth do A entrar.
- [ ] Tela: formulário de postar com a tag obrigatória e o campo de duração.
- [ ] Componente `<CardPost>`, usado no feed, no perfil e nas turmas: autor, tag
    com a cor da matéria, duração, data, e um espaço para os botões de curtir e
    comentar.
- **Combinar com C e D:** o `<CardPost>` é a peça que mais gente usa. Avisar
    no grupo quando ele entrar na `main`.

**Seg 23: perfil (backend e topo).** As rotas ficam no `routers/users.py`, que
é seu. `GET /usuarios/{username}` vai depois de `/stats`, senão captura esse
caminho.
- [ ] `GET /usuarios/{username}` com a meta e os contadores `seguidores` e
    `seguindo` (contados na tabela de follows, que já existe desde o esqueleto);
    `PATCH /usuarios/eu` (bio, avatar e meta); `GET /usuarios/{username}/posts`
    paginado, com filtro opcional por tag.
- [ ] Tela `/u/[username]`: topo com nome, meta (com o texto de quem marcou
    "Outro", como "quer Geografia") e contadores.
- [ ] Tirar o `@skip` de `test_perfil_editavel`.
- **Combinar com D:** o formato do `GET /usuarios/{username}`, que o teste de
    follow também lê.

**Ter 24: o diário.**
- [ ] Divisórias por matéria: uma aba por tag, com a contagem de posts.
- [ ] Tela de editar o perfil.
- [ ] Colocar no perfil o botão de seguir (D) e, quando sair, o `<Ofensiva />` (A).

**Qua 25:** ajustes visuais nas telas de todo mundo, estados vazios e tela de
celular. Escrever o roteiro do vídeo.

**Qui 26:** gravar o vídeo (cerca de 4 minutos), no seu computador com o seed,
para não depender do deploy: cadastro, login, post, follow
e feed, depois a ofensiva e as Turmas, e uma decisão de produto ("a rede não
compara por você").

**Revisa:** PRs que mexem em layout, navegação, `lib/api.ts` e componentes
compartilhados.

## Diário

<!-- Uma linha por anotação, a mais nova em cima. Ex.:
- **ter 24:** feed pronto; a paginação devolvia o post repetido (#12, corrigido).
-->
