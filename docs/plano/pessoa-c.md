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
- [x] `POST` e `GET /posts/{id}/comentarios`, em ordem cronológica e paginados.
- [x] Tela: lista de comentários e campo para comentar, a partir do card.
- [x] O `PostOut` da B ganha a contagem de comentários.
- [x] Tirar o `@skip` de `test_comentarios_planos_cronologicos`.

**Qua 25: seed com cara de vestibulando.** O nicho tem que aparecer no seed
(rubrica, Produto, pergunta 3).
- [x] `seed_fake(db)` em `scripts/seed.py`: pelo menos 20 usuários, 50 posts, 20
    follows e 30 curtidas (o teste do núcleo exige), mais comentários.
- [x] Metas espalhadas para que cada turma tenha gente, inclusive "Outros
    vestibulares" e "Outros cursos" (com o texto preenchido, como "quer
    Geografia"); posts escritos como um
    vestibulando escreve, com tag de matéria e duração, nas últimas semanas.
- [x] Uns com a ofensiva em dia, outros com ela quebrada e um recorde, para a
    ofensiva aparecer de verdade no vídeo.
- [x] Um usuário de demonstração com senha conhecida, para o vídeo e para a banca.
- [x] Tirar o `@skip` de `test_seed_fake_popula_a_rede`.
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
- **qui 26:** fotos no seed, para a imagem nos posts (#105, do Gustavo) aparecer no vídeo. São 8 fotos do Pexels e do Unsplash (licença livre, sem rosto), com autor e link de cada uma em `scripts/fotos_seed/CREDITOS.md`; nada do Pinterest, porque o repositório e o site são públicos. Cada foto vai para um post do mesmo assunto (`FOTOS` em `seed_dados.py`): as contas de campo elétrico num post de eletrodinâmica, o caderno de química orgânica num de funções orgânicas, os mapas mentais em "Revisão de ... com mapa mental", os post-its em "Resumo ... colado na parede". Entre os posts que servem, vão para os da Ada e de quem ela segue, que aparecem no feed dela. Também no #110: um agendamento no GitHub visita a API a cada 10 min, para o Render não dormir durante a avaliação e o banco não voltar ao seed (decidi gastar as horas grátis, que cabem com a API como único serviço).
- **qui 26:** a página do post demorava no site público: ela esperava o post chegar para só então pedir os comentários, e as duas esperas se somavam. Agora a página pede os dois juntos (`lib/precarregar.ts`: o pedido começa na `FolhaDoPost` e a conversa usa o que já está a caminho, valendo por 10 s para nunca mostrar dados velhos). Enquanto carrega, aparece o esqueleto da folha e das caixinhas, em vez de "Carregando..." solto, e o título diz "Comentários" em vez de "0 comentários", que fazia parecer que ninguém tinha comentado. Testado com a rede atrasada de propósito: a conversa chega junto com o post.
- **qui 26:** "Ver conversa", ideia da Camila. Na página do post, um comentário com 3 respostas ou mais mostra só o link "Ver conversa (N respostas)", que abre `/posts/{id}/comentarios/{comentarioId}`: o post em cima e o comentário em destaque com todas as respostas, como no Twitter. A rota nova `GET /posts/{id}/comentarios/{comentarioId}` reaproveita a árvore do `core/`. Quem responde e faz a conversa recolher vai direto para ela, senão a própria resposta sumiria da tela. A busca do post virou o `<FolhaDoPost>`, usado pelas duas páginas. Fiz a tela também, para não dar trabalho à Camila na véspera. Junto entraram as sugestões do Gustavo no #83: as respostas param em 10 níveis (422 depois disso, para a recursão do `core/` não estourar com uma corrente criada pela API), o terceiro nível não recua mais no celular, e o seed ganhou uma conversa de 5 falas num post da Ada para o "Ver conversa" aparecer no vídeo.
- **qui 26:** respostas e curtidas em comentários, a pedido da Camila (o desenho do #73 já reservava o lugar delas). Segui o contrato de "Comentários em árvore" do `CONTRATO.md`: o `POST` aceita `parent_id` (404 se o pai não existe ou é de outro post) e o `GET` traz as respostas dentro de cada comentário, em ordem cronológica. A árvore é montada em `core/arvore.py`, em Python puro, O(n) no número de respostas do post (o Big O está no `DECISIONS.md`). A página continua contando só os comentários diretos, então o teste do núcleo não mudou. Curtir comentário segue a curtida do post (`POST`/`DELETE .../comentarios/{id}/curtir`, idempotente), e o `<BotaoCurtir>` ganhou o prop `caminho` para servir aos dois. Na tela, do terceiro nível em diante as respostas não recuam mais e dizem a quem respondem, senão o texto fica espremido no celular. **Banco:** o comentário ganhou a coluna `parent_id`, então depois do pull é preciso apagar o `backend/app.db` e rodar `make seed` (o Render recria sozinho). Pensei em pôr os meus comentários e os de quem eu sigo no topo, mas o núcleo pede ordem cronológica e deixei como estava.
- **qui 26:** deploy no ar (#14). Backend no Render (`https://caderno-api-p944.onrender.com`), com `SEED_ON_BOOT=true` e `CORS_ORIGINS` com o site, seguindo a `main` depois do merge do #59. O Gustavo publicou o front na Vercel (`https://caderno-wheat.vercel.app`) apontando para essa API. Conferido: o site da Vercel é aceito e outra origem é recusada, o login da demo entra e o atalho `X-User-Id` dá 401 sem `DEBUG`. Decidi não usar um ping para o Render não dormir, para não gastar as horas grátis: a primeira visita depois de ~15 min parado leva uns 30 s, e o banco volta ao seed quando ele reinicia (o vídeo precisa ser gravado de uma vez; na apresentação, abrir o site uns minutos antes).
- **qua 25:** código do deploy pronto (#14). Com `SEED_ON_BOOT=true` o `main.py` roda o seed ao ligar (o disco do Render zera a cada restart), e o CORS lê a URL pública da variável `CORS_ORIGINS` em vez de ela ficar escrita no código: se a URL da Vercel mudar, é só trocar a variável, sem commit. Para o `main.py` conseguir importar o seed, o `seed.py` passou a importar `scripts.seed_dados`. Testado aqui com a configuração de produção: rede populada no boot, CORS só para a URL do front, atalho `X-User-Id` recusado sem `DEBUG`.
- **ter 24:** seed pronto (#13), um dia antes do plano. São 25 vestibulandos escritos à mão em `scripts/seed_dados.py` (sem o faker, para a rede ter cara de turma), com todas as turmas cheias, inclusive "Outros vestibulares" (PSS da UFPB, PAS da UnB) e "Outros cursos" ("quer Geografia"). Cada um tem uma rotina: **firme** (ofensiva em dia, as folgas respeitam a decisão 4), **quebrou** (parou 6 dias e recomeçou: o perfil mostra o recorde) ou **solta**. As datas contam a partir de hoje, então a ofensiva continua em dia quando o seed rodar no deploy. O usuário de demonstração é o `ada` (senha `senha-forte-123`), com ofensiva de 20 dias e 15 seguidores. Os ada, linus e grace do esqueleto saíram. O hash é o mesmo `bcrypt` da auth. `tests/test_seed.py` confere turmas, login da demo, datas e a ofensiva com o próprio `core/ofensiva.py`.
- **ter 24:** comentários prontos (#12). A contagem é outro `column_property` no `Post`, como a das curtidas, e o `Comment` traz o autor na mesma consulta (`lazy="joined"`). Na tela, o card ganha `<LinkComentarios post={post} />` no `rodape`, que leva para a página nova `/posts/{id}`: o card com o `<BotaoCurtir>` e a conversa embaixo, com "carregar mais" e o campo de comentar. Escolhi uma página em vez de abrir a conversa dentro do card para o feed não ficar comprido e o post ganhar um link próprio. **Feed (D), perfil (B) e turmas (D):** ponham `<LinkComentarios post={post} />` ao lado do `<BotaoCurtir>`.
- **seg 23:** curtidas prontas (#11). A contagem é um `column_property` no model `Post` (sugestão do Gustavo), que vem na mesma consulta do post. O `curtido_por_mim` sai de `services/curtidas.py` (`marcar_curtidos`), com uma consulta só para a lista inteira: **feed (D), perfil (B) e turmas (D) chamam `marcar_curtidos(db, user, posts)` antes de devolver os posts** e põem `<BotaoCurtir post={post} />` no `rodape` do card. Por isso o `test_post_traz_o_autor_na_mesma_consulta` passou de 2 para 3 consultas. No rascunho do feed, o botão aparece só nos posts de verdade.
