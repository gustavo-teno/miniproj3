"""O conteúdo do seed (#13, Pessoa C): os vestibulandos e o que eles escrevem.

Fica separado do seed.py, que só monta a rede a partir daqui. Escrito à mão,
e não com o faker, para a rede ter cara de turma de vestibular: nome e meta
de verdade, posts do jeito que um vestibulando escreve.

As chaves de vestibular, curso e matéria são as de app/constantes.py.
"""

from datetime import timedelta

# Rotinas de estudo, para a ofensiva aparecer de todos os jeitos no vídeo:
# - "firme": estuda quase todo dia, com uma folga aqui e ali (ofensiva em dia).
# - "quebrou": teve uma ofensiva longa, parou uns dias e recomeçou (recorde
#   maior que a ofensiva atual).
# - "solta": estuda em dias espalhados (ofensiva pequena ou nenhuma).
FIRME = "firme"
QUEBROU = "quebrou"
SOLTA = "solta"

# O usuário de demonstração, com senha conhecida (a do seed), para o vídeo e
# para a banca. É o primeiro da lista e o que mais segue gente.
USUARIO_DEMO = "ada"

VESTIBULANDOS = [
    {"username": "ada", "name": "Ada Moreira", "vestibular": "enem", "curso": "medicina",
     "universidade": "UFPB", "rotina": FIRME,
     "materias": ["biologia", "quimica", "fisica", "redacao"],
     "bio": "Segundo ano de cursinho online. Biologia é meu refúgio, física é meu chefão final."},
    {"username": "joaopedro", "name": "João Pedro Lima", "vestibular": "fuvest", "curso": "medicina",
     "universidade": "USP", "rotina": FIRME,
     "materias": ["biologia", "quimica", "matematica"],
     "bio": "Terceirão de manhã, cursinho à noite. Movido a café e flashcard."},
    {"username": "duda", "name": "Maria Eduarda Souza", "vestibular": "enem", "curso": "odontologia",
     "universidade": "UFPE", "rotina": SOLTA,
     "materias": ["biologia", "quimica", "portugues"],
     "bio": "Estudando sozinha em casa. Aqui pra não esquecer que tem mais gente nessa."},
    {"username": "caio", "name": "Caio Ramos", "vestibular": "ita-ime", "curso": "engenharias",
     "universidade": "ITA", "rotina": FIRME,
     "materias": ["matematica", "fisica", "quimica"],
     "bio": "Lista do Renato Brito no café da manhã. Sonho: Engenharia Aeronáutica."},
    {"username": "bia", "name": "Beatriz Costa", "vestibular": "unicamp", "curso": "computacao",
     "universidade": "Unicamp", "rotina": QUEBROU,
     "materias": ["matematica", "fisica", "ingles"],
     "bio": "Quero Ciência da Computação na Unicamp. Voltando pro ritmo depois de uma semana difícil."},
    {"username": "larissa", "name": "Larissa Nunes", "vestibular": "enem", "curso": "enfermagem",
     "universidade": "UFRN", "rotina": SOLTA,
     "materias": ["biologia", "quimica", "redacao"],
     "bio": "Trabalho de dia e estudo de noite. Devagar e sempre."},
    {"username": "thiago", "name": "Thiago Almeida", "vestibular": "militares", "curso": "engenharias",
     "universidade": "AFA ou IME", "rotina": FIRME,
     "materias": ["matematica", "fisica", "portugues"],
     "bio": "Rumo à AFA. Disciplina é fazer mesmo sem vontade."},
    {"username": "julia", "name": "Júlia Nogueira", "vestibular": "uerj", "curso": "direito",
     "universidade": "UERJ", "rotina": QUEBROU,
     "materias": ["historia", "redacao", "portugues", "sociologia"],
     "bio": "Futura advogada. Redação toda semana, sem exceção."},
    {"username": "rafa", "name": "Rafael Barbosa", "vestibular": "unesp", "curso": "arquitetura",
     "universidade": "Unesp Bauru", "rotina": SOLTA,
     "materias": ["matematica", "historia", "fisica"],
     "bio": "Desenho nas horas vagas, geometria espacial nas horas difíceis."},
    {"username": "anaclara", "name": "Ana Clara Ribeiro", "vestibular": "enem", "curso": "psicologia",
     "universidade": "UFC", "rotina": FIRME,
     "materias": ["filosofia", "sociologia", "biologia", "redacao"],
     "bio": "Psicologia na UFC. Cuidando da cabeça enquanto encho ela de conteúdo."},
    {"username": "gabriel", "name": "Gabriel Santos", "vestibular": "outro",
     "vestibular_outro": "PSS da UFPB", "curso": "computacao", "universidade": "UFPB",
     "rotina": SOLTA, "materias": ["matematica", "fisica", "ingles"],
     "bio": "Fazendo o PSS e o ENEM. Programo um pouco nas folgas."},
    {"username": "isabela", "name": "Isabela Ferreira", "vestibular": "fuvest", "curso": "relacoes-internacionais",
     "universidade": "USP", "rotina": FIRME,
     "materias": ["historia", "geografia", "ingles", "espanhol"],
     "bio": "Relações Internacionais na USP. Atualidades é meu esporte."},
    {"username": "lucas", "name": "Lucas Oliveira", "vestibular": "enem", "curso": "administracao-economia",
     "universidade": "UFPB", "rotina": QUEBROU,
     "materias": ["matematica", "geografia", "historia"],
     "bio": "Economia na UFPB. Matemática financeira é a única que eu entendo de primeira."},
    {"username": "fernanda", "name": "Fernanda Lopes", "vestibular": "enem", "curso": "comunicacao",
     "universidade": "UFBA", "rotina": SOLTA,
     "materias": ["redacao", "literatura", "portugues", "sociologia"],
     "bio": "Jornalismo na UFBA. Lendo os livros obrigatórios um por um."},
    {"username": "matheus", "name": "Matheus Carvalho", "vestibular": "enem", "curso": "licenciaturas",
     "universidade": "UFRPE (Física)", "rotina": FIRME,
     "materias": ["fisica", "matematica"],
     "bio": "Quero ser professor de Física. Explicar é o melhor jeito de aprender."},
    {"username": "sofia", "name": "Sofia Martins", "vestibular": "enem", "curso": "outro",
     "curso_outro": "quer Geografia", "universidade": "UFPB", "rotina": SOLTA,
     "materias": ["geografia", "historia", "redacao"],
     "bio": "Mapa, clima e relevo. Ninguém entende, mas eu amo."},
    {"username": "davi", "name": "Davi Rocha", "vestibular": "enem", "curso": "outro",
     "curso_outro": "decidindo entre Direito e Psicologia", "rotina": QUEBROU,
     "materias": ["redacao", "historia", "filosofia"],
     "bio": "Ainda escolhendo o curso, mas a nota da redação já tá subindo."},
    {"username": "leticia", "name": "Letícia Araújo", "vestibular": "unicamp", "curso": "outras-saude",
     "universidade": "Unicamp (Farmácia)", "rotina": FIRME,
     "materias": ["quimica", "biologia"],
     "bio": "Farmácia na Unicamp. Química orgânica é quebra-cabeça, e eu gosto."},
    {"username": "vini", "name": "Vinícius Gomes", "vestibular": "outro",
     "vestibular_outro": "PAS da UnB", "curso": "direito", "universidade": "UnB",
     "rotina": SOLTA, "materias": ["historia", "filosofia", "sociologia", "redacao"],
     "bio": "Terceira etapa do PAS. Filosofia é a matéria que mais me prende."},
    {"username": "manu", "name": "Manuela Dias", "vestibular": "uerj", "curso": "medicina",
     "universidade": "UERJ", "rotina": FIRME,
     "materias": ["biologia", "quimica", "redacao"],
     "bio": "Medicina na UERJ, segunda tentativa. Agora vai."},
    {"username": "enzo", "name": "Enzo Cardoso", "vestibular": "ita-ime", "curso": "engenharias",
     "universidade": "IME", "rotina": QUEBROU,
     "materias": ["matematica", "fisica", "quimica"],
     "bio": "IME ou nada (mentira, o ENEM também conta)."},
    {"username": "yasmin", "name": "Yasmin Freitas", "vestibular": "unesp", "curso": "psicologia",
     "universidade": "Unesp Assis", "rotina": SOLTA,
     "materias": ["biologia", "sociologia", "portugues"],
     "bio": "Primeira da família a tentar faculdade pública."},
    {"username": "bruno", "name": "Bruno Teixeira", "vestibular": "militares", "curso": "outro",
     "curso_outro": "Escola Naval", "rotina": FIRME,
     "materias": ["matematica", "fisica", "ingles"],
     "bio": "Escola Naval. Inglês todo dia, nem que seja 20 minutos."},
    {"username": "helena", "name": "Helena Pires", "vestibular": "enem", "curso": "licenciaturas",
     "universidade": "UFPB (Letras)", "rotina": FIRME,
     "materias": ["literatura", "portugues", "redacao", "ingles"],
     "bio": "Letras na UFPB. Fichando os livros da lista pra quem precisar."},
    {"username": "otavio", "name": "Otávio Mendes", "vestibular": "fuvest", "curso": "direito",
     "universidade": "USP (São Francisco)", "rotina": SOLTA,
     "materias": ["historia", "portugues", "filosofia"],
     "bio": "Largo São Francisco é o sonho. Revisão de história em podcast no ônibus."},
]

