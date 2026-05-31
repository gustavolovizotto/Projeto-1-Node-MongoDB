const express = require('express');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'segredo_dev';
const COOKIE_OPTS = { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 };

router.get('/login', (req, res) => {
    if (req.cookies.jwt) return res.redirect('/');
    res.render('login', { erro: null });
});

router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.render('login', { erro: 'Preencha e-mail e senha.' });
    }

    try {
        const usuario = await Usuario.buscarPorEmail(email);
        if (!usuario) {
            return res.render('login', { erro: 'E-mail ou senha incorretos.' });
        }

        const senhaOk = await Usuario.verificarSenha(senha, usuario.senha);
        if (!senhaOk) {
            return res.render('login', { erro: 'E-mail ou senha incorretos.' });
        }

        const token = jwt.sign(
            { userId: String(usuario._id), username: usuario.username, nome: usuario.nome },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.cookie('jwt', token, COOKIE_OPTS);
        res.redirect('/');
    } catch (erro) {
        res.render('login', { erro: 'Erro interno. Tente novamente.' });
    }
});

router.get('/cadastro', (req, res) => {
    if (req.cookies.jwt) return res.redirect('/');
    res.render('cadastro', { erro: null });
});

router.post('/cadastro', async (req, res) => {
    const { nome, username, email, senha, bio } = req.body;

    if (!nome || !username || !email || !senha) {
        return res.render('cadastro', { erro: 'Todos os campos obrigatórios devem ser preenchidos.' });
    }

    try {
        const usuario = await Usuario.inserir({ nome, username, email, senha, bio });

        const token = jwt.sign(
            { userId: String(usuario._id), username: usuario.username, nome: usuario.nome },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.cookie('jwt', token, COOKIE_OPTS);
        res.redirect('/');
    } catch (erro) {
        res.render('cadastro', { erro: erro.message });
    }
});

router.get('/logout', (req, res) => {
    res.clearCookie('jwt');
    res.redirect('/login');
});

module.exports = router;
