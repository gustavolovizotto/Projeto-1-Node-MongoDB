require('dotenv').config();
const { MongoClient } = require('mongodb');
const { registrarErro } = require('../utils/logger');

const URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'microblog';

let client = null;
let db = null;

async function conectar() {
    if (db) return db;

    try {
        client = new MongoClient(URI);
        await client.connect();
        db = client.db(DB_NAME);
        console.log(`Conectado ao banco de dados: ${DB_NAME}`);
        return db;
    } catch (erro) {
        registrarErro('connection.conectar', erro);
        throw erro;
    }
}

async function desconectar() {
    try {
        if (client) {
            await client.close();
            client = null;
            db = null;
            console.log('Conexão encerrada.');
        }
    } catch (erro) {
        registrarErro('connection.desconectar', erro);
        throw erro;
    }
}

module.exports = { conectar, desconectar };