# Os assuntos de cada matéria, para os posts de estudo.
ASSUNTOS = {
    "matematica": ["função afim", "logaritmo", "progressão aritmética", "geometria espacial",
                   "trigonometria", "análise combinatória", "probabilidade", "matriz e determinante"],
    "fisica": ["cinemática", "leis de Newton", "energia e trabalho", "óptica geométrica",
               "eletrodinâmica", "termologia", "ondulatória", "hidrostática"],
    "quimica": ["estequiometria", "funções orgânicas", "soluções", "termoquímica",
                "eletroquímica", "equilíbrio químico", "isomeria", "ligações químicas"],
    "biologia": ["genética", "citologia", "ecologia", "fisiologia humana",
                 "botânica", "evolução", "bioquímica", "imunologia"],
    "portugues": ["interpretação de texto", "concordância", "figuras de linguagem",
                  "crase", "funções da linguagem", "sintaxe"],
    "literatura": ["Modernismo", "Romantismo", "Machado de Assis", "Realismo",
                   "Barroco", "poesia de Drummond"],
    "redacao": ["proposta de intervenção", "repertório sociocultural", "tese e argumentação",
                "conectivos", "competência 3"],
    "historia": ["Era Vargas", "Revolução Francesa", "Brasil Colônia", "Guerra Fria",
                 "Ditadura Militar", "Primeira República"],
    "geografia": ["climatologia", "geopolítica", "urbanização", "cartografia",
                  "questão agrária", "domínios morfoclimáticos"],
    "filosofia": ["Kant", "contratualistas", "Platão e Aristóteles", "existencialismo",
                  "ética", "filosofia política"],
    "sociologia": ["Durkheim", "Marx e Weber", "movimentos sociais", "cidadania",
                   "indústria cultural"],
    "ingles": ["interpretação de texto em inglês", "false friends", "vocabulário de notícia",
               "phrasal verbs"],
    "espanhol": ["interpretação em espanhol", "heterosemánticos", "tempos verbais em espanhol"],
}

