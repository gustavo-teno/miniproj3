# Decisões do time

**Time:** Gustavo (@gustavo-teno), Pedro (@Pedrolk647), Clarisse
(@clarissegabriela31-coder), Camila (@camilaabmf)

Este arquivo acompanha o projeto. Comecem com o que já sabem e atualizem quando
as decisões mudarem.

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

As letras são os papéis do [PLANO.md](PLANO.md); C e D ainda vão ser escolhidos e
entram na tabela "Quem faz o quê" de lá.

| Feature | Dono | Por quê (1 frase) |
|---|---|---|
| Auth (núcleo) | Pessoa A (Gustavo) | Cada vestibulando tem o próprio diário e a própria meta. |
| Posts (núcleo) | Pessoa B (Camila) | O registro da sessão de estudo, com tag (matéria ou bate-papo) e duração. |
| Feed (núcleo) | Pessoa D | Cronológico e só de quem você segue, com filtro para esconder o bate-papo. |
| Perfil (núcleo) | Pessoa B (Camila) | O diário com divisórias por matéria, com a meta, a ofensiva e o resumo da semana no topo. |
| Follow (núcleo) | Pessoa D (Pedro) | Acompanhar a jornada de quem tem a mesma meta que você. |
| Curtidas (núcleo) | Pessoa C | Um apoio rápido para quem estudou hoje. |
| Comentários (núcleo) | Pessoa C | Dicas e incentivo na sessão do outro, que é o sinal de que a rede funcionou. |
| Seed fake (núcleo) | Pessoa C | Vestibulandos fictícios com metas e rotinas variadas, para a rede já parecer uma turma. |
| Ofensiva que perdoa | Pessoa A (Gustavo) | Motiva a voltar todo dia sem punir o descanso (decisão 4). |
| Turmas | Pessoa D | Quem acabou de chegar encontra quem tem a mesma meta e sai do feed vazio (decisão 5). |
| DMs entre mútuos | Pessoa A (Gustavo) | Onde dois colegas da mesma turma viram parceiros de estudo (decisão 6). |
| Busca de pessoas e posts | Pessoa A (Gustavo) | Achar um colega pelo nome ou um post sobre um assunto, sem depender da meta. |
| Emoji ao escrever | Pessoa A (Gustavo) | Quem escreve pelo computador também comemora uma lista feita com 🔥 ou 💪, como faria no celular. |

**Login sem prazo de validade (escolha consciente).** O token do login vale
até a pessoa clicar em sair, que apaga a sessão no banco. Uma validade (por
exemplo, 30 dias) pediria uma data na sessão, uma checagem a mais em toda
request e uma tela para o "sua sessão expirou". Para uma rede de teste com
prazo de uma semana, não compensa. Num produto de verdade, seria a primeira
melhoria da auth.

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

Claude: rascunho deste arquivo e revisão do texto. O conteúdo e as decisões
foram discutidos e aprovados pelo time.
