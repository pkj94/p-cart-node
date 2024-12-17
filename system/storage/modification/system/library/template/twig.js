const { twig } = require('twig');

module.exports = class TwigTemplate {
    constructor() {
        this.data = {};
    }

    set(key, value) {
        this.data[key] = value;
    }

    render(filename, code = '') {
        if (!code) {
            const file = DIR_TEMPLATE + `${filename}.twig`;
            // if (file.indexOf('home') != -1)
            //     console.log(file)

            
        if (DIR_CATALOG && is_file(DIR_MODIFICATION + 'admin/view/template/' + filename + '.twig')) {	
                code = fs.readFileSync(DIR_MODIFICATION + 'admin/view/template/' + filename + '.twig','utf-8');
            } else if (is_file(DIR_MODIFICATION + 'catalog/view/theme/' + filename + '.twig')) {
                code = fs.readFileSync(DIR_MODIFICATION + 'catalog/view/theme/' + filename + '.twig','utf-8');
            } else if (is_file(file)) {
      
                code = fs.readFileSync(file, 'utf-8');
            } else {
                throw new Error(`Error: Could not load template ${file}!`);
            }
        }

        const config = {
            autoescape: false,
            debug: false,
            auto_reload: true,
            cache: DIR_CACHE + 'template'
        };

        try {
            const template = twig({
                data: code,
                allowInlineIncludes: true,
                ...config
            });

            return template.renderAsync(this.data);
        } catch (e) {
            console.error(`Error: Could not load template ${filename}!`, e);
            process.exit(1);
        }
    }
}
