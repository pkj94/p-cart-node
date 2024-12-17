module.exports = class Session {
    constructor(session) {
        this.data = session || {};
        this.session = session;
        // console.log('library/session',this.data)
    }
    getId() {
        return this.session_id;
    }
    async save(data = {}) {
        return new Promise((resolve, reject) => {
            // store user information in session, typically a user id
            for (let [key, value] of Object.entries(data)) {
                this.session[key] = value;
            }
            this.data = data;
            // save the session before redirection to ensure page
            // load does not happen before session is saved
            this.session.save((err) => {
                resolve(true);
            });
        });
    }
    start(id) {
        this.session_id = id;
    }
    async destroy() {
        this.data = {};
        this.session = {};
        this.session.save((err) => {
            resolve(true);
        });
    }
}  