module.exports = class ControllerInstallStep1 extends Controller {
    async index() {
        await this.load.language('install/step_1');
        if (this.request.server['method'] == 'POST') {
            this.response.setRedirect(await this.url.link('install/step_2'));
        }
        this.document.setTitle(this.language.get('heading_title'));
        const data = {
            heading_title: this.language.get('heading_title'),
            text_step_1: this.language.get('text_step_1'),
            text_terms: this.language.get('text_terms'),
            button_continue: this.language.get('button_continue'),
            action: await this.url.link('install/step_1'),
            footer: await this.load.controller('common/footer'),
            header: await this.load.controller('common/header'),
            column_left: await this.load.controller('common/column_left'),
        };
        this.response.setOutput(await this.load.view('install/step_1', data));
    }
}

