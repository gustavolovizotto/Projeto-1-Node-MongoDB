require('dotenv').config();
const readline = require('readline');

const { desconectar } = require('./db/connection');
const Usuario = require('./models/Usuario');
const Post = require('./models/Post');
const Comentario = require('./models/Comentario');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function pergunta(texto) {
    return new Promise(resolve => rl.question(texto, resolve));
}

function exibirMenu() {
    console.log('\n=============================');
    console.log('     MICRO-BLOGGING MENU     ');
    console.log('=============================');
    console.log('--- USUÁRIOS ---');
    console.log('  1. Cadastrar usuário');
    console.log('  2. Buscar usuário por username');
    console.log('  3. Listar todos os usuários');
    console.log('  4. Deletar usuário');
    console.log('--- POSTS ---');
    console.log('  5. Publicar post');
    console.log('  6. Buscar posts por hashtag');
    console.log('  7. Buscar posts por usuário (ID)');
    console.log('  8. Listar todos os posts');
    console.log('  9. Deletar post');
    console.log('--- COMENTÁRIOS ---');
    console.log('  10. Comentar em um post');
    console.log('  11. Buscar comentários de um post (ID)');
    console.log('  12. Deletar comentário');
    console.log('-----------------------------');
    console.log('  0. Sair');
    console.log('=============================');
}