# Os jeitos de contar uma sessão de estudo. {assunto} e {n}/{acertos} são
# preenchidos pelo seed.
SESSOES = [
    "Fiz {n} questões de {assunto}, acertei {acertos}.",
    "Revisão de {assunto} com mapa mental.",
    "Videoaula e lista de {assunto}.",
    "Resumo de {assunto} pronto, colado na parede.",
    "Flashcards de {assunto} antes de dormir.",
    "Refiz as questões de {assunto} que eu tinha errado semana passada.",
    "Primeira vez estudando {assunto} a sério.",
    "Simulado só de {assunto}: {acertos} de {n}.",
]

# O que a pessoa sente ou planeja depois da sessão.
REFLEXOES = [
    "Amanhã refaço as que errei.",
    "Finalmente fez sentido!",
    "Ainda travo na interpretação do enunciado.",
    "Cansaço bateu, mas saiu.",
    "Melhor que ontem, e é isso que importa.",
    "Alguém tem uma dica pra fixar isso?",
    "Rendeu mais do que eu esperava.",
    "Devagar, mas foi.",
    "Fiz com o cronômetro do pomodoro e ajudou muito.",
    "Errei bastante, mas agora sei onde estudar.",
    "",
]

# Conversa solta (decisão 2): o clima de turma, que combate a solidão.
BATE_PAPO = [
    "Como foi o dia de vocês? Aqui rendeu pouco, mas rendeu.",
    "Simulado amanhã cedo. Alguém mais vai dormir às 22h hoje pra ver se funciona?",
    "Dica de ouro: estudar a redação pela proposta de intervenção mudou tudo pra mim.",
    "Hoje tirei folga e sem culpa. Descanso também é estudo.",
    "Qual música vocês escutam pra estudar? Eu só consigo com lo-fi.",
    "Alguém mais acha que o domingo passa rápido demais?",
    "Bateu a ansiedade com a data da prova chegando. Como vocês lidam?",
    "Comecei a estudar na biblioteca pública e minha produtividade dobrou.",
    "Meta da semana: dormir 7 horas por noite. Quem topa?",
    "Saiu o edital! Quem vai fazer comigo?",
    "Fiz minha primeira redação nota 900 num simulado. Tô em choque.",
    "Alguém tem um cronograma pra quem trabalha durante o dia?",
    "Lembrete pra todo mundo: beber água também conta.",
    "Errei a mesma questão de matemática três vezes. Rindo pra não chorar.",
    "Voltei! Fiquei uns dias sem estudar, mas bora de novo.",
    "Quem mais estuda de madrugada porque é o único horário com silêncio em casa?",
    "Terminei o livro obrigatório. Recomendo, de verdade.",
    "Primeira semana sem faltar no cronograma. Pequenas vitórias.",
]

