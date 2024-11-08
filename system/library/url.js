module.exports = class Url {
    constructor(url, ssl = '') {
        this.url = url;
        this.ssl = ssl;
        this.rewrite = [];
    }

    addRewrite(rewrite) {
        this.rewrite.push(rewrite);
    }

    async link(route, args = '', secure = false) {
        let url = this.ssl && secure ? `${this.ssl}?route=${route}` : `${this.url}?route=${route}`;

        if (args) {
            if (typeof args === 'object') {
                url += '&' + new URLSearchParams(args).toString().replace(/&/g, '&amp;');
            } else {
                url += `&${args.trim().replace(/^&/, '').replace(/&/g, '&amp;')}`;
            }
        }

        this.rewrite.forEach(async rewrite => {
            url = await rewrite.rewrite(url);
        });

        return url;
    }
}  