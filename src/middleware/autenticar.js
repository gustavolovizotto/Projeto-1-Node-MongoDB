const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'segredo_dev';

function autenticar(req, res, next) {
    const token = req.cookies.jwt;

    if (!token) {
        return res.redirect('/login');
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.usuario = payload;
        next();
    } catch (erro) {
        res.clearCookie('jwt');
        return res.redirect('/login');
    }
}

module.exports = autenticar;