# Comentários: incentivo, dica e pergunta, o que a rede quer estimular.
COMENTARIOS = [
    "Boa! Constância é tudo.",
    "Que dica boa, vou testar amanhã.",
    "Você usa qual material pra isso?",
    "Eu também travo nisso, bora junto.",
    "Orgulho! Segue firme.",
    "Faz o caminho inverso: começa pelo gabarito comentado.",
    "Essa matéria cai muito, ótima escolha.",
    "Me salvou, eu tava precisando desse lembrete.",
    "Descansa também, viu? O cérebro agradece.",
    "Quantas horas você dorme? Tô tentando ajustar a minha rotina.",
    "Anotado! Valeu por compartilhar.",
    "Já tentou explicar em voz alta? Pra mim funciona.",
    "Isso aí, um dia de cada vez.",
    "Tem uma videoaula ótima disso, depois te mando.",
    "Eu errava isso também até fazer muitas questões.",
    "Bora, a aprovação tá vindo!",
    "Que rotina inspiradora.",
    "Me identifiquei demais.",
]

# Uma conversa num post da Ada, cada fala respondendo a anterior: com mais de
# 3 respostas, ela aparece recolhida em "Ver conversa" no vídeo e para a banca.
# "fa" é alguém que segue a Ada; "demo" é a própria Ada.
CONVERSA_DEMO = [
    ("fa", "Como você organiza as revisões? Eu sempre esqueço o que já estudei."),
    ("demo", "Revejo no dia seguinte, depois de uma semana e depois de um mês. Anoto tudo num caderninho."),
    ("fa", "Caderninho de papel ou no celular?"),
    ("demo", "Papel! Riscar o que já revisei dá uma satisfação enorme."),
    ("fa", "Vou testar essa semana. Valeu pela dica!"),
]

