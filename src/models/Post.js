const { ObjectId } = require('mongodb');
const { conectar } = require('../db/connection');
const { registrarErro } = require('../utils/logger');

const COLECAO = 'posts';
const MAX_CARACTERES = 280;

class Post {
    static async inserir(dados) {
        try {
            if (!dados.conteudo || dados.conteudo.trim() === '') {
                throw new Error('Campo obrigatório ausente ou vazio: "conteudo"');
            }
            if (!dados.autorId) {
                throw new Error('Campo obrigatório ausente: "autorId"');
            }
            if (!ObjectId.isValid(dados.autorId)) {
                throw new Error(`autorId inválido: "${dados.autorId}"`);
            }
            if (dados.conteudo.trim().length > MAX_CARACTERES) {
                throw new Error(`O conteúdo excede o limite de ${MAX_CARACTERES} caracteres.`);
            }

            const hashtags = (dados.conteudo.match(/#\w+/g) || [])
                .map(h => h.toLowerCase());

            const db = await conectar();
            const post = {
                conteudo: dados.conteudo.trim(),
                autorId: new ObjectId(dados.autorId),
                hashtags,
                curtidas: 0,
                dataCriacao: new Date()
            };

            const resultado = await db.collection(COLECAO).insertOne(post);
            return { _id: resultado.insertedId, ...post };

        } catch (erro) {
            registrarErro('Post.inserir', erro);
            throw erro;
        }
    }

    static async buscarPorAutor(autorId) {
        try {
            if (!autorId) throw new Error('O autorId não pode ser vazio.');
            if (!ObjectId.isValid(autorId)) throw new Error(`autorId inválido: "${autorId}"`);

            const db = await conectar();
            return await db.collection(COLECAO)
                .find({ autorId: new ObjectId(autorId) })
                .sort({ dataCriacao: -1 })
                .toArray();

        } catch (erro) {
            registrarErro('Post.buscarPorAutor', erro);
            throw erro;
        }
    }

    static async buscarPorHashtag(hashtag) {
        try {
            if (!hashtag || hashtag.trim() === '') {
                throw new Error('A hashtag não pode ser vazia.');
            }

            const tag = hashtag.replace(/^#/, '').toLowerCase();

            const db = await conectar();
            return await db.collection(COLECAO)
                .find({ hashtags: `#${tag}` })
                .sort({ dataCriacao: -1 })
                .toArray();

        } catch (erro) {
            registrarErro('Post.buscarPorHashtag', erro);
            throw erro;
        }
    }

    static async listar() {
        try {
            const db = await conectar();
            return await db.collection(COLECAO)
                .find()
                .sort({ dataCriacao: -1 })
                .toArray();
        } catch (erro) {
            registrarErro('Post.listar', erro);
            throw erro;
        }
    }

    static async deletar(id) {
        try {
            if (!id) throw new Error('O ID não pode ser vazio.');
            if (!ObjectId.isValid(id)) throw new Error(`ID inválido: "${id}"`);

            const db = await conectar();
            const resultado = await db.collection(COLECAO).deleteOne({
                _id: new ObjectId(id)
            });

            return resultado.deletedCount > 0;

        } catch (erro) {
            registrarErro('Post.deletar', erro);
            throw erro;
        }
    }
}

module.exports = Post;
