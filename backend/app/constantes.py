"""Listas fixas do contrato (PLANO.md). Ninguém escreve a sua própria lista:
importe daqui. A chave é o que vai para o banco; o valor é o texto da tela.

Cada vestibular e cada curso forma uma turma (decisão 5), inclusive "outro".
"""

TAG_PADRAO = "bate-papo"

# Toda tag menos bate-papo é matéria e conta para a ofensiva (decisão 4).
TAGS = {
    "matematica": "Matemática",
    "fisica": "Física",
    "quimica": "Química",
    "biologia": "Biologia",
    "portugues": "Português",
    "literatura": "Literatura",
    "redacao": "Redação",
    "historia": "História",
    "geografia": "Geografia",
    "filosofia": "Filosofia",
    "sociologia": "Sociologia",
    "ingles": "Inglês",
    "espanhol": "Espanhol",
    TAG_PADRAO: "Bate-papo",
}

# Quem escolhe "outro" escreve qual é em User.vestibular_outro.
VESTIBULARES = {
    "enem": "ENEM",
    "fuvest": "Fuvest",
    "unicamp": "Unicamp",
    "unesp": "Unesp",
    "uerj": "UERJ",
    "ita-ime": "ITA/IME",
    "militares": "Militares (AFA, EFOMM, EsPCEx, Escola Naval)",
    "outro": "Outro",
}

# Quem escolhe "outro" escreve qual é em User.curso_outro. Quem ainda não
# decidiu o curso também entra em "outro".
CURSOS = {
    "medicina": "Medicina",
    "odontologia": "Odontologia",
    "enfermagem": "Enfermagem",
    "outras-saude": "Outras da saúde (Farmácia, Fisioterapia, Nutrição...)",
    "psicologia": "Psicologia",
    "direito": "Direito",
    "engenharias": "Engenharias",
    "computacao": "Computação",
    "arquitetura": "Arquitetura",
    "administracao-economia": "Administração e Economia",
    "relacoes-internacionais": "Relações Internacionais",
    "comunicacao": "Comunicação",
    "licenciaturas": "Licenciaturas",
    "outro": "Outro",
}
