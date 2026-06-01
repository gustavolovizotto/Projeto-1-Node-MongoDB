const { ObjectId } = require('mongodb');
const { conectar } = require('../db/connection');
const { registrarErro } = require('../utils/logger');
const crypto = require('crypto');

const COLECAO = 'refresh_tokens';

class RefreshToken {
    static async criar(userId, diasValidos = 7) {
        try {
            if (!userId) throw new Error('O userId não pode ser vazio.');
            if (!ObjectId.isValid(userId)) throw new Error(`userId inválido: "${userId}"`);

            const db = await conectar();
            const token = crypto.randomBytes(40).toString('hex');
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + diasValidos);

            const tokenObj = {
                token,
                userId: new ObjectId(userId),
                expiresAt,
                criadoEm: new Date(),
                revogado: false
            };

            await db.collection(COLECAO).insertOne(tokenObj);
            return token;
        } catch (erro) {
            registrarErro('RefreshToken.criar', erro);
            throw erro;
        }
    }

    static async buscar(token) {
        try {
            if (!token) throw new Error('O token não pode ser vazio.');

            const db = await conectar();
            return await db.collection(COLECAO).findOne({ token });
        } catch (erro) {
            registrarErro('RefreshToken.buscar', erro);
            throw erro;
        }
    }

    static async revogar(token) {
        try {
            if (!token) throw new Error('O token não pode ser vazio.');

            const db = await conectar();
            await db.collection(COLECAO).deleteOne({ token });
        } catch (erro) {
            registrarErro('RefreshToken.revogar', erro);
            throw erro;
        }
    }

    static async revogarTodosDoUsuario(userId) {
        try {
            if (!userId) throw new Error('O userId não pode ser vazio.');
            if (!ObjectId.isValid(userId)) throw new Error(`userId inválido: "${userId}"`);

            const db = await conectar();
            await db.collection(COLECAO).deleteMany({ userId: new ObjectId(userId) });
        } catch (erro) {
            registrarErro('RefreshToken.revogarTodosDoUsuario', erro);
            throw erro;
        }
    }
}

module.exports = RefreshToken;
