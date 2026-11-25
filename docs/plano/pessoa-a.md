# Pessoa A — Gustavo (Back): Esqueleto → Auth → Ofensiva

Plano e diário de progresso da Pessoa A, que é o Gustavo (@gustavo-teno). O
papel está na tabela "Quem faz o quê" do [PLANO.md](../../PLANO.md), junto com o cronograma
do time e o contrato.

**Como usar:** marque `[x]` no que ficou pronto, no mesmo PR da tarefa. Anote
abaixo, em "Diário", o que mudou no plano, decisões pequenas e bugs. Bug que
trava outra pessoa vira issue, com o link aqui.

## Plano

**Sáb 21: esqueleto.** É o único bloqueio do time, então sai cedo e pequeno.
- [x] `app/deps.py`: o bypass do guia 01, Passo 0 (`DEBUG=true` + `X-User-Id`).
- [x] Os models da tabela do contrato, cada um no seu arquivo em `app/models/`, e
    os campos novos do `User`.
- [x] As constantes: tags, vestibulares e cursos, copiadas das listas do
    contrato no PLANO.md, e a rota `GET /opcoes`, que as entrega às telas.
- [x] Um router vazio por feature em `app/routers/` (`auth`, `posts`, `follows`,
    `curtidas`, `comentarios`, `feed`, `ofensiva`, `turmas`, `dms`), todos
    registrados no `main.py`.
- [x] `make test` continua verde (os testes do núcleo seguem com `@skip`).
- **Combinar com B:** B revisa e aprova o PR. Avisar no grupo quando entrar na
    `main`, porque todo mundo parte dele.

**Dom 22: auth no backend** (guia 01, Passos 1 a 3).
- [x] Model `Session` (token opaco), senha com bcrypt.
- [x] `POST /auth/registro` (aceita `vestibular`, `curso` e `universidade`
    opcionais, para o cadastro já trazer a meta; recusa os usernames `eu` e
    `stats`, que são caminhos de `/usuarios`), `POST /auth/login`,
    `GET /auth/eu` e o `get_current_user` real, mantendo o bypass com `DEBUG`.
- [x] Tirar o `@skip` de `test_auth_registro`, `test_auth_login` e `test_auth_eu`.
    A partir daqui a fixture `logar` funciona e os outros testes podem destravar.

**Seg 23: auth na tela.**
- [x] Páginas `/cadastro` (nome, username, senha e a meta: vestibular e curso em
    lista, vinda de `GET /opcoes`, universidade em texto; quem escolhe "Outro" pode escrever qual é a
    meta) e `/login`; botão de sair.
- [x] Salvar o token e mandá-lo no `Authorization` de `lib/api.ts`; páginas
    protegidas mandam para `/login` sem token.
- [x] Depois do cadastro, levar a pessoa para a própria turma (decisão 3). Até a
    tela de Turmas existir (quarta), levar para o feed.
- **Combinar com B:** `lib/api.ts` é da área dela. **Com D:** o endereço da
    página da turma.

**Ter 24: cálculo da ofensiva.**
- [x] `app/core/ofensiva.py`, em Python puro: recebe os dias com post de matéria e
    devolve a ofensiva atual e o recorde, com 2 folgas por semana (segunda a
    domingo, horário de Brasília).
- [x] Testes dos casos de borda: semana virando, post perto da meia-noite, folga
    que não soma, ofensiva quebrada com recorde.
- [x] Teste do post de bate-papo que não conta (fica para quarta, junto com a
    rota, que é quem separa matéria de bate-papo).

**Qua 25: ofensiva no produto.**
- [x] `GET /usuarios/{username}/ofensiva` → ofensiva atual, recorde e o resumo da
    semana (horas desta semana e da passada, somando os `minutos` dos posts).
- [x] Componente `<Ofensiva username=... />` com o número, o recorde ao lado
    quando quebrou, e o "esta semana: 12h, semana passada: 9h".
- [x] O fogo da ofensiva muda de cor com a ofensiva atual, como a temperatura
    de uma chama (do mais frio ao mais quente): 1 a 6 dias vermelho, 7 a 13
    laranja, 14 a 29 amarelo, 30 a 59 branco, 60 a 99 azul-claro, 100 ou mais
    azul (combinado com a Camila em 22/11; os tons exatos ela ajusta para o
    modo claro e o noturno, cuidado com o branco no fundo claro). Sem nomes
    de nível, para não virar comparação. Quebrou, a cor volta ao início junto com o número.
- [x] Legenda das cores, para não depender só da cor:
    - Computador: passar o mouse mostra "N dias seguidos"; clicar abre uma
      telinha com a legenda (qual cor é qual faixa, marcando a da pessoa).
    - Celular (sem mouse): tocar mostra "N dias seguidos" com uma setinha;
      tocar na setinha abre a mesma telinha da legenda.
