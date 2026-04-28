# Micro-blogging — Projeto 1
**EC48B-C71 - Programação Web Back-End**

Biblioteca de acesso ao MongoDB para um sistema de micro-blogging (estilo Twitter), desenvolvida com Node.js e o driver nativo do MongoDB.

---

## Estrutura do projeto

```
microblog/
├── src/
│   ├── db/
│   │   └── connection.js     # Conexão com o MongoDB
│   ├── models/
│   │   ├── Usuario.js        # Coleção: usuarios
│   │   ├── Post.js           # Coleção: posts
│   │   └── Comentario.js     # Coleção: comentarios
│   ├── utils/
│   │   └── logger.js         # Log de erros em arquivo
│   └── index.js              # Menu interativo (ponto de entrada)
├── logs/                     # Arquivos de log gerados automaticamente
├── .env.example
└── package.json
```

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) rodando localmente na porta `27017`

---

## Como rodar

**1. Clone ou extraia o projeto e entre na pasta:**
```bash
cd microblog
```

**2. Instale as dependências:**
```bash
npm install
```

**3. Configure o arquivo de ambiente:**

Renomeie o arquivo `.env.example` para `.env`. O conteúdo padrão já funciona para instalação local:
```
MONGO_URI=mongodb://localhost:27017
DB_NAME=microblog
```

**4. Certifique-se de que o MongoDB está rodando:**

No PowerShell como Administrador:
```bash
net start MongoDB
```

**5. Inicie o sistema:**
```bash
npm start
```

---

## Menu interativo

Ao rodar, um menu é exibido no terminal com as seguintes opções:

| Opção | Ação |
|-------|------|
| 1 | Cadastrar usuário |
| 2 | Buscar usuário por username |
| 3 | Listar todos os usuários |
| 4 | Deletar usuário |
| 5 | Publicar post |
| 6 | Buscar posts por hashtag |
| 7 | Buscar posts por usuário |
| 8 | Listar todos os posts |
| 9 | Deletar post |
| 10 | Comentar em um post |
| 11 | Buscar comentários de um post |
| 12 | Deletar comentário |
| 0 | Sair |

---

## Coleções do banco de dados

### `usuarios`
| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| nome | String | Sim |
| username | String | Sim (único) |
| email | String | Sim (único) |
| senha | String | Sim |
| bio | String | Não |
| dataCadastro | Date | Automático |

### `posts`
| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| conteudo | String (máx. 280 chars) | Sim |
| autorId | ObjectId | Sim |
| hashtags | Array | Automático |
| curtidas | Number | Automático (0) |
| dataCriacao | Date | Automático |

### `comentarios`
| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| conteudo | String | Sim |
| autorId | ObjectId | Sim |
| postId | ObjectId | Sim |
| dataCriacao | Date | Automático |

---

## Visualizando os dados

### MongoDB Compass (interface gráfica)

A forma mais fácil de visualizar os dados é usando o [MongoDB Compass](https://www.mongodb.com/products/compass), a interface gráfica oficial e gratuita do MongoDB.

1. Baixe e instale o Compass
2. Abra o Compass e conecte usando a string:
```
mongodb://localhost:27017
```
3. Navegue até o banco `microblog` e explore as coleções `usuarios`, `posts` e `comentarios`

### mongosh (terminal)

Também é possível visualizar os dados direto pelo terminal:
```bash
mongosh
use microblog
db.usuarios.find()
db.posts.find()
db.comentarios.find()
```

---

## Log de erros

Todos os erros capturados são registrados automaticamente na pasta `/logs`, em arquivos nomeados por data:
```
logs/erros-2024-04-28.log
```

Cada entrada de log contém o timestamp, a origem do erro, a mensagem e o stack trace.
