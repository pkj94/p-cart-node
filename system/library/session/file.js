const fs = require('fs');
const path = require('path');

module.exports = class File {
    constructor(registry) {
        this.config = registry.get('config');
    }

    read(session_id) {
        const file = DIR_SESSION + `sess_${path.basename(session_id)}`;

        if (fs.existsSync(file)) {
            return JSON.parse(fs.readFileSync(file, 'utf8'));
        } else {
            return [];
        }
    }

    write(session_id, data) {
        const file = DIR_SESSION + `sess_${path.basename(session_id)}`;
        fs.writeFileSync(file, JSON.stringify(data));
        return true;
    }

    destroy(session_id) {
        const file = DIR_SESSION + `sess_${path.basename(session_id)}`;

        if (fs.existsSync(file)) {
            fs.unlinkSync(file);
        }
    }

    gc() {
        if (Math.round(Math.random() * (this.config.get('session_divisor') / this.config.get('session_probability'))) === 1) {
            const expire = Date.now() - this.config.get('session_expire') * 1000;

            const files = fs.readdirSync(DIR_SESSION).filter(file => file.startsWith('sess_'));

            for (const file of files) {
                const filePath = DIR_SESSION + file;
                if (fs.existsSync(filePath) && fs.statSync(filePath).mtimeMs < expire) {
                    fs.unlinkSync(filePath);
                }
            }
        }
    }
}
