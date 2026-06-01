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
            const hashtags = (dados.conteudo.match(/#\w+/g) || [])
                .map(h => h.toLowerCase());

            const comentario = {
                conteudo: dados.conteudo.trim(),
                autorId: new ObjectId(dados.autorId),
                postId: new ObjectId(dados.postId),
                hashtags,
                dataCriacao: new Date()
            };

            if (dados.parentId) {
                if (!ObjectId.isValid(dados.parentId)) {
                    throw new Error(`parentId inválido: "${dados.parentId}"`);
                }
                comentario.parentId = new ObjectId(dados.parentId);
            }

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
            
            await db.collection(COLECAO).deleteMany({
                parentId: new ObjectId(id)
            });

            const resultado = await db.collection(COLECAO).deleteOne({
                _id: new ObjectId(id)
            });

            return resultado.deletedCount > 0;

        } catch (erro) {
            registrarErro('Comentario.deletar', erro);
            throw erro;
        }
    }

    static async buscarPorId(id) {
        try {
            if (!id) throw new Error('O ID não pode ser vazio.');
            if (!ObjectId.isValid(id)) throw new Error(`ID inválido: "${id}"`);

            const db = await conectar();
            return await db.collection(COLECAO).findOne({ _id: new ObjectId(id) });
        } catch (erro) {
            registrarErro('Comentario.buscarPorId', erro);
            throw erro;
        }
    }

    static async atualizar(id, conteudo) {
        try {
            if (!id) throw new Error('O ID não pode ser vazio.');
            if (!ObjectId.isValid(id)) throw new Error(`ID inválido: "${id}"`);
            if (!conteudo || conteudo.trim() === '') {
                throw new Error('O comentário não pode ser vazio.');
            }

            const hashtags = (conteudo.match(/#\w+/g) || [])
                .map(h => h.toLowerCase());

            const db = await conectar();
            const resultado = await db.collection(COLECAO).updateOne(
                { _id: new ObjectId(id) },
                { $set: { conteudo: conteudo.trim(), hashtags } }
            );

            return resultado.modifiedCount > 0;
        } catch (erro) {
            registrarErro('Comentario.atualizar', erro);
            throw erro;
        }
    }
}

module.exports = Comentario;
