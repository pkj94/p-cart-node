global['\Opencart\Install\Controller\Install\Step4'] = class Step4 extends global['\Opencart\System\Engine\Controller'] {
    constructor(registry) {
        super(registry);
    }
    async index() {
        await this.load.language('install/step_4');

        this.document.setTitle(this.language.get('heading_title'));

        const data = {
            heading_title: this.language.get('heading_title'),
            text_step_4: this.language.get('text_step_4'),
            text_catalog: this.language.get('text_catalog'),
            text_admin: this.language.get('text_admin'),
            text_extension: this.language.get('text_extension'),
            text_mail: this.language.get('text_mail'),
            text_mail_description: this.language.get('text_mail_description'),
            text_facebook: this.language.get('text_facebook'),
            text_facebook_description: this.language.get('text_facebook_description'),
            text_facebook_visit: this.language.get('text_facebook_visit'),
            text_forum: this.language.get('text_forum'),
            text_forum_description: this.language.get('text_forum_description'),
            text_forum_visit: this.language.get('text_forum_visit'),
            text_commercial: this.language.get('text_commercial'),
            text_commercial_description: this.language.get('text_commercial_description'),
            text_commercial_visit: this.language.get('text_commercial_visit'),
            button_mail: this.language.get('button_mail'),
            error_warning: this.language.get('error_warning'),
            promotion: await this.load.controller('install/promotion'),
            footer: await this.load.controller('common/footer'),
            header: await this.load.controller('common/header')
        };
       
        this.response.setOutput(await this.load.view('install/step_4', data));
    }
}

