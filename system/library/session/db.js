module.exports = class SessionDB {
    constructor(registry) {
        this.db = registry.get('db');
        this.config = registry.get('config');
    }
    read(session_id) {
        return this.db.session.findOne({ method: 'GET', params: {}, query: { session_id } }).then(res => {
            return res.data ? JSON.parse(res.data) : {};
        }).catch(err => {
            console.log(err)
            return {}
        });
    }
    write(session_id, data) {
        return this.db.session.replace({ method: 'POST', params: {}, query: { session_id: session_id }, body: { session_id: session_id, data: data ? JSON.stringify(data) : '' } }).then(res => {
            return true;
        }).catch(err => {
            console.log(err)
            return true
        });
    }
    destroy(session_id) {
        return this.db.session.remove({ method: 'DELETE', params: {}, query: { session_id } }).then(res => {
            return true;
        }).catch(err => {
            console.log(err)
            return true
        });
    }
    gc() {
        if (Math.round(Math.random() * (this.config.get('session_divisor') / this.config.get('session_probability'))) === 1) {
            this.db.session.remove({ method: 'DELETE', params: {}, query: { expire: { $lt: new Date(new Date().toISOString().slice(0, 19).replace('T', ' ')) } } })
        }
        return true;
    }

}