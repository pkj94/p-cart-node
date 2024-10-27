

global['\Opencart\Install\Controller\Install\Step2'] = class Step2 extends global['\Opencart\System\Engine\Controller'] {
    constructor(registry) {
        super(registry);
        this.error = {};
    }

    async index() {
        await this.load.language('install/step_2');

        if (this.request.server['method'] === 'POST' && this.validate()) {
            this.response.setRedirect(await this.url.link('install/step_3', `language=${this.config.get('language_code')}`));
        }

        this.document.setTitle(this.language.get('heading_title'));

        const data = {
            heading_title: this.language.get('heading_title'),
            text_step_2: this.language.get('text_step_2'),
            text_install_php: this.language.get('text_install_php'),
            text_install_extension: this.language.get('text_install_extension'),
            text_install_file: this.language.get('text_install_file'),
            text_setting: this.language.get('text_setting'),
            text_current: this.language.get('text_current'),
            text_required: this.language.get('text_required'),
            text_extension: this.language.get('text_extension'),
            text_status: this.language.get('text_status'),
            text_on: this.language.get('text_on'),
            text_off: this.language.get('text_off'),
            text_version: this.language.get('text_version'),
            text_global: this.language.get('text_global'),
            text_magic: this.language.get('text_magic'),
            text_file_upload: this.language.get('text_file_upload'),
            text_session: this.language.get('text_session'),
            text_db: this.language.get('text_db'),
            text_gd: this.language.get('text_gd'),
            text_curl: this.language.get('text_curl'),
            text_openssl: this.language.get('text_openssl'),
            text_zlib: this.language.get('text_zlib'),
            text_zip: this.language.get('text_zip'),
            text_mbstring: this.language.get('text_mbstring'),
            text_file: this.language.get('text_file'),
            text_directory: this.language.get('text_directory'),
            text_status: this.language.get('text_status'),
            text_missing: this.language.get('text_missing'),
            text_writable: this.language.get('text_writable'),
            text_unwritable: this.language.get('text_unwritable'),
            button_continue: this.language.get('button_continue'),
            button_back: this.language.get('button_back'),
            error_warning: this.error['warning'] || '',
            action: await this.url.link('install/step_2', `language=${this.config.get('language_code')}`),
            node_version: process.version,
            db: true,
            catalog_config: DIR_OPENCART + 'config.json',
            admin_config: DIR_OPENCART + 'admin/config.json',
            error_catalog_config: '',
            error_admin_config: '',
            back: await this.url.link('install/step_1', `language=${this.config.get('language_code')}`)
        };
        if (data.node_version < '18') {
            data['version'] = false;
        } else {
            data['version'] = true;
        }
        // Check if config files exist and are writable
        if (!fs.existsSync(data.catalog_config)) {
            data.error_catalog_config = this.language.get('text_missing');
        } else if (!fs.existsSync(data.catalog_config)) {
            data.error_catalog_config = this.language.get('text_unwritable');
        }

        if (!fs.existsSync(data.admin_config)) {
            data.error_admin_config = this.language.get('text_missing');
        } else if (!fs.existsSync(data.admin_config)) {
            data.error_admin_config = this.language.get('text_unwritable');
        }

        data.footer = await this.load.controller('common/footer');
        data.header = await this.load.controller('common/header');
        data.language = await this.load.controller('common/language');

        this.response.setOutput(this.load.view('install/step_2', data));
    }

    validate() {
        if (process.version < 18) {
            this.error['warning'] = this.language.get('error_version');
        }


        const catalogConfig = DIR_OPENCART + 'config.json';
        const adminConfig = DIR_OPENCART + 'admin/config.json';

        if (!fs.existsSync(catalogConfig)) {
            this.error['warning'] = this.language.get('error_catalog_exist');
        } else if (!fs.existsSync(catalogConfig)) {
            this.error['warning'] = this.language.get('error_catalog_writable');
        } else if (!fs.existsSync(adminConfig)) {
            this.error['warning'] = this.language.get('error_admin_exist');
        } else if (!fs.existsSync(adminConfig)) {
            this.error['warning'] = this.language.get('error_admin_writable');
        }

        return Object.keys(this.error).length === 0;
    }
}


