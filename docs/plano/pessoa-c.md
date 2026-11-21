# Pessoa C (Dados): Curtidas → Comentários → Seed → Deploy

Plano e diário de progresso da Pessoa C. Quem ocupa o papel está na
tabela "Quem faz o quê" do [PLANO.md](../../PLANO.md), junto com o cronograma
do time e o contrato.

**Como usar:** marque `[x]` no que ficou pronto, no mesmo PR da tarefa. Anote
abaixo, em "Diário", o que mudou no plano, decisões pequenas e bugs. Bug que
trava outra pessoa vira issue, com o link aqui.

## Plano

**Seg 23: curtidas.** Começa com `make check` verde (guia 00).
- [ ] `POST` e `DELETE /posts/{id}/curtir`, idempotentes.
- [ ] O `GET /posts/{id}` ganha `curtidas` e `curtido_por_mim`.
- [ ] Botão de curtir dentro do `<CardPost>`.
- [ ] Tirar o `@skip` de `test_curtidas_idempotentes`.
- **Combinar com B:** o schema do post e o `<CardPost>` são dela.

**Ter 24: comentários.**
- [ ] `POST` e `GET /posts/{id}/comentarios`, em ordem cronológica e paginados.
- [ ] Tela: lista de comentários e campo para comentar, a partir do card.
- [ ] O post ganha a contagem de comentários.
- [ ] Tirar o `@skip` de `test_comentarios_planos_cronologicos`.

**Qua 25: seed com cara de vestibulando.** O nicho tem que aparecer no seed
(rubrica, Produto, pergunta 3).
- [ ] `seed_fake(db)` em `scripts/seed.py`: pelo menos 20 usuários, 50 posts, 20
    follows e 30 curtidas (o teste do núcleo exige), mais comentários.
- [ ] Metas espalhadas para que cada turma tenha gente; posts escritos como um
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
