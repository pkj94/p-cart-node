module.exports = class RequestLibrary {
    get = {};
    post = {};
    cookie = {};
    files = {};
    server = {};
    params = {};
    constructor(req) {
        this.get = this.clean(req.query);
        this.post = this.clean(req.body);
        this.cookie = this.clean(req.cookies||{});
        this.files = this.clean(req.files||{});
        this.server = req;
        this.params = this.clean(req.params);
    }
    clean(data) {
        if (typeof data == 'object') {
            for (const key in data) {
                const value = data[key];
                delete data[key];
                data[this.clean(key)] = this.clean(value);
            }
        } else if (typeof data == 'string') {
            data = data.toString().trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
        }
        return data;
    }
}