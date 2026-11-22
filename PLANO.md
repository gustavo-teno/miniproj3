# Plano do time

Quem faz o quê até a entrega (sexta, 27/11). O produto está no
[DECISIONS.md](DECISIONS.md), e este arquivo diz como vamos construí-lo.

> **Para o Claude de cada pessoa:** descubra quem está usando você com
> `gh api user -q .login` e procure esse usuário na tabela abaixo. Ajude essa
> pessoa a seguir o plano do papel dela (`docs/plano/pessoa-<letra>.md`), na
> ordem dos dias, e a marcar o progresso e anotar bugs no diário desse arquivo.
> Antes de mexer em algo que é de outra pessoa (model, rota ou tela), avise o
> usuário.

## Quem faz o quê

O plano tem quatro papéis: A (Back), B (Front), C (Dados) e D (Reforço). Cada
pessoa escolhe um. O Gustavo e a Camila, disponíveis no fim de semana, ficaram
com A e B. **C e D ficam entre a Clarisse e o Pedro**, que começam na segunda.

Seguindo o guia 07, ninguém fica só numa camada: cada pessoa faz as próprias
features de ponta a ponta (backend, tela e testes). A área é o que ela cuida e
revisa nos PRs dos outros.

| Papel | Quem | GitHub | Começa | Área | Features (na ordem) |
|---|---|---|---|---|---|
| A | Gustavo | @gustavo-teno | sáb 21 | Backend: models, routers, services, `main.py` | Esqueleto → Auth → Ofensiva que perdoa |
| B | Camila | @camilaabmf | sáb 21 | Frontend: layout, navegação, `lib/api.ts`, identidade visual | Base visual → Posts → Perfil-diário |
| C | _a definir_ | | seg 23 | Dados: seed, `core/` e deploy | Curtidas → Comentários → Seed fake → Deploy |
| D | _a definir_ | | seg 23 | Reforço: testes e o fluxo inteiro na tela | Follow → Feed → Turmas |

GitHub do time: @gustavo-teno, @camilaabmf, @clarissegabriela31-coder,
@Pedrolk647.

**DMs entre mútuos** (opcional, decisão 6) não têm dono fixo: quem terminar a
própria parte primeiro pega, a partir de quarta.

## Por que essa divisão deixa todo mundo independente

O que costuma travar um time é esperar a auth, esperar o model de outra pessoa
ou brigar com conflito no `main.py`. O esqueleto da Pessoa A resolve os três de
uma vez no sábado:

- **Bypass da auth** (guia 01, Passo 0): com `DEBUG=true` e o header
  `X-User-Id`, qualquer rota funciona antes do login existir.
- **Todos os models** já criados, com os campos abaixo. Ninguém espera o model
  de outra pessoa, e o seed pode começar na segunda.
- **Um router vazio por feature**, já registrado no `main.py`. Cada pessoa só
  mexe no próprio arquivo.

Depois do esqueleto, as únicas dependências são de dados, não de código:
- **Curtidas e Comentários** precisam de posts no banco. Os Posts da Pessoa B
  saem no fim de semana, mas dá para criar posts direto pelo Swagger.
- **O Feed** precisa de follows. Follow e Feed ficam com a mesma pessoa (D).
- **A ofensiva aparece no perfil.** A Pessoa A entrega a rota e um componente
  `<Ofensiva username=... />`, e a Pessoa B só coloca o componente na página.

Os pontos em que duas pessoas mexem na mesma coisa estão marcados com
**Combinar com** no plano de cada uma.

## O contrato (definido no esqueleto)

**Tags:** `matematica`, `fisica`, `quimica`, `biologia`, `portugues`,
`literatura`, `redacao`, `historia`, `geografia`, `filosofia`, `sociologia`,
`ingles`, `espanhol` e `bate-papo`. A lista fica numa constante no backend,
para que ninguém escreva a sua própria. O mesmo vale para as listas de
vestibulares e de cursos, que formam as Turmas (decisão 5). Cada opção é uma
turma:

- **Vestibulares:** ENEM, Fuvest, Unicamp, Unesp, UERJ, ITA/IME, Militares
  (AFA, EFOMM, EsPCEx, Escola Naval) e Outro.
- **Cursos:** Medicina, Odontologia, Enfermagem, Outras da saúde (Farmácia,
  Fisioterapia, Nutrição...), Psicologia, Direito, Engenharias, Computação,
  Arquitetura, Administração e Economia, Relações Internacionais, Comunicação,
  Licenciaturas e Outro.

"Outro" também forma turma: "Outros vestibulares" e "Outros cursos" (quem ainda
não decidiu o curso entra nesta). As listas são curtas de propósito: a rede é
pequena, e opção demais deixaria as turmas vazias.

**Uma fonte só para as listas:** o backend guarda as três em
`app/constantes.py` e as entrega na rota `GET /opcoes`. As telas (cadastro,
post, perfil e turmas) leem as listas dessa rota em vez de copiá-las. No
front fica só o que é visual, como a cor de cada matéria.

As folgas da ofensiva são fixas (2 por semana, decisão 4), então não há campo
de folgas no `User`.

