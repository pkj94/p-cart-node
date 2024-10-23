global['\Opencart\Install\Controller\Install\Step1'] = class Step1 extends global['\Opencart\System\Engine\Controller'] {
    constructor(registry) {
        super(registry)
    }
    async index() {
        await this.load.language('install/step_1');
        this.document.setTitle(this.language.get('heading_title'));
        const data = {
            heading_title: this.language.get('heading_title'),
            text_step_1: this.language.get('text_step_1'),
            text_terms: this.language.get('text_terms'),
            button_continue: this.language.get('button_continue'),
            continue: await this.url.link('install/step_2', { language: this.config.get('language_code') }),
            footer: await this.load.controller('common/footer'),
            header: await this.load.controller('common/header'),
            language: await this.load.controller('common/language')
        };
        let response = await this.load.view('install/step_1', data);
        this.response.setOutput(response);
    }
}

