# Pessoa D (Reforço): Follow → Feed → Turmas

Plano e diário de progresso da Pessoa D. Quem ocupa o papel está na
tabela "Quem faz o quê" do [PLANO.md](../../PLANO.md), junto com o cronograma
do time e o contrato.

**Como usar:** marque `[x]` no que ficou pronto, no mesmo PR da tarefa. Anote
abaixo, em "Diário", o que mudou no plano, decisões pequenas e bugs. Bug que
trava outra pessoa vira issue, com o link aqui.

## Plano

**Seg 23: follow.** Começa com `make check` verde (guia 00).
- [ ] `POST` e `DELETE /usuarios/{username}/follow`, idempotentes.
- [ ] Componente `<BotaoSeguir username=... />`, usado no perfil e nas turmas.
- [ ] Tirar o `@skip` de `test_follow_unfollow_com_contadores`.
- **Combinar com B:** os contadores ficam no `GET /usuarios/{username}` dela.

**Ter 24: feed e núcleo verde.**
- [ ] `GET /feed`, cronológico e paginado, só de quem você segue, com opção de
    esconder o bate-papo.
- [ ] Tela inicial: feed com "carregar mais", o filtro de bate-papo, e o feed vazio
    com um convite para conhecer a turma (decisão 3).
- [ ] Tirar o `@skip` de `test_feed_cronologico_dos_seguidos` e conferir se todos
    os testes do núcleo passam. É a meta da terça à noite.

**Qua 25: Turmas** (decisão 5).
- [ ] Rotas para listar as turmas (uma por vestibular e uma por curso, com o número
    de membros), os membros de uma turma e os posts deles, com filtro por
    matéria.
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
