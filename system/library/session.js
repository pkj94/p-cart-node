module.exports = class Session {
    constructor(adaptor, registry) {
        this.adaptor = null;
        this.session_id = '';
        this.data = [];
        const AdaptorClass = require(`./Session/${adaptor}`);
        if (AdaptorClass) {
            this.adaptor = new AdaptorClass(registry || {});
            process.on('exit', () => this.close());
            process.on('exit', () => this.gc());
        } else {
            throw new Error(`Error: Could not load session adaptor ${adaptor} session!`);
        }
    }
    getId() {
        return this.session_id;
    }
    async start(session_id = '') {
        if (!session_id) {
            session_id = require('crypto').randomBytes(26).toString('hex').slice(0, 26);
        }
        if (/^[a-zA-Z0-9,-]{22,52}$/.test(session_id)) {
            this.session_id = session_id;
        } else {
            throw new Error('Error: Invalid session ID!');
        }
        this.data = await this.adaptor.read(this.session_id);
        return this.session_id;
    }
    async close() {
        await this.adaptor.write(this.session_id, this.data);
    }
    async destroy() {
        this.data = [];
        await this.adaptor.destroy(this.session_id);
    }
    async gc() {
        await this.adaptor.gc(this.session_id);
    }
}  