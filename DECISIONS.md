# Decisões do time

**Time:** Gustavo (@gustavo-teno), Pedro (@Pedrolk647), Clarisse
(@clarissegabriela31-coder), Camila (@camilaabmf)

Este arquivo acompanha o projeto. Comecem com o que já sabem e atualizem quando
as decisões mudarem.

## Produto

- **Público:** vestibulandos (ENEM, Fuvest, Unicamp, ITA, IME e outros) que
  estudam sozinhos em casa, por cursinho online ou por conta própria, sem
  colegas por perto para dividir a rotina.
- **Problema:** quem estuda sozinho procura companhia e motivação nas
  comunidades de estudo das redes grandes (studytwt, studygram, servidores do
  Discord). No Twitter e no Instagram, o estudo disputa espaço com polêmicas e
  assuntos aleatórios que distraem e geram ansiedade. Os servidores de estudo
  do Discord costumam premiar quem estuda mais horas com rankings, o que
  alimenta a comparação, uma das maiores fontes de angústia nessa fase. E a
  evolução de cada um se perde: no chat a mensagem some em minutos, e no
  Twitter o perfil mistura estudo com todo o resto.
- **Como a rede resolve:** um espaço só para vestibulandos, em que cada perfil
  é um diário de estudos organizado por matéria. Você acompanha a jornada de
  quem tem a mesma meta que você, conversa com a turma sobre o dia a dia do
  vestibular, e a rede nunca coloca ninguém num ranking.
- **Como saberíamos que funcionou:** a pessoa volta no dia seguinte para
  registrar a própria sessão de estudo e comentar a de quem ela segue.

## Decisões de produto

### 1. A rede não compara por você

- **Contexto:** a comparação com outros estudantes é uma das maiores fontes de
  ansiedade de vestibulandos, e as comunidades de estudo do Discord usam
  rankings de horas como motor.
- **Opções:** ranking de horas e questões (como os servidores de estudo do
  Discord), ou nenhum ranking entre usuários.
- **Escolha:** nenhum ranking. Os números do perfil comparam a pessoa com ela
  mesma ("esta semana: 12h, semana passada: 9h"). Os usuários continuam livres
  para postar horas e questões, porque é isso que gera dicas e conecta rotinas
  parecidas.
- **O que cortamos e por quê:** o leaderboard e os títulos de "quem estudou
  mais". Eles engajam, mas reproduzem a pressão de que o público quer fugir.

### 2. Perfil como diário com divisórias por matéria

- **Contexto:** no Twitter, o perfil é um caderno de rascunho; no Discord, a
  conversa some em minutos. Em nenhum dos dois dá para ver como alguém evoluiu.
  Ao mesmo tempo, a conversa solta entre vestibulandos ("como foi o dia de
  vocês?") é o que faz a pessoa se sentir parte de uma turma.
- **Opções:** perfil com lista simples de posts; perfil organizado só por
  matéria; ou matérias mais uma tag de bate-papo.
- **Escolha:** todo post tem uma tag: uma matéria ou "bate-papo". O perfil
  funciona como um caderno com divisórias, com a meta da pessoa (curso,
  universidade e vestibular) no topo. Os posts de bate-papo aparecem no feed
  por padrão, porque a solidão é o problema central e quem acaba de chegar
  precisa sentir o clima de turma; quem quer foco total pode escondê-los. A
  identidade visual segue a ideia de caderno.
- **O que cortamos e por quê:** posts sem tag. A pessoa gasta um clique a mais
  para postar, mas o diário continua legível e quem quer foco total consegue
  esconder a conversa.

### 3. Feed cronológico, só de quem você segue

- **Contexto:** o studytwt fica dentro de uma rede cheia de polêmicas e
  distrações, que geram estresse em quem está estudando.
- **Opções:** feed por engajamento ("Em alta"), ou feed cronológico só das
  pessoas que você segue.
- **Escolha:** feed cronológico, só com quem você segue.
- **O que cortamos e por quê:** o feed algorítmico. Ele tende a impulsionar o
  post extremo ("estudei 14h hoje") e a polêmica, justamente o que afasta esse
  público.

### 4. Ofensiva que perdoa

- **Contexto:** ver a sequência de dias crescer motiva a voltar todo dia, mas
  o streak tradicional zera no primeiro dia sem estudo e transforma o descanso,
  que é saudável no vestibular, em fracasso.
- **Opções:** streak diário sem folga (como o Duolingo sem congelamento),
  sequência contada em semanas, ou dias com folgas semanais.
- **Escolha:** a ofensiva conta dias estudados, e só posts com tag de matéria
  contam. Cada pessoa tem folgas por semana (escolhe de 1 a 3, padrão 2). A
  folga é usada automaticamente: mantém a ofensiva, mas não soma ao número.
  Quando a ofensiva quebra, o perfil mostra o recorde ao lado. O número aparece
  no perfil, mas nunca numa lista ou ranking.
- **O que cortamos e por quê:** o streak sem folga, porque pune o descanso; e
  a contagem por semanas, porque o número cresce devagar e motiva menos.

## Features

| Feature | Dono | Por quê (1 frase) |
|---|---|---|
| Auth (núcleo) | @gustavo-teno | Cada vestibulando tem o próprio diário e a própria meta. |
| Posts (núcleo) | @camilaabmf | O registro da sessão de estudo, sempre com tag de matéria ou bate-papo. |
| Feed (núcleo) | @clarissegabriela31-coder | Cronológico e só de quem você segue, com opção de esconder o bate-papo. |
| Perfil (núcleo) | @camilaabmf | O diário com divisórias por matéria, com a meta e a ofensiva no topo. |
| Follow (núcleo) | @clarissegabriela31-coder | Acompanhar a jornada de quem tem a mesma meta que você. |
| Curtidas (núcleo) | @Pedrolk647 | Um apoio rápido para quem estudou hoje. |
| Comentários (núcleo) | @Pedrolk647 | Dicas e incentivo na sessão do outro, que é o sinal de que a rede funcionou. |
| Seed fake (núcleo) | @Pedrolk647 | Vestibulandos fictícios com metas e rotinas variadas, para a rede já parecer uma turma. |
| Ofensiva que perdoa | @gustavo-teno | Motiva a voltar todo dia sem punir o descanso (decisão 4). |

## Uma escolha técnica

_(a definir quando o time escolher)_

## Uso de IA

_(a preencher pelo time)_