# Respostas de quem postou a quem comentou (comentários em árvore): a conversa
# continua embaixo do comentário, em vez de virar outro comentário solto. O
# seed sorteia qual resposta vai em qual comentário, então todas servem para
# qualquer um deles.
RESPOSTAS = [
    "Valeu demais! Amanhã tem mais.",
    "Obrigada pela força, tava precisando ler isso.",
    "Bora junto! Me chama na DM.",
    "Haha a gente se entende.",
    "Anotado! Depois te conto como foi.",
    "Isso aí, um passo de cada vez.",
    "Que bom que serviu pra você também!",
    "Tamo junto nessa reta final.",
]

# Conversas da Ada com três mútuos (DMs, decisão 6), para a caixa de mensagens
# não abrir vazia no vídeo. Cada uma mostra um uso da DM: combinar uma sessão,
# cobrar um ao outro e desabafar depois do simulado. Cada mensagem é
# (quem escreveu, há quanto tempo, texto), da mais antiga para a mais nova.
# "nao_lidas" diz quantas das últimas mensagens a Ada ainda não abriu: são
# elas que fazem o número aparecer na aba Mensagens.
CONVERSAS_DEMO = [
    {"com": "manu", "nao_lidas": 2, "mensagens": [
        ("manu", timedelta(days=3, hours=2), "Ada, vi teu post de genética. Tu fez aquela lista de heredogramas?"),
        ("ada", timedelta(days=3, hours=1, minutes=45), "Fiz! Errei 4 de 20, quase tudo em probabilidade. Quer fazer junto?"),
        ("manu", timedelta(days=3, hours=1, minutes=40), "Quero muito. Sábado de manhã?"),
        ("ada", timedelta(days=3, hours=1, minutes=35), "Fechado. 9h, chamada de vídeo, cada uma com a câmera no caderno."),
        ("manu", timedelta(minutes=40), "Ada, bora antecipar pra amanhã à noite? Sábado vou ter simulado."),
        ("manu", timedelta(minutes=20), "Pode ser às 20h? Levo as questões da UERJ de genética."),
    ]},
    {"com": "joaopedro", "nao_lidas": 1, "mensagens": [
        ("joaopedro", timedelta(days=2, hours=3), "Me cobra amanhã? Prometi fechar a lista de estequiometria e tô enrolando desde segunda."),
        ("ada", timedelta(days=2, hours=2, minutes=50), "Cobro sim. E você me cobra a redação, combinado? Tô devendo duas."),
        ("ada", timedelta(days=1, hours=4), "E aí, a estequiometria saiu?"),
        ("joaopedro", timedelta(days=1, hours=3, minutes=40), "Saiu! 17 de 25. E a redação?"),
        ("ada", timedelta(days=1, hours=3, minutes=20), "Escrevi uma hoje, tema de mobilidade urbana. Amanhã faço a outra."),
        ("joaopedro", timedelta(hours=3), "Cadê a segunda redação, hein? Tô cobrando como combinado."),
    ]},
    {"com": "larissa", "nao_lidas": 0, "mensagens": [
        ("larissa", timedelta(days=5, hours=1), "Ada, tirei 640 no simulado. Achei que ia passar dos 700 dessa vez."),
        ("ada", timedelta(days=5, minutes=50), "Ei, 640 nessa prova é bom. Natureza tava pesada pra todo mundo."),
        ("larissa", timedelta(days=5, minutes=45), "É que eu estudei tanto. Dá vontade de largar tudo."),
        ("ada", timedelta(days=5, minutes=35), "Eu senti isso mês passado. Olha teus erros com calma amanhã, não hoje. Hoje é dormir."),
        ("larissa", timedelta(days=5, minutes=30), "Valeu, de verdade. Amanhã te conto o que errei."),
        ("larissa", timedelta(days=4, hours=5), "Errei quase tudo em química. Vou focar nela essa semana."),
        ("ada", timedelta(days=4, hours=4, minutes=45), "Boa! Se quiser, faz comigo as de soluções, também tô nelas."),
    ]},
]
