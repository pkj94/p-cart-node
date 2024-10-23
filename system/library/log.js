
const path = require('path');
module.exports = class LogLibrary {
    constructor(filename) {
        this.file = DIR_LOGS + filename;
    }
    write(message) {
        if (!fs.existsSync(this.file.replace(path.basename(this.file), '')))
            fs.mkdirSync(this.file.replace(path.basename(this.file), ''), { recursive: true });
        const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
        const logMessage = `${timestamp} - ${typeof message === 'string' ? message : JSON.stringify(message)}\n`;
        fs.appendFileSync(this.file, logMessage);
    }
}