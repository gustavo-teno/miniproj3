# Pessoa C (Dados): Curtidas → Comentários → Seed → Deploy

Plano e diário de progresso da Pessoa C. Quem ocupa o papel está na
tabela "Quem faz o quê" do [PLANO.md](../../PLANO.md), junto com o cronograma
do time e o contrato.

**Como usar:** marque `[x]` no que ficou pronto, no mesmo PR da tarefa. Anote
abaixo, em "Diário", o que mudou no plano, decisões pequenas e bugs. Bug que
trava outra pessoa vira issue, com o link aqui.

## Plano

**Seg 23: curtidas.** Começa com `make check` verde (guia 00).
- [x] `POST` e `DELETE /posts/{id}/curtir`, idempotentes.
- [x] O `GET /posts/{id}` ganha `curtidas` e `curtido_por_mim`.
- [x] Botão de curtir dentro do `<CardPost>`.
- [x] Tirar o `@skip` de `test_curtidas_idempotentes`.
- **Combinar com B:** o `PostOut` (formato do post) e o `<CardPost>` são dela;
    você acrescenta neles as curtidas. Ao apagar um post, a B apaga junto as
    curtidas e os comentários dele.

**Ter 24: comentários.**
- [ ] `POST` e `GET /posts/{id}/comentarios`, em ordem cronológica e paginados.
- [ ] Tela: lista de comentários e campo para comentar, a partir do card.
- [ ] O `PostOut` da B ganha a contagem de comentários.
- [ ] Tirar o `@skip` de `test_comentarios_planos_cronologicos`.

**Qua 25: seed com cara de vestibulando.** O nicho tem que aparecer no seed
(rubrica, Produto, pergunta 3).
- [ ] `seed_fake(db)` em `scripts/seed.py`: pelo menos 20 usuários, 50 posts, 20
    follows e 30 curtidas (o teste do núcleo exige), mais comentários.
- [ ] Metas espalhadas para que cada turma tenha gente, inclusive "Outros
    vestibulares" e "Outros cursos" (com o texto preenchido, como "quer
    Geografia"); posts escritos como um
    vestibulando escreve, com tag de matéria e duração, nas últimas semanas.
- [ ] Uns com a ofensiva em dia, outros com ela quebrada e um recorde, para a
    ofensiva aparecer de verdade no vídeo.
- [ ] Um usuário de demonstração com senha conhecida, para o vídeo e para a banca.
- [ ] Tirar o `@skip` de `test_seed_fake_popula_a_rede`.
- **Combinar com A:** usar a mesma função de hash da auth e as listas do
    contrato.

**Qui 26: deploy (+10)** seguindo o guia 08: backend no Render, front na
Vercel, `SEED_ON_BOOT`, CORS com a URL pública e nunca `DEBUG` em produção.
Testar cadastro → login → post → follow → feed na URL.

**Revisa:** PRs que mexem no seed, em `core/` e na configuração do deploy.

## Diário

<!-- Uma linha por anotação, a mais nova em cima. Ex.:
- **ter 24:** feed pronto; a paginação devolvia o post repetido (#12, corrigido).
-->
- **seg 23:** curtidas prontas (#11). A contagem é um `column_property` no model `Post` (sugestão do Gustavo), que vem na mesma consulta do post. O `curtido_por_mim` sai de `services/curtidas.py` (`marcar_curtidos`), com uma consulta só para a lista inteira: **feed (D), perfil (B) e turmas (D) chamam `marcar_curtidos(db, user, posts)` antes de devolver os posts** e põem `<BotaoCurtir post={post} />` no `rodape` do card. Por isso o `test_post_traz_o_autor_na_mesma_consulta` passou de 2 para 3 consultas. No rascunho do feed, o botão aparece só nos posts de verdade.
