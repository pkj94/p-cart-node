module.exports = class ControllerCommonColumnLeft extends Controller {
    async index() {
        const data = {};
        await this.load.language('common/column_left');
        // Step
        data['text_license'] = this.language.get('text_license');
        data['text_installation'] = this.language.get('text_installation');
        data['text_configuration'] = this.language.get('text_configuration');
        data['text_upgrade'] = this.language.get('text_upgrade');
        data['text_finished'] = this.language.get('text_finished');
        data['text_language'] = this.language.get('text_language');

        if (this.request.get['route']) {
            data['route'] = this.request.get['route'];
        } else {
            data['route'] = 'install/step_1';
        }

        // Language
        data['action'] = this.url.link('common/column_left/changeLanguage', '', this.request.server['HTTPS']);

        if (this.session.data['language']) {
            data['code'] = this.session.data['language'];
        } else {
            data['code'] = this.config.get('language.default');
        }

        data['languages'] = [];

        const languages = require('glob').sync(DIR_LANGUAGE + '*');

        for (let language of languages) {
            data['languages'].push(expressPath.basename(language));
        }

        if (!this.request.get['route']) {
            data['redirect'] = this.url.link('install/step_1');
        } else {
            let url_data = this.request.get;

            let route = url_data['route'];

            delete url_data['route'];

            let url = '';

            if (url_data) {
                url = '&' + decodeURIComponent(http_build_query(url_data, '', '&'));
            }

            data['redirect'] = this.url.link(route, url, this.request.server['HTTPS']);
        }

        return await this.load.view('common/column_left', data);
    }

    async changeLanguage() {
        if (this.request.post['code'] && is_dir(DIR_LANGUAGE + expressPath.basename(this.request.post['code']))) {
            this.session.data['language'] = this.request.post['code'];
        }

        if (this.request.post['redirect']) {
            this.response.setRedirect(this.request.post['redirect']);
        } else {
            this.response.setRedirect(this.url.link('install/step_1'));
        }
    }
}
