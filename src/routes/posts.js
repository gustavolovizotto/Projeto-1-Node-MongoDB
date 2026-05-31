const express = require('express');
const { ObjectId } = require('mongodb');
const Post = require('../models/Post');
const Usuario = require('../models/Usuario');
const Comentario = require('../models/Comentario');
const autenticar = require('../middleware/autenticar');

const router = express.Router();

router.get('/', autenticar, async (req, res) => {
    try {
        const posts = await Post.listar();

        const usuarioIds = [...new Set(posts.map(p => String(p.autorId)))];
        const usuarios = await Promise.all(usuarioIds.map(id => Usuario.buscarPorId(id)));
        const mapaUsuarios = {};
        usuarios.forEach(u => { if (u) mapaUsuarios[String(u._id)] = u; });

        const postEnriquecidos = posts.map(p => ({
            ...p,
            autor: mapaUsuarios[String(p.autorId)] || { username: 'desconhecido', nome: 'Usuário removido' }
        }));

        res.render('feed', {
            usuario: req.usuario,
            posts: postEnriquecidos,
            erro: req.query.erro || null,
            sucesso: req.query.sucesso || null
        });
    } catch (erro) {
        res.render('feed', { usuario: req.usuario, posts: [], erro: 'Erro ao carregar o feed.', sucesso: null });
    }
});

router.post('/posts', autenticar, async (req, res) => {
    const { conteudo } = req.body;

    if (!conteudo || conteudo.trim() === '') {
        return res.redirect('/?erro=O conteúdo do post não pode ser vazio.');
    }

    try {
        await Post.inserir({ conteudo, autorId: req.usuario.userId });
        res.redirect('/');
    } catch (erro) {
        res.redirect(`/?erro=${encodeURIComponent(erro.message)}`);
    }
});

router.post('/posts/:id/deletar', autenticar, async (req, res) => {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
        return res.redirect('/?erro=Post inválido.');
    }

    try {
        const posts = await Post.buscarPorAutor(req.usuario.userId);
        const eDoUsuario = posts.some(p => String(p._id) === id);

        if (!eDoUsuario) {
            return res.redirect('/?erro=Você só pode deletar seus próprios posts.');
        }

        await Post.deletar(id);
        res.redirect('/');
    } catch (erro) {
        res.redirect(`/?erro=${encodeURIComponent(erro.message)}`);
    }
});

router.get('/perfil/:username', autenticar, async (req, res) => {
    try {
        const perfil = await Usuario.buscarPorUsername(req.params.username);
        if (!perfil) {
            return res.redirect('/?erro=Usuário não encontrado.');
        }

        const posts = await Post.buscarPorAutor(String(perfil._id));

        res.render('perfil', {
            usuario: req.usuario,
            perfil,
            posts
        });
    } catch (erro) {
        res.redirect('/?erro=Erro ao carregar o perfil.');
    }
});

module.exports = router;
