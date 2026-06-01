const jwt = require('jsonwebtoken');
const RefreshToken = require('../models/RefreshToken');
const Usuario = require('../models/Usuario');

const JWT_SECRET = process.env.JWT_SECRET || 'segredo_dev';
const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

async function autenticar(req, res, next) {
    const token = req.cookies.jwt;
    const refreshToken = req.cookies.refreshToken;

    if (!token) {
        if (refreshToken) {
            return await tentarRenovarToken(req, res, next, refreshToken);
        }
        return res.redirect('/login');
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.usuario = payload;
        return next();
    } catch (erro) {
        if (erro.name === 'TokenExpiredError' && refreshToken) {
            return await tentarRenovarToken(req, res, next, refreshToken);
        }

        res.clearCookie('jwt');
        res.clearCookie('refreshToken');
        return res.redirect('/login');
    }
}

async function tentarRenovarToken(req, res, next, tokenCodificado) {
    try {
        const tokenBD = await RefreshToken.buscar(tokenCodificado);
        
        if (!tokenBD || tokenBD.revogado || new Date() > new Date(tokenBD.expiresAt)) {
            if (tokenBD) {
                await RefreshToken.revogar(tokenCodificado);
            }
            res.clearCookie('jwt');
            res.clearCookie('refreshToken');
            return res.redirect('/login');
        }

        const usuario = await Usuario.buscarPorId(tokenBD.userId);
        if (!usuario) {
            await RefreshToken.revogar(tokenCodificado);
            res.clearCookie('jwt');
            res.clearCookie('refreshToken');
            return res.redirect('/login');
        }

        const novoAccessToken = jwt.sign(
            { userId: String(usuario._id), username: usuario.username, nome: usuario.nome },
            JWT_SECRET,
            { expiresIn: '15m' }
        );

        await RefreshToken.revogar(tokenCodificado);
        const novoRefreshTokenVal = await RefreshToken.criar(usuario._id);

        res.cookie('jwt', novoAccessToken, { 
            httpOnly: true, 
            maxAge: ACCESS_TOKEN_MAX_AGE,
            sameSite: 'lax'
        });
        res.cookie('refreshToken', novoRefreshTokenVal, { 
            httpOnly: true, 
            maxAge: REFRESH_TOKEN_MAX_AGE,
            sameSite: 'lax'
        });

        req.usuario = { userId: String(usuario._id), username: usuario.username, nome: usuario.nome };
        return next();
    } catch (erro) {
        res.clearCookie('jwt');
        res.clearCookie('refreshToken');
        return res.redirect('/login');
    }
}

module.exports = autenticar;
