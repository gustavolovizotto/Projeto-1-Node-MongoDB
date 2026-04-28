const fs = require('fs');
const path = require('path');

const LOGS_DIR = path.join(__dirname, '../../logs');

if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
}

function registrarErro(origem, erro) {
    const agora = new Date();
    const dataArquivo = agora.toISOString().slice(0, 10);
    const caminhoArquivo = path.join(LOGS_DIR, `erros-${dataArquivo}.log`);

    const entrada =
        `[${agora.toISOString()}] [${origem}]\n` +
        `  Tipo:  ${erro.name}\n` +
        `  Msg:   ${erro.message}\n` +
        `  Stack: ${erro.stack}\n` +
        `${'─'.repeat(60)}\n`;

    fs.appendFileSync(caminhoArquivo, entrada, 'utf8');
}

module.exports = { registrarErro };
