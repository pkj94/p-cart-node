const fs = require('fs');
const html_entity_decode = require('locutus/php/strings/html_entity_decode');
module.exports = class Step3Controller extends Controller {
    constructor(registry) {
        super(registry);
        this.error = {};
    }

    async index() {
        await this.load.language('install/step_3');

        if ((this.request.server['method'] === 'POST') && await this.validate()) {
            try {
                this.load.model('install/install', this);

                await this.model_install_install.database(this.request.post);

                // Catalog config.json
                let output = {};

                output.APPLICATION = 'Catalog';
                output.HTTP_SERVER = HTTP_OPENCART;
                output.DIR_OPENCART = DIR_OPENCART;
                output.DIR_APPLICATION = DIR_OPENCART + 'catalog/';
                output.DIR_EXTENSION = DIR_OPENCART + 'extension/';
                output.DIR_IMAGE = DIR_OPENCART + 'image/';
                output.DIR_SYSTEM = DIR_OPENCART + 'system/';
                output.DIR_STORAGE = output.DIR_SYSTEM + 'storage/';
                output.DIR_LANGUAGE = output.DIR_APPLICATION + 'language/';
                output.DIR_TEMPLATE = output.DIR_APPLICATION + 'view/template/';
                output.DIR_CONFIG = output.DIR_SYSTEM + 'config/';
                output.DIR_CACHE = output.DIR_STORAGE + 'cache/';
                output.DIR_DOWNLOAD = output.DIR_STORAGE + 'download/';
                output.DIR_LOGS = output.DIR_STORAGE + 'logs/';
                output.DIR_SESSION = output.DIR_STORAGE + 'session/';
                output.DIR_UPLOAD = output.DIR_STORAGE + 'upload/';
                output.DB_DRIVER = this.addslashes(this.request.post['db_driver']);
                output.DB_HOSTNAME = this.addslashes(this.request.post['db_hostname']);
                output.DB_USERNAME = this.addslashes(this.request.post['db_username']);
                output.DB_PASSWORD = this.addslashes(html_entity_decode(this.request.post['db_password']));
                output.DB_DATABASE = this.addslashes(this.request.post['db_database']);
                output.DB_PORT = this.request.post['db_port'];
                output.DB_PREFIX = this.addslashes(this.request.post['db_prefix']);
                output.DB_DEBUG = true;
                output.SERVER_PORT = this.request.post['port'] || 8080;


                fs.writeFileSync(DIR_OPENCART + 'config.json', JSON.stringify(output, null, "\t"));

                // Admin config.json
                output = {};
                output.APPLICATION = 'Admin';
                output.HTTP_SERVER = HTTP_OPENCART + 'admin/';
                output.HTTP_CATALOG = HTTP_OPENCART;
                output.DIR_OPENCART = DIR_OPENCART;
                output.DIR_APPLICATION = DIR_OPENCART + 'admin/';
                output.DIR_EXTENSION = DIR_OPENCART + 'extension/';
                output.DIR_IMAGE = DIR_OPENCART + 'image/';
                output.DIR_SYSTEM = DIR_OPENCART + 'system/';
                output.DIR_STORAGE = output.DIR_SYSTEM + 'storage/';
                output.DIR_LANGUAGE = output.DIR_APPLICATION + 'language/';
                output.DIR_TEMPLATE = output.DIR_APPLICATION + 'view/template/';
                output.DIR_CONFIG = output.DIR_SYSTEM + 'config/';
                output.DIR_CACHE = output.DIR_STORAGE + 'cache/';
                output.DIR_DOWNLOAD = output.DIR_STORAGE + 'download/';
                output.DIR_LOGS = output.DIR_STORAGE + 'logs/';
                output.DIR_SESSION = output.DIR_STORAGE + 'session/';
                output.DIR_UPLOAD = output.DIR_STORAGE + 'upload/';
                output.DB_DRIVER = this.addslashes(this.request.post['db_driver']);
                output.DB_HOSTNAME = this.addslashes(this.request.post['db_hostname']);
                output.DB_USERNAME = this.addslashes(this.request.post['db_username']);
                output.DB_PASSWORD = this.addslashes(html_entity_decode(this.request.post['db_password']));
                output.DB_DATABASE = this.addslashes(this.request.post['db_database']);
                output.DB_PORT = this.request.post['db_port'];
                output.DB_PREFIX = this.addslashes(this.request.post['db_prefix']);
                output.DB_DEBUG = true;
                output.SERVER_PORT = this.request.post['port'] || 8080;
                output.OPENCART_SERVER = 'https://www.opencart.com/';

                fs.writeFileSync(DIR_OPENCART + 'admin/config.json', JSON.stringify(output, null, "\t"));

                this.response.setRedirect(this.url.link('install/step_4', 'language=' + this.config.get('language_code')));
            } catch (e) {
                console.log(e);
                this.error['warning'] = e.message;
            }
        }

        this.document.setTitle(this.language.get('heading_title'));

        const data = {};
        data['heading_title'] = this.language.get('heading_title');

        data['text_step_3'] = this.language.get('text_step_3');
        data['text_db_connection'] = this.language.get('text_db_connection');
        data['text_db_administration'] = this.language.get('text_db_administration');
        data['text_mysqli'] = this.language.get('text_mysqli');
        data['text_mpdo'] = this.language.get('text_mpdo');
        data['text_pgsql'] = this.language.get('text_pgsql');
        data['text_help'] = this.language.get('text_help');
        data['text_cpanel'] = this.language.get('text_cpanel');
        data['text_plesk'] = this.language.get('text_plesk');

        data['entry_db_driver'] = this.language.get('entry_db_driver');
        data['entry_db_hostname'] = this.language.get('entry_db_hostname');
        data['entry_db_username'] = this.language.get('entry_db_username');
        data['entry_db_password'] = this.language.get('entry_db_password');
        data['entry_db_database'] = this.language.get('entry_db_database');
        data['entry_db_port'] = this.language.get('entry_db_port');
        data['entry_db_prefix'] = this.language.get('entry_db_prefix');
        data['entry_username'] = this.language.get('entry_username');
        data['entry_password'] = this.language.get('entry_password');
        data['entry_email'] = this.language.get('entry_email');

        data['button_continue'] = this.language.get('button_continue');
        data['button_back'] = this.language.get('button_back');

        data['error_warning'] = this.error['warning'] || '';
        data['error_db_driver'] = this.error['db_driver'] || '';
        data['error_db_hostname'] = this.error['db_hostname'] || '';
        data['error_db_username'] = this.error['db_username'] || '';
        data['error_db_database'] = this.error['db_database'] || '';
        data['error_db_port'] = this.error['db_port'] || '';
        data['error_db_prefix'] = this.error['db_prefix'] || '';
        data['error_username'] = this.error['username'] || '';
        data['error_password'] = this.error['password'] || '';
        data['error_email'] = this.error['email'] || '';

        data['action'] = this.url.link('install/step_3', 'language=' + this.config.get('language_code'));

        const db_drivers = ['mysqli', 'mongodb'];
        data['drivers'] = [];

        db_drivers.forEach(db_driver => {
            if (this.extension_loaded(db_driver)) {
                data['drivers'].push({
                    text: this.language.get('text_' + db_driver),
                    value: db_driver
                });
            }
        });

        data['db_driver'] = this.request.post['db_driver'] || '';
        data['db_hostname'] = this.request.post['db_hostname'] || 'localhost';
        data['db_username'] = this.request.post['db_username'] || 'root';
        data['db_password'] = this.request.post['db_password'] || '';
        data['db_database'] = this.request.post['db_database'] || '';
        data['db_port'] = this.request.post['db_port'] || 3306;
        data['db_prefix'] = this.request.post['db_prefix'] || '';
        data['username'] = this.request.post['username'] || 'admin';
        data['password'] = this.request.post['password'] || '';
        data['email'] = this.request.post['email'] || '';

        data['back'] = this.url.link('install/step_2', 'language=' + this.config.get('language_code'));

        data['footer'] = this.load.controller('common/footer');
        data['header'] = this.load.controller('common/header');
        data['language'] = this.load.controller('common/language');

        this.response.setOutput(this.load.view('install/step_3', data));
    }

    async validate() {
        if (!this.request.post['db_hostname']) {
            this.error['db_hostname'] = this.language.get('error_db_hostname');
        }

        if (!this.request.post['db_username']) {
            this.error['db_username'] = this.language.get('error_db_username');
        }

        if (!this.request.post['db_database']) {
            this.error['db_database'] = this.language.get('error_db_database');
        }

        if (!this.request.post['db_port']) {
            this.error['db_port'] = this.language.get('error_db_port');
        }

        if (this.request.post['db_prefix'] && /[^a-z0-9_]/.test(this.request.post['db_prefix'])) {
            this.error['db_prefix'] = this.language.get('error_db_prefix');
        }

        const db_drivers = ['mysqli', 'mongodb'];

        if (!db_drivers.includes(this.request.post['db_driver'])) {
            this.error['db_driver'] = this.language.get('error_db_driver');
        } else {
            try {
                const db = await new DbLibrary(this.request.post['db_driver'], this.html_entity_decode(this.request.post['db_hostname']), this.html_entity_decode(this.request.post['db_username']), this.html_entity_decode(this.request.post['db_password']), this.html_entity_decode(this.request.post['db_database']), this.request.post['db_port']).connect();
            } catch (e) {
                console.log('e----------', e)
                this.error['warning'] = e.message;
            }
        }

        if (!this.request.post['username']) {
            this.error['username'] = this.language.get('error_username');
        }

        if ((this.request.post['email'].length > 96) || !this.validateEmail(this.request.post['email'])) {
            this.error['email'] = this.language.get('error_email');
        }

        if (!this.request.post['password']) {
            this.error['password'] = this.language.get('error_password');
        }

        if (!this.isWritable(DIR_OPENCART + 'config.json')) {
            this.error['warning'] = this.language.get('error_config') + DIR_OPENCART + 'config.json!';
        }

        if (!this.isWritable(DIR_OPENCART + 'admin/config.json')) {
            this.error['warning'] = this.language.get('error_config') + DIR_OPENCART + 'admin/config.json!';
        }
        return Object.keys(this.error).length === 0;
    }

    addslashes(str) {
        return str.replace(/\\/g, '\\\\').replace(/'/g, '\\\'').replace(/"/g, '\\"');
    }

    html_entity_decode(str) {
        return str; // Implement HTML entity decode logic if needed
    }

    extension_loaded(extension) {
        // Implement logic to check if an extension is loaded
        return true; // Placeholder
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    isWritable(path) {
        // Implement logic to check if a file is writable
        return fs.existsSync(path); // Placeholder
    }
}

