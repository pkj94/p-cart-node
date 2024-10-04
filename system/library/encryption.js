const crypto = require('crypto');

module.exports = class EncryptionLibrary {
    constructor() {
        this.cipher = 'aes-256-ctr';
        this.digest = 'sha256';
    }

    encrypt(key, value) {
        const hashedKey = crypto.createHash(this.digest).update(key).digest();
        const iv = crypto.randomBytes(crypto.getCipherInfo(this.cipher).ivLength);

        const cipher = crypto.createCipheriv(this.cipher, hashedKey, iv);
        const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);

        return Buffer.concat([iv, encrypted]).toString('base64');
    }

    decrypt(key, value) {
        const hashedKey = crypto.createHash(this.digest).update(key).digest();
        const data = Buffer.from(value, 'base64');

        const iv = data.slice(0, crypto.getCipherInfo(this.cipher).ivLength);
        const encrypted = data.slice(iv.length);

        const decipher = crypto.createDecipheriv(this.cipher, hashedKey, iv);
        const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

        return decrypted.toString('utf8');
    }
}

