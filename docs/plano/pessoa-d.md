# Pessoa D (Reforço): Follow → Feed → Turmas

Plano e diário de progresso da Pessoa D. Quem ocupa o papel está na
tabela "Quem faz o quê" do [PLANO.md](../../PLANO.md), junto com o cronograma
do time e o contrato.

**Como usar:** marque `[x]` no que ficou pronto, no mesmo PR da tarefa. Anote
abaixo, em "Diário", o que mudou no plano, decisões pequenas e bugs. Bug que
trava outra pessoa vira issue, com o link aqui.

## Plano

**Seg 23: follow.** Começa com `make check` verde (guia 00).
- [x] `POST` e `DELETE /usuarios/{username}/follow`, idempotentes.
- [x] Componente `<BotaoSeguir username=... />`, usado no perfil e nas turmas.
- [x] Tirar o `@skip` de `test_follow_unfollow_com_contadores`.
- **Combinar com B:** os contadores ficam no `GET /usuarios/{username}` dela.

**Ter 24: feed e núcleo verde.**
- [x] `GET /feed`, cronológico e paginado, só de quem você segue, com opção de
    esconder o bate-papo.
- [x] Tela inicial: feed com "carregar mais", o filtro de bate-papo, e o feed vazio
    com um convite para conhecer a turma (decisão 3).
- [x] Tirar o `@skip` de `test_feed_cronologico_dos_seguidos` e conferir se todos
    os testes do núcleo passam. É a meta da terça à noite.

**Qua 25: Turmas** (decisão 5).
- [ ] Rotas para listar as turmas (uma por vestibular e uma por curso, tiradas de
    `app/constantes.py`, com o número de membros), os membros de uma turma e os posts deles, com filtro por
    matéria.
- [ ] "Outro" também é turma: "Outros vestibulares" e "Outros cursos". Nelas, o
    card do membro mostra o que ele escreveu ("quer Geografia").
- [ ] Aba Turmas e a página da turma: membros com `<BotaoSeguir />` e posts com
    `<CardPost>`.
- **Combinar com A:** o cadastro leva para a turma. **Com C:** o seed precisa
    encher as turmas.

Turmas fica com D porque a página da turma junta Follow e Feed: uma lista de
gente para seguir e um feed dos membros.

**Qui 26:** fazer o fluxo inteiro na tela como a banca faria, abrir uma issue
para cada bug e corrigir os do núcleo primeiro. Se der, um teste autoral de
follow ou feed (guia 09).

**Revisa:** o fluxo inteiro na tela antes dos merges e os testes. Reforça quem
estiver mais atrasado.

## Diário

<!-- Uma linha por anotação, a mais nova em cima. Ex.:
- **ter 24:** feed pronto; a paginação devolvia o post repetido (#12, corrigido).
-->
- **qui 26:** feed pronto (#16): `GET /feed` cronológico, só de quem você
  segue, com os filtros do rascunho da Camila (várias matérias em `?tag=` e
  `esconder_bate_papo`; marcar matéria não esconde o bate-papo). A tela
  inicial segue o rascunho, com "Carregar mais" e o feed vazio levando para a
  turma. O próprio post não entra no feed (decisão 3): depois de postar, um
  aviso leva para o diário. Último `@skip` do núcleo removido. A pasta
  `/rascunho-feed` ficou para a Camila tirar, já que é dela.
- **ter 24:** revisão do follow (Camila, #33): textos de erro do `<BotaoSeguir>`
  no padrão do DESIGN.md; clique duplo rápido não dá mais 500 (o
  `IntegrityError` vira 204, como nas curtidas, com teste); `@skip` do teste de
  follow do núcleo removido, já que o perfil está na main. Fecha o #15.
- **seg 23:** follow pronto (#15). Além do `POST`/`DELETE`, criei
  `GET /usuarios/{username}/follow` (`seguindo`, `seguidores`, `eu_mesmo`),
  que o `<BotaoSeguir>` usa para saber o próprio estado. Seguir a si mesmo dá
  400; usuário inexistente, 404. Os testes estão em `tests/test_follows.py`.
- **seg 23 (combinar com B):** o `@skip` de `test_follow_unfollow_com_contadores`
  fica até o `GET /usuarios/{username}` da Camila entrar, porque o teste lê os
  contadores ali. Para ela não reescrever a contagem: `contar_seguidores(db, id)`
  e `contar_seguindo(db, id)` em `app/services/follows.py`.
