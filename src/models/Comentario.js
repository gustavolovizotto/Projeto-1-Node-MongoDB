const { ObjectId } = require('mongodb');
const { conectar } = require('../db/connection');
const { registrarErro } = require('../utils/logger');

const COLECAO = 'comentarios';

class Comentario {
    static async inserir(dados) {
        try {
            const obrigatorios = ['conteudo', 'autorId', 'postId'];
            for (const campo of obrigatorios) {
                if (!dados[campo] || String(dados[campo]).trim() === '') {
                    throw new Error(`Campo obrigatório ausente ou vazio: "${campo}"`);
                }
            }
            if (!ObjectId.isValid(dados.autorId)) {
                throw new Error(`autorId inválido: "${dados.autorId}"`);
            }
            if (!ObjectId.isValid(dados.postId)) {
                throw new Error(`postId inválido: "${dados.postId}"`);
            }

            const db = await conectar();
            const comentario = {
                conteudo: dados.conteudo.trim(),
                autorId: new ObjectId(dados.autorId),
                postId: new ObjectId(dados.postId),
                dataCriacao: new Date()
            };

            const resultado = await db.collection(COLECAO).insertOne(comentario);
            return { _id: resultado.insertedId, ...comentario };

        } catch (erro) {
            registrarErro('Comentario.inserir', erro);
            throw erro;
        }
    }

    static async buscarPorPost(postId) {
        try {
            if (!postId) throw new Error('O postId não pode ser vazio.');
            if (!ObjectId.isValid(postId)) throw new Error(`postId inválido: "${postId}"`);

            const db = await conectar();
            return await db.collection(COLECAO)
                .find({ postId: new ObjectId(postId) })
                .sort({ dataCriacao: 1 })
                .toArray();

        } catch (erro) {
            registrarErro('Comentario.buscarPorPost', erro);
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
            registrarErro('Comentario.buscarPorAutor', erro);
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
            registrarErro('Comentario.deletar', erro);
            throw erro;
        }
    }
}

module.exports = Comentario;
