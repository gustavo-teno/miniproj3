# Decisões do time

**Time:** Gustavo (@gustavo-teno), Pedro (@Pedrolk647), Clarisse
(@clarissegabriela31-coder), Camila (@camilaabmf)

## Produto

- **Público:** vestibulandos (ENEM, Fuvest, Unicamp, ITA, IME e outros) que
  estudam sozinhos em casa, por cursinho online ou por conta própria, sem
  colegas por perto para dividir a rotina.
- **Problema:** quem estuda sozinho sente falta de uma turma e vai procurá-la
  nas comunidades de estudo das redes grandes (studytwt, studygram, servidores
  do Discord). Só que lá o estudo disputa espaço com polêmicas e assuntos
  aleatórios, que distraem e geram ansiedade. Muitos servidores de estudo do
  Discord usam rankings de horas, o que alimenta a comparação com os outros. E
  a evolução de cada um se perde: no chat, a mensagem some em minutos, e no
  Twitter o perfil mistura estudo com todo o resto.
- **Como a rede resolve:** um espaço só para vestibulandos, em que cada perfil
  é um diário de estudos organizado por matéria. Você encontra e acompanha quem
  tem a mesma meta, conversa com a turma sobre o dia a dia do vestibular, e a
  rede nunca coloca ninguém num ranking.
- **Como saberíamos que funcionou:** a pessoa volta no dia seguinte para
  registrar a própria sessão de estudo e comentar a de quem ela segue.
- **Nome:** o margem, com artigo masculino, como "o Trilha". A margem do
  caderno é o espaço que é só seu: ali você anota a dúvida, o resumo e o
  lembrete, sem se comparar com ninguém (decisão 1). O primeiro nome foi
  Post-it, que trocamos por ser marca registrada da 3M. O nome fica num lugar
  só no código (`NOME_REDE`, em `frontend/lib/rede.ts`), então trocar é mudar
  uma linha.

## Decisões de produto

### 1. A rede não compara por você

- **Contexto:** a comparação com outros estudantes pesa muito na ansiedade de
  quem está no vestibular, e muitas comunidades de estudo do Discord usam
  rankings de horas como motor.
- **Opções:** ranking de horas e questões (como esses servidores) ou nenhum
  ranking entre usuários.
