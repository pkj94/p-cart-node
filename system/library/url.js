module.exports = class UrlLibrary {
    constructor(url) {
        this.url = url;
        this.rewrite = [];
    }
    addRewrite(rewrite) {
        this.rewrite.push(rewrite);
    }
    link(route, args = '', js = false) {
        let url = `${this.url.substring(0,this.url.length-1)}?route=${route}`;
        if (args) {
            if (typeof args == 'object') {
                Object.keys(args).map(key=>{
                    url += `&${key}=${args[key]}`;
                    return key;
                })
            } else {
                url += `&${args.trim('&')}`;
            }
        }
        for (const rewrite of this.rewrite) {
            url = rewrite.rewrite(url);
        }
        return js ? url : url.replace(/&/g, '&amp;');
    }
}