async function main() {
    console.log('\nBem-vindo ao sistema de Micro-blogging!');

    let rodando = true;

    while (rodando) {
        exibirMenu();
        const opcao = await pergunta('\nEscolha uma opção: ');

        switch (opcao.trim()) {

            case '1': {
                console.log('\n--- Cadastrar Usuário ---');
                const nome = await pergunta('Nome: ');
                const username = await pergunta('Username: ');
                const email = await pergunta('Email: ');
                const senha = await pergunta('Senha: ');
                const bio = await pergunta('Bio (opcional): ');
                try {
                    const usuario = await Usuario.inserir({ nome, username, email, senha, bio });
                    console.log(`\nUsuário criado com sucesso! ID: ${usuario._id}`);
                } catch (e) {
                    console.log(`\nErro: ${e.message}`);
                }
                break;
            }

            case '2': {
                console.log('\n--- Buscar Usuário ---');
                const username = await pergunta('Username: ');
                try {
                    const usuario = await Usuario.buscarPorUsername(username);
                    if (usuario) {
                        console.log(`\nUsuário encontrado:`);
                        console.log(`  ID:       ${usuario._id}`);
                        console.log(`  Nome:     ${usuario.nome}`);
                        console.log(`  Username: @${usuario.username}`);
                        console.log(`  Email:    ${usuario.email}`);
                        console.log(`  Bio:      ${usuario.bio || '(sem bio)'}`);
                    } else {
                        console.log('\nUsuário não encontrado.');
                    }
                } catch (e) {
                    console.log(`\nErro: ${e.message}`);
                }
                break;
            }

            case '3': {
                console.log('\n--- Todos os Usuários ---');
                try {
                    const usuarios = await Usuario.listar();
                    if (usuarios.length === 0) {
                        console.log('Nenhum usuário cadastrado.');
                    } else {
                        usuarios.forEach(u => {
                            console.log(`  [${u._id}] @${u.username} — ${u.nome}`);
                        });
                    }
                } catch (e) {
                    console.log(`\nErro: ${e.message}`);
                }
                break;
            }

            case '4': {
                console.log('\n--- Deletar Usuário ---');
                const id = await pergunta('ID do usuário: ');
                try {
                    const deletado = await Usuario.deletar(id);
                    console.log(deletado ? '\nUsuário deletado com sucesso.' : '\nUsuário não encontrado.');
                } catch (e) {
                    console.log(`\nErro: ${e.message}`);
                }
                break;
            }

            case '5': {
                console.log('\n--- Publicar Post ---');
                const autorId = await pergunta('ID do autor: ');
                const conteudo = await pergunta('Conteúdo (use #hashtags): ');
                try {
                    const post = await Post.inserir({ autorId, conteudo });
                    console.log(`\nPost publicado! ID: ${post._id}`);
                    if (post.hashtags.length > 0) {
                        console.log(`Hashtags detectadas: ${post.hashtags.join(', ')}`);
                    }
                } catch (e) {
                    console.log(`\nErro: ${e.message}`);
                }
                break;
            }

            case '6': {
                console.log('\n--- Buscar Posts por Hashtag ---');
                const hashtag = await pergunta('Hashtag (ex: #nodejs): ');
                try {
                    const posts = await Post.buscarPorHashtag(hashtag);
                    if (posts.length === 0) {
                        console.log('\nNenhum post encontrado.');
                    } else {
                        console.log(`\n${posts.length} post(s) encontrado(s):`);
                        posts.forEach(p => {
                            console.log(`  [${p._id}] ${p.conteudo}`);
                        });
                    }
                } catch (e) {
                    console.log(`\nErro: ${e.message}`);
                }
                break;
            }

            case '7': {
                console.log('\n--- Buscar Posts por Usuário ---');
                const autorId = await pergunta('ID do usuário: ');
                try {
                    const posts = await Post.buscarPorAutor(autorId);
                    if (posts.length === 0) {
                        console.log('\nNenhum post encontrado.');
                    } else {
                        console.log(`\n${posts.length} post(s) encontrado(s):`);
                        posts.forEach(p => {
                            console.log(`  [${p._id}] ${p.conteudo}`);
                        });
                    }
                } catch (e) {
                    console.log(`\nErro: ${e.message}`);
                }
                break;
            }

            case '8': {
                console.log('\n--- Todos os Posts ---');
                try {
                    const posts = await Post.listar();
                    if (posts.length === 0) {
                        console.log('Nenhum post cadastrado.');
                    } else {
                        posts.forEach(p => {
                            console.log(`  [${p._id}] ${p.conteudo}`);
                        });
                    }
                } catch (e) {
                    console.log(`\nErro: ${e.message}`);
                }
                break;
            }

            case '9': {
                console.log('\n--- Deletar Post ---');
                const id = await pergunta('ID do post: ');
                try {
                    const deletado = await Post.deletar(id);
                    console.log(deletado ? '\nPost deletado com sucesso.' : '\nPost não encontrado.');
                } catch (e) {
                    console.log(`\nErro: ${e.message}`);
                }
                break;
            }

            case '10': {
                console.log('\n--- Comentar em um Post ---');
                const postId = await pergunta('ID do post: ');
                const autorId = await pergunta('ID do autor: ');
                const conteudo = await pergunta('Comentário: ');
                try {
                    const comentario = await Comentario.inserir({ postId, autorId, conteudo });
                    console.log(`\nComentário adicionado! ID: ${comentario._id}`);
                } catch (e) {
                    console.log(`\nErro: ${e.message}`);
                }
                break;
            }

            case '11': {
                console.log('\n--- Comentários de um Post ---');
                const postId = await pergunta('ID do post: ');
                try {
                    const comentarios = await Comentario.buscarPorPost(postId);
                    if (comentarios.length === 0) {
                        console.log('\nNenhum comentário encontrado.');
                    } else {
                        console.log(`\n${comentarios.length} comentário(s):`);
                        comentarios.forEach(c => {
                            console.log(`  [${c._id}] ${c.conteudo}`);
                        });
                    }
                } catch (e) {
                    console.log(`\nErro: ${e.message}`);
                }
                break;
            }

            case '12': {
                console.log('\n--- Deletar Comentário ---');
                const id = await pergunta('ID do comentário: ');
                try {
                    const deletado = await Comentario.deletar(id);
                    console.log(deletado ? '\nComentário deletado com sucesso.' : '\nComentário não encontrado.');
                } catch (e) {
                    console.log(`\nErro: ${e.message}`);
                }
                break;
            }

            case '0': {
                console.log('\nEncerrando...');
                rodando = false;
                break;
            }

            default: {
                console.log('\nOpção inválida. Tente novamente.');
            }
        }
    }

    rl.close();
    await desconectar();
}

main();
