module.exports = class SessionLibrary {
    constructor(registry) {
        this.registry = registry;
        this.request = registry.get('request').server;
        this.data = this.request.session || {};
        // console.log('library/session',this.data)
    }
    getId() {
        return this.session_id;
    }
    async save(data = {}) {
        return new Promise((resolve, reject) => {
            // store user information in session, typically a user id
            for (let [key, value] of Object.entries(data)) {
                this.request.session[key] = value;
            }
            this.data = data;
            // save the session before redirection to ensure page
            // load does not happen before session is saved
            this.request.session.save((err) => {
                resolve(true);
            });
        });
    }
    async destroy() {

        this.data = {};
        this.request.session = {};
        this.request.session.save((err) => {
            resolve(true);
        });
    }
}  