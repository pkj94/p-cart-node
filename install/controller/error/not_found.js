global['\Opencart\Install\Controller\Error\NotFound'] = class NotFound extends Controller {
    constructor(registry) {
        super(registry);
    }
    async index() {
        await this.load.language('error/not_found');
        this.document.setTitle(this.language.get('heading_title'));
        const data = {
            heading_title: this.language.get('heading_title'),
            text_error: this.language.get('text_error'),
            button_continue: this.language.get('button_continue'),
            continue: await this.url.link('common/home', { language: this.config.get('language_code') }),
            footer: this.load.controller('common/footer'),
            header: this.load.controller('common/header')
        };
        this.response.addHeader(`${this.request.server['SERVER_PROTOCOL']} 404 Not Found`);
        this.response.setOutput(this.load.view('error/not_found', data));
    }
}  