# Micro-blogging — Projeto 2
**EC48B-C71 - Programação Web Back-End**

Aplicação web de micro-blogging (estilo Twitter) desenvolvida com Node.js, Express.js e MongoDB. Permite cadastro, login com autenticação JWT, publicação de posts com hashtags e comentários.

---

## Tecnologias utilizadas

| Tecnologia | Finalidade |
|---|---|
| Node.js | Ambiente de execução |
| Express.js | Framework web (rotas, middleware) |
| MongoDB | Banco de dados (driver nativo) |
| JSON Web Token (JWT) | Autenticação via cookie HTTP |
| bcryptjs | Hash de senhas |
| EJS | Templates HTML gerados no servidor |

---

## Estrutura do projeto

```
src/
├── server.js                 # Ponto de entrada do servidor Express
├── index.js                  # Menu interativo CLI (Projeto 1 — mantido)
├── db/
│   └── connection.js         # Conexão com o MongoDB
├── middleware/
│   └── autenticar.js         # Middleware de verificação do JWT
├── models/
│   ├── Usuario.js            # Coleção: usuarios
│   ├── Post.js               # Coleção: posts
│   └── Comentario.js         # Coleção: comentarios
├── routes/
│   ├── auth.js               # Rotas de login, cadastro e logout
│   ├── posts.js              # Rotas do feed e posts
│   └── comentarios.js        # Rotas de comentários
├── views/
│   ├── login.ejs             # Tela de login
│   ├── cadastro.ejs          # Tela de cadastro
│   ├── feed.ejs              # Feed principal
│   ├── post.ejs              # Post individual com comentários
│   └── perfil.ejs            # Perfil do usuário
├── public/
│   └── style.css             # Estilos da interface
└── utils/
    └── logger.js             # Log de erros em arquivo
```

---

## Pré-requisitos

- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/)

---

## Como rodar

**1. Clone o repositório e entre na pasta do projeto.**

**2. Suba os containers (app + MongoDB):**
```bash
docker-compose up --build
```

**3. Acesse no navegador:**
```
http://localhost:3000
```

> Na primeira execução o `--build` compila a imagem. Nas próximas vezes pode omiti-lo:
> ```bash
> docker-compose up
> ```

**Para parar os containers:**
```bash
docker-compose down
```

---

## Rotas da aplicação

| Método | Rota | Autenticação | Descrição |
|---|---|---|---|
| GET | `/login` | Não | Exibe formulário de login |
| POST | `/login` | Não | Autentica e gera o cookie JWT |
| GET | `/cadastro` | Não | Exibe formulário de cadastro |
| POST | `/cadastro` | Não | Cria conta e já faz login |
| GET | `/logout` | Não | Remove o cookie e encerra a sessão |
| GET | `/` | **Sim** | Feed com todos os posts |
| POST | `/posts` | **Sim** | Publica novo post |
| POST | `/posts/:id/deletar` | **Sim** | Deleta um post próprio |
| GET | `/posts/:id` | **Sim** | Exibe post e seus comentários |
| POST | `/posts/:id/comentarios` | **Sim** | Adiciona comentário ao post |
| POST | `/comentarios/:id/deletar` | **Sim** | Deleta um comentário próprio |
| GET | `/perfil/:username` | **Sim** | Exibe perfil e posts do usuário |

---

## Autenticação

O login gera um **JWT** assinado com a chave `JWT_SECRET` e o armazena em um cookie `httpOnly` com validade de 24 horas. O cookie é enviado automaticamente pelo navegador em todas as requisições.

O middleware `autenticar.js` verifica o token em todas as rotas protegidas. Se o token for inválido ou ausente, o usuário é redirecionado para `/login`.

---

## Coleções do banco de dados

### `usuarios`
| Campo | Tipo | Obrigatório |
|---|---|---|
| nome | String | Sim |
| username | String | Sim (único) |
| email | String | Sim (único) |
| senha | String (bcrypt hash) | Sim |
| bio | String | Não |
| dataCadastro | Date | Automático |

### `posts`
| Campo | Tipo | Obrigatório |
|---|---|---|
| conteudo | String (máx. 280 chars) | Sim |
| autorId | ObjectId | Sim |
| hashtags | Array | Automático |
| curtidas | Number | Automático (0) |
| dataCriacao | Date | Automático |

### `comentarios`
| Campo | Tipo | Obrigatório |
|---|---|---|
| conteudo | String | Sim |
| autorId | ObjectId | Sim |
| postId | ObjectId | Sim |
| dataCriacao | Date | Automático |

---

## CLI (Projeto 1)

O menu interativo do Projeto 1 foi mantido e pode ser acessado com:
```bash
npm run cli
```

---

## Log de erros

Todos os erros capturados são registrados automaticamente na pasta `/logs`, em arquivos nomeados por data:
```
logs/erros-2024-04-28.log
```

Cada entrada contém timestamp, origem do erro, mensagem e stack trace.
