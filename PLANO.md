# Plano do time

Quem faz o quê até a entrega (sexta, 27/11). O produto está no
[DECISIONS.md](DECISIONS.md), e este arquivo diz como vamos construí-lo.

> **Para o Claude de cada pessoa:** descubra quem está usando você com
> `gh api user -q .login` e procure esse usuário na tabela abaixo. Ajude essa
> pessoa a seguir as tarefas dela na ordem do cronograma. Antes de mexer em algo
> que é de outra pessoa (model, rota ou tela), avise o usuário.

## Quem faz o quê

Cada pessoa faz as próprias features de ponta a ponta (backend, tela e testes).
A área é o que ela revisa nos PRs dos outros.

| Pessoa | GitHub | Começa | Área | Features (na ordem) |
|---|---|---|---|---|
| Gustavo | @gustavo-teno | sáb 21 | Backend | Esqueleto → Auth → Ofensiva que perdoa |
| Camila | @camilaabmf | sáb 21 | Frontend | Base visual → Posts → Perfil-diário |
| Clarisse | @clarissegabriela31-coder | seg 23 | Reforço e testes | Follow → Feed → testes do núcleo |
| Pedro | @Pedrolk647 | seg 23 | Dados | Curtidas → Comentários → Seed fake → Deploy |

## Por que essa divisão deixa todo mundo independente

O que costuma travar um time é esperar a auth, esperar o model de outra pessoa
ou brigar com conflito no `main.py`. O esqueleto do Gustavo resolve os três de
uma vez no sábado:

- **Bypass da auth** (guia 01, Passo 0): com `DEBUG=true` e o header
  `X-User-Id`, qualquer rota funciona antes do login existir.
- **Todos os models** já criados, com os campos abaixo. Ninguém espera o model
  de outra pessoa, e o seed pode começar na segunda.
- **Um router vazio por feature**, já registrado no `main.py`. Cada pessoa só
  mexe no próprio arquivo.

Depois do esqueleto, as únicas dependências são de dados, não de código:
- **Curtidas e Comentários** precisam de posts no banco. Os Posts da Camila
  saem no fim de semana, mas dá para criar posts direto pelo Swagger.
- **O Feed** precisa de follows. Follow e Feed ficam com a mesma pessoa.
- **A ofensiva aparece no perfil.** O Gustavo entrega a rota e um componente
  `<Ofensiva username=... />`, e a Camila só coloca o componente na página.

## O contrato (definido no esqueleto)

**Tags:** `matematica`, `fisica`, `quimica`, `biologia`, `portugues`,
`literatura`, `redacao`, `historia`, `geografia`, `filosofia`, `sociologia`,
`ingles`, `espanhol` e `bate-papo`. A lista fica numa constante no backend,
para que ninguém escreva a sua própria.

| Model | Campos além de `id` e `created_at` |
|---|---|
| `User` (existe) | + `vestibular`, `curso`, `universidade` (texto, podem ser vazios), `folgas_semana` (1 a 3, padrão 2) |
| `Post` | `autor_id`, `texto`, `tag` (padrão `bate-papo`), `minutos` (opcional: duração da sessão) |
| `Follow` | `seguidor_id`, `seguido_id` (par único) |
| `Like` | `user_id`, `post_id` (par único) |
| `Comment` | `autor_id`, `post_id`, `texto` |

A tag tem padrão `bate-papo` na API para que os testes do núcleo, que postam só
com `texto`, continuem passando. **Na tela, escolher a tag é obrigatório**
(decisão 2).

As rotas e os status seguem os testes em `backend/tests/test_nucleo.py`.

## Cronograma

| Dia | Gustavo | Camila | Clarisse | Pedro |
|---|---|---|---|---|
| **sáb 21** | Esqueleto (PR pequeno, a Camila aprova) | Base visual: layout, navegação, `lib/api.ts` com o header `X-User-Id`, identidade de caderno | | |
| **dom 22** | Auth no backend (registro, login, `/auth/eu`) | Posts: backend + tela de postar com tag + card de post | | |
| **seg 23** | Auth na tela (cadastro, login, sair) | Perfil: meta no topo, edição | Follow: backend + botão | Curtidas: backend + botão |
| **ter 24** | Ofensiva: estrutura em `core/` + testes | Perfil: divisórias por matéria | Feed cronológico + esconder bate-papo | Comentários: backend + tela |
| **qua 25** | Ofensiva: rota + componente; números "você vs você" | Ajustes visuais nas telas de todo mundo | Tirar os `@skip` e fazer o núcleo passar | Seed com cara de vestibulando |
| **qui 26** | DECISIONS: escolha técnica (ofensiva) | Gravar o vídeo | Revisar o fluxo inteiro na tela | Deploy (+10) |
| **sex 27** | **Todos:** pitch, uso de IA no DECISIONS, folga para imprevistos e entrega | | | |

**Meta da terça à noite:** o fluxo cadastro → login → post → follow → feed
funcionando na tela. É ele que a banca testa e que vai para o vídeo.

## Combinados

- Uma branch e uma issue por feature. O PR fecha a issue com `Closes #N`.
- PR pequeno e cedo é melhor que PR grande no fim. Quem é da área revisa,
  e qualquer pessoa pode aprovar se a da área estiver fora.
- Travou mais de 1 hora? Avisa no grupo.
- Este plano muda junto com o projeto. Se trocar alguma tarefa, atualize a
  tabela.
