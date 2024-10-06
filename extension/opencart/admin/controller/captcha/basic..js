module.exports = class BasicCaptchaController extends Controller {
    constructor(registry) {
        super(registry)
    }
    async index() {
        await this.load.language('extension/opencart/captcha/basic');

        this.document.setTitle(this.language.get('heading_title'));

        const data = {};
        data.breadcrumbs = [];

        data.breadcrumbs.push({
            text: this.language.get('text_home'),
            href: this.url.link('common/dashboard', 'user_token=' + this.session.data.user_token)
        });

        data.breadcrumbs.push({
            text: this.language.get('text_extension'),
            href: this.url.link('marketplace/extension', 'user_token=' + this.session.data.user_token + '&type=captcha')
        });

        data.breadcrumbs.push({
            text: this.language.get('heading_title'),
            href: this.url.link('extension/opencart/captcha/basic', 'user_token=' + this.session.data.user_token)
        });

        data.save = this.url.link('extension/opencart/captcha/basic.save', 'user_token=' + this.session.data.user_token);
        data.back = this.url.link('marketplace/extension', 'user_token=' + this.session.data.user_token + '&type=captcha');

        data.captcha_basic_status = this.config.get('captcha_basic_status');

        data.header = await this.load.controller('common/header');
        data.column_left = await this.load.controller('common/column_left');
        data.footer = await this.load.controller('common/footer');

        this.response.setOutput(await this.load.view('extension/opencart/captcha/basic', data));
    }

    async save() {
        await this.load.language('extension/opencart/captcha/basic');

        const json = {};

        if (!this.user.hasPermission('modify', 'extension/opencart/captcha/basic')) {
            json.error = this.language.get('error_permission');
        }

        if (!json.error) {
            this.load.model('setting/setting',this);

            await this.model_setting_setting.editSetting('captcha_basic', this.request.post);

            json.success = this.language.get('text_success');
        }

        this.response.addHeader('Content-Type: application/json');
        this.response.setOutput(JSON.stringify(json));
    }
}

