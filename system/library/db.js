module.exports = class DBLibrary {
    constructor(adaptor, hostname, username, password, database, port = '', debug = false) {
        let className = 'Db' + ucfirst(adaptor);
        if (global[className]) {
            this.adaptor = new global[className](hostname, username, password, database, port, debug);
        } else {
            throw new Error(`Error: Could not load database adaptor ${adaptor}!`);
        }

    }
    async connect() {
        return await this.adaptor.connect()
    }
    query(sql) {
        return this.adaptor.query(sql);
    }

    escape(value) {
        return this.adaptor.escape(value);
    }
    escapeId(value) {
        return this.adaptor.escapeId(value);
    }
    countAffected() {
        return this.adaptor.countAffected();
    }

    getLastId() {
        return this.adaptor.getLastId();
    }

    isConnected() {
        return this.adaptor.isConnected();
    }
    close() {
        return this.adaptor.close();
    }
}

