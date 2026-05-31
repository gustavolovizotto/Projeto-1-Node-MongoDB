const { ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const { conectar } = require('../db/connection');
const { registrarErro } = require('../utils/logger');

const COLECAO = 'usuarios';

class Usuario {
    static async inserir(dados) {
        try {
            const obrigatorios = ['nome', 'username', 'email', 'senha'];
            for (const campo of obrigatorios) {
                if (!dados[campo] || String(dados[campo]).trim() === '') {
                    throw new Error(`Campo obrigatório ausente ou vazio: "${campo}"`);
                }
            }

            const db = await conectar();
            const colecao = db.collection(COLECAO);

            const existente = await colecao.findOne({
                $or: [{ username: dados.username }, { email: dados.email }]
            });
            if (existente) {
                throw new Error('Já existe um usuário com esse username ou email.');
            }

            const senhaHash = await bcrypt.hash(dados.senha, 10);

            const usuario = {
                nome: dados.nome.trim(),
                username: dados.username.trim().toLowerCase(),
                email: dados.email.trim().toLowerCase(),
                senha: senhaHash,
                bio: dados.bio ? dados.bio.trim() : '',
                dataCadastro: new Date()
            };

            const resultado = await colecao.insertOne(usuario);
            return { _id: resultado.insertedId, ...usuario };

        } catch (erro) {
            registrarErro('Usuario.inserir', erro);
            throw erro;
        }
    }

    static async buscarPorEmail(email) {
        try {
            if (!email || email.trim() === '') {
                throw new Error('O email não pode ser vazio.');
            }

            const db = await conectar();
            return await db.collection(COLECAO).findOne({
                email: email.trim().toLowerCase()
            });

        } catch (erro) {
            registrarErro('Usuario.buscarPorEmail', erro);
            throw erro;
        }
    }

    static async verificarSenha(senhaTexto, senhaHash) {
        return bcrypt.compare(senhaTexto, senhaHash);
    }

    static async buscarPorUsername(username) {
        try {
            if (!username || username.trim() === '') {
                throw new Error('O username não pode ser vazio.');
            }

            const db = await conectar();
            return await db.collection(COLECAO).findOne({
                username: username.trim().toLowerCase()
            });

        } catch (erro) {
            registrarErro('Usuario.buscarPorUsername', erro);
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
            registrarErro('Usuario.buscarPorId', erro);
            throw erro;
        }
    }

    static async listar() {
        try {
            const db = await conectar();
            return await db.collection(COLECAO).find().toArray();
        } catch (erro) {
            registrarErro('Usuario.listar', erro);
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
            registrarErro('Usuario.deletar', erro);
            throw erro;
        }
    }
}

module.exports = Usuario;