| Model | Campos além de `id` e `created_at` |
|---|---|
| `User` (existe) | + `vestibular` e `curso` (valores de uma lista fixa, podem ser vazios), `vestibular_outro` e `curso_outro` (texto livre, só quando a escolha foi "Outro"), `universidade` (texto livre, pode ser vazio) |
| `Post` | `autor_id`, `texto`, `tag` (padrão `bate-papo`), `minutos` (opcional: duração da sessão) |
| `Follow` | `seguidor_id`, `seguido_id` (par único) |
| `Like` | `user_id`, `post_id` (par único) |
| `Comment` | `autor_id`, `post_id`, `texto` |
| `Mensagem` | `remetente_id`, `destinatario_id`, `texto` (para as DMs; se elas forem cortadas, o model sai) |

A tag tem padrão `bate-papo` na API para que os testes do núcleo, que postam só
com `texto`, continuem passando. **Na tela, escolher a tag é obrigatório**
(decisão 2).

**Arquivos que mais de uma pessoa usa:**
- **`routers/users.py` é da Pessoa B**: o perfil (`GET /usuarios/{username}`,
  `PATCH /usuarios/eu` e os posts do perfil) fica nele. O follow (D, em
  `follows.py`) e a ofensiva (A, em `ofensiva.py`) também começam com
  `/usuarios`, mas cada um no próprio arquivo.
- **O formato do post é da Pessoa B**: ela define o `PostOut` (o que a API
  devolve de um post) e o `<CardPost>`. A Pessoa C acrescenta nele as
  curtidas e o número de comentários. Feed, perfil e turmas usam esse mesmo
  formato e esse mesmo card, sem criar o seu.

As rotas e os status seguem os testes em `backend/tests/test_nucleo.py`. A
tabela "Quem depende de quem" do guia 07 mostra qual teste precisa de qual
rota.

## Cronograma

| Dia | A (Back) | B (Front) | C (Dados) | D (Reforço) |
|---|---|---|---|---|
| **sáb 21** | Esqueleto (PR pequeno, B revisa) | Base visual + revisar o esqueleto | | |
| **dom 22** | Auth no backend | Posts: backend + tela + card | | |
| **seg 23** | Auth na tela | Perfil: backend + topo com a meta | Curtidas | Follow |
| **ter 24** | Ofensiva: cálculo em `core/` + testes | Perfil: divisórias e edição | Comentários | Feed + tirar os `@skip` |
| **qua 25** | Ofensiva: rota, componente e resumo da semana | Ajustes visuais nas telas de todo mundo + roteiro do vídeo | Seed com cara de vestibulando | Turmas |
| **qui 26** | DECISIONS: escolha técnica | Gravar o vídeo (local, com o seed) | Deploy (+10) | Revisar o fluxo inteiro na tela |
| **sex 27** | **Todos:** pitch, uso de IA no DECISIONS, folga para imprevistos e entrega | | | |

**Meta da terça à noite:** o fluxo cadastro → login → post → follow → feed
funcionando na tela. É ele que a banca testa e que vai para o vídeo.

## O plano de cada pessoa

Cada papel tem um arquivo com o plano dia a dia, que também serve de diário de
progresso: a pessoa marca o que fez e anota mudanças e bugs ali, sem mexer no
arquivo dos outros.

- [Pessoa A (Back)](docs/plano/pessoa-a.md): Esqueleto (#5) → Auth (#6) → Ofensiva (#7)
- [Pessoa B (Front)](docs/plano/pessoa-b.md): Base visual (#8) → Posts (#9) → Perfil-diário (#10)
- [Pessoa C (Dados)](docs/plano/pessoa-c.md): Curtidas (#11) → Comentários (#12) → Seed (#13) → Deploy (#14)
- [Pessoa D (Reforço)](docs/plano/pessoa-d.md): Follow (#15) → Feed (#16) → Turmas (#17)
- DMs entre mútuos (#18), opcional: quem terminar antes
- Entregas: vídeo (#19, Pessoa B), pitch (#20, todos) e DECISIONS final
  (#21, Pessoa A e todos). Vídeo e pitch não viram PR: quem é responsável
  fecha a issue à mão quando entregar.

Cada feature tem uma issue (o número está ao lado), aberta sem responsável:
quem escolher o papel se atribui nas issues dele. Cada dia é uma branch e um
PR, revisado pela pessoa da área. Numa feature de dois dias, o primeiro PR diz
`Parte de #N` e o último fecha a issue com `Closes #N`. Os
nomes de rota nos planos são os dos testes do núcleo; o que não está nos testes
é sugestão, e o dono pode mudar avisando quem usa.

## Ordem de prioridade

1. **Núcleo** funcionando na tela até terça. Inegociável.
2. **Ofensiva e Turmas** (decisões 4 e 5 do DECISIONS.md).
3. **DMs entre mútuos** (decisão 6). **Opcional**, mas provavelmente entra:
   quem terminar a própria parte pega.

Se a DM não couber, ela vai para o "O que cortamos" no DECISIONS.md, com o
motivo.

## Combinados

- Uma branch e uma issue por feature. O PR fecha a issue com `Closes #N`.
- PR pequeno e cedo é melhor que PR grande no fim. Quem é da área revisa,
  e qualquer pessoa pode aprovar se a da área estiver fora.
- Travou mais de 1 hora? Avisa no grupo.
- Este plano muda junto com o projeto. Se trocar alguma tarefa, atualize a
  tabela.
