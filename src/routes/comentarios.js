const express = require('express');
const { ObjectId } = require('mongodb');
const Comentario = require('../models/Comentario');
const Post = require('../models/Post');
const Usuario = require('../models/Usuario');
const autenticar = require('../middleware/autenticar');

const router = express.Router();

router.get('/posts/:id', autenticar, async (req, res) => {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
        return res.redirect('/?erro=Post inválido.');
    }

    try {
        const posts = await Post.listar();
        const post = posts.find(p => String(p._id) === id);

        if (!post) {
            return res.redirect('/?erro=Post não encontrado.');
        }

        const autor = await Usuario.buscarPorId(String(post.autorId));
        const comentarios = await Comentario.buscarPorPost(id);

        const autoresIds = [...new Set(comentarios.map(c => String(c.autorId)))];
        const autores = await Promise.all(autoresIds.map(aid => Usuario.buscarPorId(aid)));
        const mapaAutores = {};
        autores.forEach(u => { if (u) mapaAutores[String(u._id)] = u; });

        const comentariosEnriquecidos = comentarios.map(c => ({
            ...c,
            autor: mapaAutores[String(c.autorId)] || { username: 'desconhecido', nome: 'Usuário removido' }
        }));

        const topLevelComentarios = comentariosEnriquecidos.filter(c => !c.parentId);
        const respostas = comentariosEnriquecidos.filter(c => c.parentId);

        const mapaRespostas = {};
        respostas.forEach(r => {
            const pId = String(r.parentId);
            if (!mapaRespostas[pId]) {
                mapaRespostas[pId] = [];
            }
            mapaRespostas[pId].push(r);
        });

        topLevelComentarios.forEach(c => {
            c.respostas = mapaRespostas[String(c._id)] || [];
        });

        res.render('post', {
            usuario: req.usuario,
            post: { ...post, autor: autor || { username: 'desconhecido', nome: 'Usuário removido' } },
            comentarios: topLevelComentarios,
            erro: req.query.erro || null,
            sucesso: req.query.sucesso || null
        });
    } catch (erro) {
        res.redirect('/?erro=Erro ao carregar o post.');
    }
});

router.post('/posts/:id/comentarios', autenticar, async (req, res) => {
    const { id } = req.params;
    const { conteudo, parentId } = req.body;

    if (!conteudo || conteudo.trim() === '') {
        return res.redirect(`/posts/${id}?erro=O comentário não pode ser vazio.`);
    }

    if (!ObjectId.isValid(id)) {
        return res.redirect('/?erro=Post inválido.');
    }

    try {
        await Comentario.inserir({
            conteudo,
            autorId: req.usuario.userId,
            postId: id,
            parentId: parentId || null
        });
        res.redirect(`/posts/${id}`);
    } catch (erro) {
        res.redirect(`/posts/${id}?erro=${encodeURIComponent(erro.message)}`);
    }
});

router.post('/comentarios/:id/deletar', autenticar, async (req, res) => {
    const { id } = req.params;
    const voltarPara = req.body.postId ? `/posts/${req.body.postId}` : '/';

    if (!ObjectId.isValid(id)) {
        return res.redirect(`${voltarPara}?erro=Comentário inválido.`);
    }

    try {
        const comentario = await Comentario.buscarPorId(id);

        if (!comentario) {
            return res.redirect(`${voltarPara}?erro=Comentário não encontrado.`);
        }

        const eDoUsuario = String(comentario.autorId) === req.usuario.userId;

        if (!eDoUsuario) {
            return res.redirect(`${voltarPara}?erro=Você só pode deletar seus próprios comentários.`);
        }

        await Comentario.deletar(id);
        const separador = voltarPara.includes('?') ? '&' : '?';
        res.redirect(`${voltarPara}${separador}sucesso=Comentário deletado com sucesso.`);
    } catch (erro) {
        res.redirect(`${voltarPara}?erro=${encodeURIComponent(erro.message)}`);
    }
});

router.get('/comentarios/:id/editar', autenticar, async (req, res) => {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
        return res.redirect('/?erro=Comentário inválido.');
    }

    try {
        const comentario = await Comentario.buscarPorId(id);

        if (!comentario) {
            return res.redirect('/?erro=Comentário não encontrado.');
        }

        const eDoUsuario = String(comentario.autorId) === req.usuario.userId;

        if (!eDoUsuario) {
            return res.redirect('/?erro=Você só pode editar seus próprios comentários.');
        }

        res.render('editar-comentario', {
            usuario: req.usuario,
            comentario,
            erro: req.query.erro || null
        });
    } catch (erro) {
        res.redirect(`/?erro=${encodeURIComponent(erro.message)}`);
    }
});

router.post('/comentarios/:id/editar', autenticar, async (req, res) => {
    const { id } = req.params;
    const { conteudo, postId } = req.body;
    const voltarPara = postId ? `/posts/${postId}` : '/';

    if (!ObjectId.isValid(id)) {
        return res.redirect(`${voltarPara}?erro=Comentário inválido.`);
    }

    if (!conteudo || conteudo.trim() === '') {
        return res.redirect(`/comentarios/${id}/editar?erro=O comentário não pode ser vazio.`);
    }

    try {
        const comentario = await Comentario.buscarPorId(id);

        if (!comentario) {
            return res.redirect(`${voltarPara}?erro=Comentário não encontrado.`);
        }

        const eDoUsuario = String(comentario.autorId) === req.usuario.userId;

        if (!eDoUsuario) {
            return res.redirect(`${voltarPara}?erro=Você só pode editar seus próprios comentários.`);
        }

        await Comentario.atualizar(id, conteudo);
        res.redirect(voltarPara);
    } catch (erro) {
        res.redirect(`/comentarios/${id}/editar?erro=${encodeURIComponent(erro.message)}`);
    }
});

module.exports = router;