- **Escolha:** nenhum ranking. Cada post de estudo registra quanto tempo durou
  a sessão, e o perfil compara a pessoa só com ela mesma ("esta semana: 12h,
  semana passada: 9h"). Os usuários continuam livres para falar de horas e
  questões nos posts, porque é isso que gera dicas e conecta rotinas parecidas.
- **O que cortamos e por quê:** o leaderboard e os títulos de "quem estudou
  mais". Eles engajam, mas reproduzem a pressão da qual o público quer fugir.

### 2. Perfil como diário com divisórias por matéria

- **Contexto:** no Twitter, o perfil é um caderno de rascunho; no Discord, a
  conversa some em minutos. Em nenhum dos dois dá para ver como alguém evoluiu.
  Ao mesmo tempo, a conversa solta entre vestibulandos ("como foi o dia de
  vocês?") é o que faz a pessoa se sentir parte de uma turma.
- **Opções:** perfil com lista simples de posts; perfil organizado só por
  matéria; ou matérias mais uma tag de bate-papo.
- **Escolha:** todo post tem uma tag: uma matéria (de uma lista fixa) ou
  "bate-papo". O perfil funciona como um caderno com divisórias, com a meta da
  pessoa (vestibular, curso e universidade) no topo. Vestibular e curso são
  escolhidos de uma lista, não digitados, para que "Medicina", "medicina" e
  "Med" não virem três metas diferentes (é a meta que forma as turmas, decisão
  5). Os posts de bate-papo
  aparecem no feed por padrão, porque a solidão é o problema central e quem
  acaba de chegar precisa sentir o clima de turma; quem quer foco total pode
  escondê-los. A identidade visual segue a ideia de caderno.
- **O que cortamos e por quê:** posts sem tag. A pessoa gasta um clique a mais
  para postar, mas o diário continua legível e quem quer foco total consegue
  esconder a conversa.

### 3. Feed cronológico, só de quem você segue

- **Contexto:** o studytwt fica dentro de uma rede cheia de polêmicas e
  distrações, que geram estresse em quem está estudando. Mas um feed só de quem
  você segue começa vazio, justamente para quem acabou de chegar e mais precisa
  de uma turma.
- **Opções:** feed por engajamento ("Em alta"), ou feed cronológico só das
  pessoas que você segue.
- **Escolha:** feed cronológico, só com quem você segue. Para o feed não
  começar vazio, quem acaba de se cadastrar é levado para a própria turma
  (decisão 5), e o feed vazio mostra um convite para conhecê-la.
- **O que cortamos e por quê:** o feed algorítmico. Ele resolve dois problemas
  que não são nossos: o excesso de conteúdo de quem segue centenas de pessoas
  (aqui você segue a sua turma e consegue ver tudo) e a descoberta de gente
  nova (aqui ela acontece nas turmas, pela meta). E ele tende a impulsionar o
  post extremo ("estudei 14h hoje") e a polêmica, justamente o que afasta esse
  público.

### 4. Ofensiva que perdoa

- **Contexto:** ver a sequência de dias crescer motiva a voltar todo dia, mas
  o streak tradicional zera no primeiro dia sem estudo e transforma o descanso,
  que é saudável no vestibular, em fracasso.
- **Opções:** streak diário sem folga (como o Duolingo sem congelamento),
  sequência contada em semanas, ou dias com folgas semanais.
- **Escolha:** a ofensiva conta dias estudados, e só posts com tag de matéria
  contam. Cada pessoa tem 2 folgas por semana (de segunda a domingo, no horário
  de Brasília), e no máximo 2 dias seguidos sem estudar: o terceiro quebra a
  ofensiva, para a semana virando não permitir 4 dias parados. A folga é usada
  automaticamente: mantém a ofensiva, mas não soma ao número. O dia de hoje só
  conta depois que acaba. Quando a ofensiva quebra, o perfil mostra o recorde
  ao lado, e as folgas da semana voltam para a ofensiva nova.
  O número aparece no perfil, mas nunca numa lista ou ranking. O fogo ao lado
  do número muda de cor com a ofensiva atual, como uma chama esquentando: 1 a
  6 dias vermelho, 7 a 13 laranja, 14 a 29 amarelo, 30 a 59 branco, 60 a 99
  azul-claro e 100 ou mais azul. Se a ofensiva recomeça, o fogo também volta
  ao vermelho. Uma legenda (clique no computador, setinha no
  celular) mostra qual cor é qual faixa, para não depender só da cor.
- **O que cortamos e por quê:** o streak sem folga, porque pune o descanso; e
  a contagem por semanas, porque o número cresce devagar e motiva menos.
  Também deixamos para depois a escolha do número de folgas (de 1 a 3): a regra
  fixa já resolve o problema e cabe no prazo.
  E os níveis com nome (como "Excursionista" e "Patrulheiro" no Discord):
  nome cria uma escada que se compara em voz alta ("estou dois níveis abaixo
  dele"), e a cor dá a sensação de evolução sem virar hierarquia.

### 5. Turmas formadas pela meta

- **Contexto:** a solidão é o problema central, e quem acaba de chegar não
  conhece ninguém. A rede precisa de um lugar para encontrar quem tem a mesma
  meta, sem depender de um feed algorítmico.
- **Opções:** sugestões soltas de quem seguir; grupos criados pelos usuários,
  com membros e feed próprio; ou turmas formadas automaticamente pela meta do
  perfil.
- **Escolha:** turmas automáticas. Quem marcou ITA está na Turma ITA, e quem
  marcou Engenharia está na Turma Engenharia, então cada pessoa já entra em
  duas turmas (vestibular e curso). Quem não acha a própria meta na lista, ou
  ainda não decidiu o curso, marca "Outro" e entra em "Outros vestibulares" ou
  "Outros cursos": é ali que quem ficou de fora encontra gente parecida. Para
  isso, a pessoa pode escrever qual é a meta dela ("quer Geografia"), e o texto
  aparece no card dela na turma. As turmas ficam numa aba própria, separada
  do feed, e todas são abertas para qualquer pessoa olhar. A página da turma
  mostra os membros, com o botão de seguir, e os posts deles, com filtro por
  matéria. A conversa da turma são os posts de bate-papo e os comentários. O
  feed é a turma que você escolheu; as turmas são onde você conhece gente.
- **O que cortamos e por quê:** grupos criados pelos usuários e chat em grupo.
  Os grupos espalhariam uma rede pequena em vários grupos vazios e custariam
  bem mais para construir. O chat é justamente onde a evolução de cada um se
  perde no Discord.

### 6. DMs só entre quem se segue mutuamente

- **Contexto:** comentários e bate-papo são conversa em público. É na conversa
  privada que dois desconhecidos da mesma turma viram parceiros de estudo:
  combinam horários, cobram um ao outro, desabafam sobre o simulado. Ao mesmo
  tempo, boa parte dos vestibulandos é menor de idade, e mensagem privada entre
  desconhecidos é um risco real.
- **Opções:** sem DMs; DMs abertas para qualquer pessoa; ou DMs só entre quem
  se segue mutuamente.
- **Escolha:** DMs 1-para-1, liberadas só quando as duas pessoas se seguem. A
  conversa privada vira consequência de conviver na rede (você acompanhou o
  diário da pessoa, ela acompanhou o seu), e não um jeito de abordar
  desconhecidos. A aba "Mensagens" mostra quantas mensagens ainda não foram
  lidas: é o que avisa que o colega respondeu e faz a pessoa voltar para
  combinar a sessão.
- **O que cortamos e por quê:** DMs abertas, pela segurança de um público em
  boa parte menor de idade; e chat em tempo real (WebSocket, "digitando...").
  A conversa se atualiza sozinha a cada poucos segundos, o que basta para
  combinar uma sessão de estudo e cabe no prazo.

## Features

As letras são os papéis do [PLANO.md](PLANO.md). Cada pessoa fez as próprias
features de ponta a ponta: backend, tela e testes.

| Feature | Dono | Por quê (1 frase) |
|---|---|---|
| Auth (núcleo) | Pessoa A (Gustavo) | Cada vestibulando tem o próprio diário e a própria meta. |
| Posts (núcleo) | Pessoa B (Camila) | O registro da sessão de estudo, com tag (matéria ou bate-papo) e duração. |
| Feed (núcleo) | Pessoa D (Pedro) | Cronológico e só de quem você segue, com filtro para esconder o bate-papo. |
| Perfil (núcleo) | Pessoa B (Camila) | O diário com divisórias por matéria, com a meta, a ofensiva e o resumo da semana no topo. |
| Follow (núcleo) | Pessoa D (Pedro) | Acompanhar a jornada de quem tem a mesma meta que você. |
| Curtidas (núcleo) | Pessoa C (Clarisse) | Um apoio rápido para quem estudou hoje. |
| Comentários (núcleo) | Pessoa C (Clarisse) | Dicas e incentivo na sessão do outro, que é o sinal de que a rede funcionou. |
| Seed fake (núcleo) | Pessoa C (Clarisse) | Vestibulandos fictícios com metas e rotinas variadas, para a rede já parecer uma turma; com conversas nos comentários e fotos de estudo, para o vídeo e a banca não abrirem uma rede vazia. |
| Deploy público | Pessoa C (Clarisse) | Quem quiser ver a rede abre um link (Vercel + Render), sem instalar nada, e o que cria continua lá. |
| Ofensiva que perdoa | Pessoa A (Gustavo) | Motiva a voltar todo dia sem punir o descanso (decisão 4). |
| Turmas | Pessoa D (Pedro), com as telas da Pessoa A (Gustavo) | Quem acabou de chegar encontra quem tem a mesma meta e sai do feed vazio (decisão 5). |
| DMs entre mútuos | Pessoa A (Gustavo) | Onde dois colegas da mesma turma viram parceiros de estudo (decisão 6). |
| Busca de pessoas e posts | Pessoa A (Gustavo) | Achar um colega pelo nome ou um post sobre um assunto, sem depender da meta. |
| Curtir mensagem nas DMs | Pessoa A (Gustavo) | Dois toques num balão dizem "valeu" ou "tamo junto" sem precisar escrever, como nos apps de mensagem. |
| Emoji ao escrever | Pessoa A (Gustavo) | Quem escreve pelo computador também comemora uma lista feita com 🔥 ou 💪, como faria no celular. |
| Salvar posts | Pessoa A (Gustavo) | Guardar uma explicação boa ou uma lista de questões para rever depois, só para você. |
| Comentários em árvore, curtir comentário e "Ver conversa" | Pessoa C (Clarisse) | A dúvida de um comentário vira conversa embaixo dele, uma dica boa ganha um "valeu" sem precisar escrever, e uma conversa grande abre numa tela só dela sem encompridar o post. |
| Imagem nos posts de matéria | Pessoa A (Gustavo) | A foto do caderno, do mapa mental ou da lista resolvida mostra o estudo melhor que a descrição; só em post de matéria, porque é registro do estudo, não vitrine (decisão 1). |
| Notificações | Pessoa A (Gustavo) | Quem postou a sessão fica sabendo que a turma curtiu, comentou ou começou a seguir, sem precisar abrir o post de novo para descobrir. |
| Tela de abertura | Pessoa A (Gustavo) | Quem abre o link pela primeira vez vê o que é a rede, com dois posts de exemplo, antes de criar a conta, em vez de cair direto num formulário de login. |

**Comentários em árvore: a árvore é montada a cada pedido.** O
`core/arvore.py` recebe os comentários diretos no post (a página pedida) e
todas as respostas do post, numa consulta só, e pendura cada resposta no pai:
um dict de filhos por pai numa passada e uma recursão que visita cada
comentário uma vez, O(n) no número de respostas do post. Não guardamos a
árvore em memória: a conversa de um post tem dezenas de comentários, então
montar de novo é barato e ela nunca fica desatualizada quando alguém responde
ou um post é apagado. A página continua contando só os comentários diretos, e
a ordem é cronológica em todo nível, como pede o contrato. A tela "Ver
conversa" (`GET /posts/{id}/comentarios/{comentario_id}`) usa a mesma função
para um comentário só. As respostas param em 10 níveis (422 depois disso):
sem limite, uma corrente criada de propósito pela API deixaria a árvore funda
demais para a recursão (o Python para em uns 1.000 níveis).

**Deploy: o Render grátis, sem perder o que a banca cria.** O backend roda no
Render (plano grátis) e o site na Vercel, e cada merge na main publica os dois
sozinhos (no Render, por um Deploy Hook chamado pelo GitHub Actions, porque o
serviço foi criado como repositório público e não recebe o aviso do GitHub).
O disco do Render zera a cada reinício, então o servidor roda o seed ao ligar
(`SEED_ON_BOOT`) e a rede nunca abre vazia. O Render também desliga a API
depois de 15 min sem visita, e aí o que alguém criou some: um agendamento no
GitHub visita a API a cada 10 min para ela não dormir. Cabe nas 750 h grátis
do Render porque é o único serviço da conta. Num produto de verdade, o banco
seria um Postgres gerenciado, que não zera, e nada disso seria preciso.

**Notificações: o contador é montado a cada pedido.** O sino pergunta
`GET /notificacoes/novas` a cada 30 s, com a aba à vista. O
`services/notificacoes.py` faz cinco consultas (curtidas e comentários nos
seus posts, respostas e curtidas nos seus comentários, novos seguidores), cada
uma pelo índice da coluna que filtra (`post_id`, `parent_id`,
`comentario_id`, `seguido_id`). Depois, em Python, agrupa as curtidas por post
num dict em uma passada e conta o que veio depois da marca "visto até": O(n)
no número de ações sobre as suas coisas, mais O(m log m) para ordenar as m
linhas da página. Para a conta com mais movimento do seed (centenas de ações)
responde em uns 10 ms. Não guardamos uma tabela de notificações porque montar
na leitura faz desfazer (descurtir, deixar de seguir, apagar o post) tirar o
aviso sozinho. Numa rede grande, o n cresce com a fama da pessoa: aí valeria
guardar as notificações numa tabela com índice em (destinatário, data) e
contar só as novas no banco, em O(novas), pagando com apagar a linha a cada
"desfazer".

**Login sem prazo de validade (escolha consciente).** O token do login vale
até a pessoa clicar em sair, que apaga a sessão no banco. Uma validade (por
exemplo, 30 dias) pediria uma data na sessão, uma checagem a mais em toda
request e uma tela para o "sua sessão expirou". Para uma rede de teste com
prazo de uma semana, não compensa. Num produto de verdade, seria a primeira
melhoria da auth.

## O que cortamos

Os cortes de cada decisão estão na própria decisão: o ranking (1), o post sem
tag (2), o feed algorítmico (3), o streak sem folga (4), os grupos criados
pelos usuários (5) e as DMs abertas e o chat em tempo real (6). O login sem
prazo de validade está explicado acima. Além deles:

- **Foto de perfil por arquivo.** A foto do perfil é um link para uma imagem
  que já está na internet. Enviar o arquivo pede guardar e servir imagens, e
  isso só valeu a pena no fim, para a imagem dos posts de matéria, que mostra
  o caderno ou a lista de questões resolvida. A base ficou pronta (a imagem
  reduzida no navegador e guardada no banco), mas ficou para depois do prazo.
- **Imagem nas DMs.** Boa parte do público é menor de idade, e imagem numa
  conversa privada é o tipo de conteúdo que ninguém além das duas pessoas vê
  nem tem como denunciar. Sem moderação, preferimos deixar só texto.
- **Bloquear alguém.** Como a DM só existe entre quem se segue (decisão 6),
  deixar de seguir já fecha a conversa. Bloquear de verdade (esconder os
  posts e impedir de seguir de novo) mexeria no feed, nas turmas e na busca, e
  não cabia no prazo.
- **Ver a rede de verdade sem conta.** A tela de abertura mostra o que é a
  rede com dois posts de exemplo, escritos para ela, mas o feed, as turmas e
  os perfis pedem login. Abrir os posts reais para quem ainda não entrou
  ajudaria a convencer quem chega, mas expõe o diário de estudantes em boa
  parte menores de idade.
- **Respostas rápidas nas DMs.** Botões com frases prontas ("bora estudar?")
  eram fáceis de fazer, mas deixam a conversa impessoal, justamente o
  contrário do que faz dois colegas virarem parceiros de estudo.

## Uma escolha técnica

**A ofensiva é calculada na hora, numa função pura em `core/`.** O arquivo
`backend/app/core/ofensiva.py` não conhece o banco nem o FastAPI. Ele recebe
os dias em que a pessoa postou matéria e o dia de hoje, e devolve a ofensiva
atual, o recorde e as folgas usadas. A rota `GET /usuarios/{username}/ofensiva`
busca no banco só a data e a duração dos posts de matéria da pessoa e entrega
esses dados à função.

Por que assim:

- **Fácil de testar.** A regra tem muitos casos de borda: a semana virando
  no meio de uma folga, o post às 23h50 de Brasília que em UTC já é do dia
  seguinte, a ofensiva nova que não herda as folgas da que quebrou. Como a
  função só recebe datas, cada caso vira um teste de poucas linhas, sem
  servidor nem banco (`backend/tests/test_ofensiva.py`).
- **O número nunca fica velho.** Pensamos em guardar a ofensiva pronta (num
  campo do usuário ou numa estrutura em memória, como o `contadores.py`) e
  somar 1 a cada post. Só que um post pode ser apagado ou trocar de matéria
  para bate-papo, e isso muda dias do passado: a ofensiva guardada teria de
  ser refeita nesses casos, e um caso esquecido deixaria o número errado.
  Calculando a partir dos posts a cada vez, ela sempre bate com o que está
  no banco.

**Custo.** O cálculo passa uma vez por cada dia entre o primeiro post de
matéria e hoje: O(D), em que D é esse número de dias. Para saber se a pessoa
estudou num dia, os dias com post ficam num `set`, e cada consulta é O(1).
Numa lista, cada consulta seria O(P), em que P é o número de posts, e o total
iria para O(D × P). O resumo de horas da semana passa uma vez por cada post,
O(P). A rota inteira custa O(D + P) por chamada, e a busca no banco usa o
índice de `autor_id` dos posts. Mesmo com três anos de uso, D fica perto de
1.100 dias, o que é pouco para refazer a cada vez que o perfil abre.

**O que mudaria num produto grande.** Com muita gente abrindo perfis o tempo
todo, valeria guardar o resultado e jogá-lo fora quando a pessoa cria, edita
ou apaga um post. A função em `core/` continuaria a mesma; mudaria só quando
ela é chamada.

## Uso de IA

O time todo usou o **Claude Code** (Anthropic). Os commits feitos com ele
levam a linha `Co-Authored-By: Claude`, e os PRs, o rodapé "Generated with
Claude Code", então o histórico do Git mostra onde ele entrou. Dois
combinados valeram para todo mundo: cada PR foi revisado por outra pessoa do
time, que testava a versão na tela (ou lia, nos PRs só de texto) antes de
aprovar; e as decisões de produto
deste arquivo foram discutidas e aprovadas pelo time, não pela ferramenta.

**Gustavo (Pessoa A: auth, ofensiva, DMs, busca e extras).** Usei o Claude
Code (Claude Opus) no projeto inteiro. Antes do código, montei com ele o
fluxo que o time todo usou com a IA: o `CLAUDE.md` com as regras de git, os
hooks que impedem commit na `main` e avisam quando o banco local ficou velho,
e a skill `/abrir-pr`, que atualiza a branch, roda os testes e abre o PR do
mesmo jeito para todo mundo.

- **Para quê:** organizar o brainstorm do nicho e escrever o rascunho deste
  arquivo e do [PLANO.md](PLANO.md) (papéis, issues e cronograma); escrever o
  código e os testes das minhas features (o esqueleto, a auth, a ofensiva, as
  DMs, a busca, salvar posts, emoji, curtir mensagem, notificações, imagem
  nos posts, o "← Voltar" do post e a tela de abertura), as telas das Turmas, que assumi na véspera, e o README; revisar
  os PRs dos colegas, subindo uma cópia de cada PR e testando no navegador, no
  computador e no celular; e escrever as mensagens para o grupo do time.
- **O que foi meu:** escolher com o time o nicho, o problema e as decisões de
  produto; decidir quais extras entravam e quais ficavam de fora (as
  respostas rápidas e a imagem nas DMs, acima); assumir o que faltava da
  Pessoa D quando o prazo apertou; exigir que toda tela fosse conferida em
  375px, sem nada fora da tela; pedir que tudo fosse explicado em linguagem
  simples, para eu entender o que estava entregando; e aprovar ou pedir
  mudança em cada PR que revisei.
- **Onde a IA ajudou além do código:** na revisão da ofensiva, achou que a
  ofensiva nova herdava as folgas gastas pela que tinha quebrado; viu que
  guardar a imagem numa coluna nova de `posts` obrigaria todo mundo a apagar
  o banco, e propôs uma tabela separada; organizou a ordem das revisões pelos
  arquivos que cada PR mexia, para os conflitos serem pequenos; e conferiu o
  site no ar depois de cada merge, o que mostrou que o servidor não estava
  recebendo os merges (daí o deploy automático da Clarisse).
- **Onde precisei corrigir:** o sino das notificações empurrou a engrenagem
  do topo para fora da tela em celulares de 360 e 375px; o teste em 375px
  pegou, e a aba "Meu diário" virou só ícone no celular. A primeira versão da
  imagem nos posts copiava o código do token em vez de usar o do `lib/api.ts`,
  e a cópia saiu antes do merge. No botão "← Voltar" do post, a IA testou o
  voltar só em trechos do feed sem foto, e a Clarisse achou na revisão que,
  com fotos acima, a pessoa voltava noutro post: a foto passou a reservar o
  espaço antes de carregar.

**Clarisse (Pessoa C: curtidas, comentários, seed e deploy).** Usei o Claude
Code (Claude Opus) no projeto, com o `CLAUDE.md` do time para ele seguir o
nosso fluxo: uma branch por feature, commits pequenos em português, PR para o
fork do time e merge só depois da aprovação de outra pessoa.

- **Para quê:** escrever o código e os testes das minhas features a partir do
  que eu pedia (curtidas, comentários, o seed com os 25 vestibulandos, as
  respostas e curtidas em comentários, o "Ver conversa", o carregamento das
  listas e as fotos do seed), abrir as issues e os PRs, revisar os PRs da
  Camila e do Gustavo e me guiar no deploy do Render, que eu configurei. Nas
  fotos do seed, a IA buscou opções no Pexels e no Unsplash, eu escolhi quais
  entravam, e ela anotou o autor e a licença de cada uma.
- **O que foi meu:** escolher o papel e o escopo, decidir o que entrava e o que
  ficava de fora, testar no navegador e repassar as correções que o Gustavo e a
  Camila pediam nas revisões, e ainda tomar algumas decisões contrariando a
  sugestão da IA.
- **Onde a IA ajudou além do código:** apontou que a ordem cronológica dos
  comentários é exigida pelo `CATALOGO.md` e pelo teste do núcleo, e achou no
  `CONTRATO.md` o formato de "Comentários em árvore", que segui nas respostas.
  Também achou por que o site público ficava lento (a página do post esperava
  o post chegar para só então pedir os comentários) e por que o Render não
  publicava sozinho os merges (o serviço tinha sido criado como repositório
  público).
- **Onde precisei corrigir:** um arquivo de erro do terminal
  (`bash.exe.stackdump`) entrou num PR sem querer e foi tirado antes da
  revisão (e passou para o `.gitignore`). Depois disso, os commits passaram a
  ser feitos arquivo por arquivo. Os textos de erro também saíram fora do
  padrão do time ("Não deu para...") e foram trocados por "Não foi possível..."
  depois da revisão do Gustavo. No deploy, a IA trabalhou com informação
  velha: chegou a tirar da branch o deploy automático que já estava na main, e
  desfez antes de entrar. E num vídeo da tela, ela só conseguia ver quadros
  soltos, sem o áudio, então eu precisei dizer o que estava errado.

**Camila (Pessoa B: base visual, posts, perfil-diário, página do post e
design).** Usei o Claude Code (Claude Opus e Sonnet) no projeto, com o
`CLAUDE.md` do time para ele seguir o nosso fluxo. Os commits eu mesma rodava,
com mensagens no meu jeito, explicando o porquê.

- **Para quê:** escrever o front das minhas features (a base visual, o post, o
  perfil-diário com o fogo e as horas estudadas, a página do post com os
  comentários e o topo do perfil no celular) e o `DESIGN.md`, e desenhar
  propostas em HTML antes de mexer no código, como as pranchas do computador e
  do celular e as Turmas. Também abri as issues e os PRs, revisei os PRs do
  Gustavo e fiz os merges. No fim, fiz uma passada final: conferi todas as
  telas no celular e no computador, nos modos claro e noturno, e o fluxo de
  cadastro, login, post e seguir, como a banca faria.
- **O que foi meu:** o gosto e as decisões do design. Recusei layouts que a IA
  propôs (um com o post e os comentários muito divididos, outro parecido demais
  com o Twitter), escolhi o que ficava com a cara do projeto, tirei o bloco
  lavanda dos comentários (e troquei "anotações" por "comentários"), pedi um
  contorno contínuo no lugar do pontilhado, ajustei o lavanda até ficar pastel
  e legível, e escolhi o desenho das Turmas e das Mensagens. Também decidi
  abrir o post e os comentários numa página própria: a ideia veio das outras
  redes, mas o visual continuou o nosso, de caderno.
- **Onde a IA ajudou além do código:** a passada final achou três problemas que
  eu não tinha visto: o topo estourava a tela em celulares de 360px, a aba
  não tinha ícone e os posts do diário não tinham curtir, comentar e salvar.
  Quando a Clarisse avisou sobre o `marcar_curtidos`, a IA confirmou que a
  rota do diário mostrava o coração sempre vazio, mesmo para quem já tinha
  curtido, e o corrigiu com um teste.
- **Onde precisei corrigir:** um print do celular saiu com uma área em branco
  enorme embaixo, e eu percebi e pedi para refazer. Um merge perdeu uma chave
  no `api.ts`, e ela foi corrigida na hora. A IA também mediu
  errado a sobra de largura em 320px na descrição de um PR, e o Gustavo
  apontou o número certo na revisão. Também deixei combinado com a IA que ela
  pergunta antes de decidir qualquer coisa de design e não muda um desenho já
  aprovado.

**Pedro (Pessoa D: follow, feed e turmas).** Usei o Claude Code (Claude Opus)
no projeto, com o `CLAUDE.md` do time para ele seguir o nosso fluxo: uma
branch por feature, commits pequenos em português, PR para o fork do time e
merge só depois da aprovação de outra pessoa.

- **Para quê:** preparar o ambiente no Windows (só o uv e o Node, sem o
  `make`); escrever o backend, os testes e as telas das minhas features (o
  follow com o `<BotaoSeguir>`, o feed com os filtros e o "Carregar mais" em
  cima do rascunho da Camila, e a API das Turmas); abrir os PRs; testar o
  fluxo inteiro no navegador, como a banca, no computador e no celular; e me
  explicar cada passo, porque eu pedi para entender o que estava sendo feito.
- **O que foi meu:** pedir que cada parte fosse explicada antes de seguir;
  conferir se o trabalho estava de acordo com o plano do time antes de abrir
  cada PR; decidir instalar só o indispensável; escolher quem revisava cada
  PR; e levar para a IA as revisões da Camila e do Gustavo.
- **Onde a IA ajudou além do código:** percebeu que o teste de follow do
  núcleo dependia do perfil da Camila e manteve o `@skip` até ele entrar; viu
  que o PR da Camila que pôs o botão no perfil mexia no mesmo `BotaoSeguir` e
  deixou os dois arquivos iguais para não dar conflito; lembrou que o Feed,
  que é do núcleo, ainda faltava na véspera; e juntou o código repetido entre
  o feed e as turmas.
- **Onde precisei corrigir:** a revisão da Camila apontou textos de erro fora
  do padrão do `DESIGN.md` e um erro 500 quando o Seguir levava dois cliques
  rápidos. Os dois foram corrigidos, o segundo com um teste que simula os
  cliques ao mesmo tempo.