- **Combinar com B:** onde o componente entra no topo do perfil, e os tons
    exatos do fogo (não confundir com as cores das matérias).
- [x] Registrar na decisão 4 do DECISIONS.md, com o porquê de cor em vez de
    títulos (tipo "Excursionista" e "Patrulheiro")

**Qui 26:**
- [x] Escrever a escolha técnica no DECISIONS.md (por que a ofensiva fica em
    `core/` e qual o Big O do cálculo). Feito na seg 23.

## Extras (depois que a parte de A ficou pronta, na seg 23)

Antes de cada dia, olhar o grupo: se alguém travou no núcleo, ajudar vem antes.

**Ter 24: DMs no backend** (#18, decisão 6). PR com `Parte de #18`.
- [ ] Só entre mútuos: as duas pessoas se seguem, senão 403. A regra fica no
    service, lendo o model `Follow` (só leitura, a área é do Pedro).
- [ ] Enviar mensagem, listar as conversas (a outra pessoa, a última mensagem e
    quantas não lidas) e buscar as mensagens de uma conversa, com a opção de
    pedir só as que vieram depois da última que a tela já tem (pelo `id`, que
    não repete nem pula mensagem enviada no mesmo segundo).
- [ ] Não lidas: uma tabela nova que guarda até qual mensagem cada pessoa já
    leu em cada conversa. Tabela nova o `create_all` cria sozinho, então
    ninguém precisa apagar o banco local (coluna nova precisaria).
- [ ] Testes: não mútuos recebem 403, a conversa só aparece para as duas
    pessoas, o "depois de" traz só as novas, e abrir a conversa zera as não lidas.

**Qua 25: DMs na tela.** PR com `Closes #18`.
- [ ] `/mensagens`: a lista de conversas; `/mensagens/[username]`: a conversa,
    que pergunta as novas a cada poucos segundos e para quando a aba fica
    escondida.
- [ ] Ligar a aba "Mensagens" (`MOSTRAR_MENSAGENS` em `Navegacao.tsx`) com o
    número de não lidas.
- [ ] `<BotaoMensagem username=... />` no perfil, que só aparece entre mútuos.
- **Combinar com B:** a navegação e o perfil são da área dela, mas na quarta
    e na quinta ela está nos ajustes visuais e no vídeo. Então a aba, o botão
    no perfil e o link "Buscar" vão prontos no meu PR, avisando no texto do PR
    o que mudou na área dela (como no #29), e ela só revisa.

**Qui 26: Busca** (#38). PR com `Closes #38`.
- [ ] `GET /busca?q=...&tipo=pessoas|posts`, sem diferença de acento nem de
    maiúscula ("calculo" acha "Cálculo").
- [ ] `/busca` com as abas Pessoas e Posts, que espera a pessoa parar de
    digitar antes de buscar.
- [ ] Link "Buscar" na navegação, pronto no PR para B revisar.
- De manhã, o DECISIONS final (#21).

**Se sobrar tempo:** notificações (alguém curtiu, comentou ou começou a te
seguir). Dependem das curtidas, dos comentários e do follow já estarem na
`main`.

**Revisa:** PRs que mexem em models, routers, services e `main.py`.

## Diário

<!-- Uma linha por anotação, a mais nova em cima. Ex.:
- **ter 24:** feed pronto; a paginação devolvia o post repetido (#12, corrigido).
-->
- **ter 24:** Busca (#38) adiantada de quinta, numa branch separada das DMs. Viraram duas rotas, `GET /busca/pessoas?q=` (nome ou @, em ordem alfabética) e `GET /busca/posts?q=` (texto, do mais novo), em vez de uma com `?tipo=`, porque cada uma devolve um formato. Sem diferença de acento nem de maiúscula: `sem_acento()` em `core/texto.py`, registrada como função do SQLite em `app/db.py`, compara o que a pessoa digitou com o texto guardado. Sem coluna nova, então ninguém recria o banco. Custo O(N) por busca (LIKE com % no começo não usa índice); numa rede grande, seria a hora de um índice de texto (FTS). `%` e `_` digitados viram texto comum. Na tela, `/busca` com as abas Pessoas e Posts, que espera 300 ms depois da última tecla, e uma lupa no topo ao lado da engrenagem. **Para a Camila:** a lupa mexe na `Navegacao.tsx` (área dela).
- **ter 24:** combinado na revisão do PR 42 (perfil da Camila): as horas da semana passam a ser privadas também na API. `GET /usuarios/{username}/ofensiva` só manda os minutos para a dona do perfil; para quem visita, eles vêm `null` (antes a tela escondia, mas a rota mostrava a qualquer pessoa logada). A rota ganhou `minutos_por_dia` (segunda a domingo desta semana), para as barras do diário não refazerem a conta no navegador. O `components/Ofensiva.tsx` saiu: o perfil usa o `FogoDoDiario` da Camila. O backend também aceita o front na porta 3001. **Para a Camila:** o `HorasEstudadas` precisa tratar o `null` e pode ler `minutos_por_dia`; a classe `.cor-fogo` do `globals.css` ficou sem uso e pode sair no seu PR.
- **seg 23:** peguei as extras: DMs (#18) na terça e na quarta e Busca (#38) na quinta. As DMs ganharam o contador de não lidas, que antes estava no "O que cortamos" da decisão 6 (atualizada).
- **seg 23:** ajustes que sobraram da revisão do PR 29: os erros 422 saem traduzidos com o nome do campo, toda mensagem segue o padrão impessoal ("Não foi possível...", maiúscula e ponto), backend fora do ar não mostra mais "Failed to fetch", o cadastro tira os espaços das pontas antes de enviar, e quem já entrou e abre /login ou /cadastro vai para o feed (`useSoSemLogin`).
- **seg 23:** escolha técnica escrita no DECISIONS.md (adiantada de quinta), no PR 32: por que a ofensiva é calculada na hora numa função pura em `core/` em vez de guardada, e o custo (O(D + P) por chamada, com o `set` dando consulta O(1) por dia).
- **seg 23:** rota e componente da ofensiva prontos (adiantados de quarta). `GET /usuarios/{username}/ofensiva` exige login e devolve a ofensiva, o recorde, as folgas, o aviso "estude hoje" e os minutos desta semana e da passada. As horas da semana somam só posts de matéria, como a ofensiva (bate-papo com duração não conta). **Para a Camila:** `<Ofensiva username=... />` está em `components/Ofensiva.tsx`, pronto para o topo do perfil; os tons do fogo são provisórios (lista `FAIXAS` no mesmo arquivo) e a classe `.cor-fogo` entrou no `globals.css`, no esquema da `.cor-materia`.
- **dom 22:** aviso da Camila na revisão do #30, **para quem pegar Curtidas (#11) e Comentários (#12):** o `PostOut` agora sai direto do model `Post`, sem o `para_out`. Os números de curtidas e de comentários não existem no `Post`, então precisam ser calculados. Sugestão: uma contagem no próprio model (`column_property` com `select(func.count(...))`), que vem na mesma consulta do post e que o `PostOut` lê sozinho. Já o "eu curti este post?" depende de quem está vendo e fica no service. Model é da área da Pessoa A: combinar comigo antes.
- **dom 22:** #28, combinado na revisão do #27 (posts da Camila): o `created_at` de todas as tabelas sai com o fuso UTC (tipo `DataHoraUTC` e `CriadoEm` em `app/db.py`, no lugar da mesma linha repetida em 7 models), e o `Post` traz o autor na mesma consulta (`relationship` com `lazy="joined"`), o que deixou o `para_out` sem uso. O banco local não precisa ser recriado: a coluna é a mesma.
- **dom 22:** auth na tela pronta (adiantada de segunda): `/cadastro` com a meta, `/login`, sair apagando a sessão no backend e o feed protegido. O token mora em `lib/sessao.ts` e o `lib/api.ts` (área da Camila) só o lê; ele agora também mostra a mensagem dos erros 422 do backend em vez de "→ 422". Com o atalho de teste (`NEXT_PUBLIC_DEV_USER_ID`) ligado, o feed não pede login. Falta combinar com D o endereço da turma para o cadastro levar até ela.
- **dom 22:** a Camila topou o fogo que muda de cor com a ofensiva (6 faixas, do vermelho ao azul, como a temperatura de uma chama) e a legenda no clique/setinha. Registrado na decisão 4.
- **dom 22:** revisão antes da Camila: a ofensiva nova herdava as folgas gastas pela que quebrou (agora zera), e na segunda depois de sáb e dom parados a tela ia mostrar folga sobrando quando a pessoa precisa postar (novo campo `precisa_estudar_hoje`). Criei `hoje_em_brasilia()` para a rota de quarta não usar o dia do servidor.
- **dom 22:** cálculo da ofensiva adiantado (era de terça) enquanto o PR da auth espera revisão. Regra nova: no máximo 2 dias seguidos sem estudar, senão sábado, domingo, segunda e terça davam 4 dias parados (DECISIONS, decisão 4). Hoje sem post fica em aberto até a meia-noite. Brasília como UTC-3 fixo, sem `zoneinfo`, que no Windows pede pacote extra. O teste de "bate-papo não conta" fica para quarta: quem separa matéria de bate-papo é a rota, não o cálculo.
- **dom 22:** auth no backend pronta. Além do guia: `POST /auth/logout` apaga a sessão no banco, e o cadastro valida a meta contra as listas. Tirei a `/usuarios/eu-temporario` e troquei o `buscarEu()` do `api.ts` para `/auth/eu`, como a Camila tinha deixado combinado no código.
