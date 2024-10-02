module.exports = class Step3 extends Controller {
    constructor(registry) {
        super(registry);
        this.error = {};
    }

    async index() {
        await this.load.language('install/step_3');

        if ((this.request.server['method'] === 'POST') && this.validate()) {
            this.load.model('install/install');

            this.model_install_install.database(this.request.post);

            // Catalog config.php
            let output = '<?php\n';

            output += '// APPLICATION\n';
            output += 'define(\'APPLICATION\', \'Catalog\');\n\n';

            output += '// HTTP\n';
            output += 'define(\'HTTP_SERVER\', \'' + HTTP_OPENCART + '\');\n\n';

            output += '// DIR\n';
            output += 'define(\'DIR_OPENCART\', \'' + DIR_OPENCART + '\');\n';
            output += 'define(\'DIR_APPLICATION\', DIR_OPENCART + \'catalog/\');\n';
            output += 'define(\'DIR_EXTENSION\', DIR_OPENCART + \'extension/\');\n';
            output += 'define(\'DIR_IMAGE\', DIR_OPENCART + \'image/\');\n';
            output += 'define(\'DIR_SYSTEM\', DIR_OPENCART + \'system/\');\n';
            output += 'define(\'DIR_STORAGE\', DIR_SYSTEM + \'storage/\');\n';
            output += 'define(\'DIR_LANGUAGE\', DIR_APPLICATION + \'language/\');\n';
            output += 'define(\'DIR_TEMPLATE\', DIR_APPLICATION + \'view/template/\');\n';
            output += 'define(\'DIR_CONFIG\', DIR_SYSTEM + \'config/\');\n';
            output += 'define(\'DIR_CACHE\', DIR_STORAGE + \'cache/\');\n';
            output += 'define(\'DIR_DOWNLOAD\', DIR_STORAGE + \'download/\');\n';
            output += 'define(\'DIR_LOGS\', DIR_STORAGE + \'logs/\');\n';
            output += 'define(\'DIR_SESSION\', DIR_STORAGE + \'session/\');\n';
            output += 'define(\'DIR_UPLOAD\', DIR_STORAGE + \'upload/\');\n\n';

            output += '// DB\n';
            output += 'define(\'DB_DRIVER\', \'' + this.addslashes(this.request.post['db_driver']) + '\');\n';
            output += 'define(\'DB_HOSTNAME\', \'' + this.addslashes(this.request.post['db_hostname']) + '\');\n';
            output += 'define(\'DB_USERNAME\', \'' + this.addslashes(this.request.post['db_username']) + '\');\n';
            output += 'define(\'DB_PASSWORD\', \'' + this.addslashes(this.html_entity_decode(this.request.post['db_password'])) + '\');\n';
            output += 'define(\'DB_DATABASE\', \'' + this.addslashes(this.request.post['db_database']) + '\');\n';
            output += 'define(\'DB_PORT\', \'' + this.addslashes(this.request.post['db_port']) + '\');\n';
            output += 'define(\'DB_PREFIX\', \'' + this.addslashes(this.request.post['db_prefix']) + '\');';

            const fs = require('fs');
            fs.writeFileSync(DIR_OPENCART + 'config.php', output);

            // Admin config.php
            output = '<?php\n';
            output += '// APPLICATION\n';
            output += 'define(\'APPLICATION\', \'Admin\');\n\n';

            output += '// HTTP\n';
            output += 'define(\'HTTP_SERVER\', \'' + HTTP_OPENCART + 'admin/\');\n';
            output += 'define(\'HTTP_CATALOG\', \'' + HTTP_OPENCART + '\');\n\n';

            output += '// DIR\n';
            output += 'define(\'DIR_OPENCART\', \'' + DIR_OPENCART + '\');\n';
            output += 'define(\'DIR_APPLICATION\', DIR_OPENCART + \'admin/\');\n';
            output += 'define(\'DIR_EXTENSION\', DIR_OPENCART + \'extension/\');\n';
            output += 'define(\'DIR_IMAGE\', DIR_OPENCART + \'image/\');\n';
            output += 'define(\'DIR_SYSTEM\', DIR_OPENCART + \'system/\');\n';
            output += 'define(\'DIR_CATALOG\', DIR_OPENCART + \'catalog/\');\n';
            output += 'define(\'DIR_STORAGE\', DIR_SYSTEM + \'storage/\');\n';
            output += 'define(\'DIR_LANGUAGE\', DIR_APPLICATION + \'language/\');\n';
            output += 'define(\'DIR_TEMPLATE\', DIR_APPLICATION + \'view/template/\');\n';
            output += 'define(\'DIR_CONFIG\', DIR_SYSTEM + \'config/\');\n';
            output += 'define(\'DIR_CACHE\', DIR_STORAGE + \'cache/\');\n';
            output += 'define(\'DIR_DOWNLOAD\', DIR_STORAGE + \'download/\');\n';
            output += 'define(\'DIR_LOGS\', DIR_STORAGE + \'logs/\');\n';
            output += 'define(\'DIR_SESSION\', DIR_STORAGE + \'session/\');\n';
            output += 'define(\'DIR_UPLOAD\', DIR_STORAGE + \'upload/\');\n\n';

            output += '// DB\n';
            output += 'define(\'DB_DRIVER\', \'' + this.addslashes(this.request.post['db_driver']) + '\');\n';
            output += 'define(\'DB_HOSTNAME\', \'' + this.addslashes(this.request.post['db_hostname']) + '\');\n';
            output += 'define(\'DB_USERNAME\', \'' + this.addslashes(this.request.post['db_username']) + '\');\n';
            output += 'define(\'DB_PASSWORD\', \'' + this.addslashes(this.html_entity_decode(this.request.post['db_password'])) + '\');\n';
            output += 'define(\'DB_DATABASE\', \'' + this.addslashes(this.request.post['db_database']) + '\');\n';
            output += 'define(\'DB_PORT\', \'' + this.addslashes(this.request.post['db_port']) + '\');\n';
            output += 'define(\'DB_PREFIX\', \'' + this.addslashes(this.request.post['db_prefix']) + '\');\n\n';

            output += '// OpenCart API\n';
            output += 'define(\'OPENCART_SERVER\', \'https://www.opencart.com/\');\n';

            fs.writeFileSync(DIR_OPENCART + 'admin/config.php', output);

            this.response.redirect(this.url.link('install/step_4', 'language=' + this.config.get('language_code')));
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

        const db_drivers = ['mysqli', 'pdo'];
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
        data['db_prefix'] = this.request.post['db_prefix'] || 'oc_';
        data['username'] = this.request.post['username'] || 'admin';
        data['password'] = this.request.post['password'] || '';
        data['email'] = this.request.post['email'] || '';

        data['back'] = this.url.link('install/step_2', 'language=' + this.config.get('language_code'));

        data['footer'] = this.load.controller('common/footer');
        data['header'] = this.load.controller('common/header');
        data['language'] = this.load.controller('common/language');

        this.response.setOutput(this.load.view('install/step_3', data));
    }

    validate() {
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

        const db_drivers = ['mysqli', 'pdo', 'pgsql'];

        if (!db_drivers.includes(this.request.post['db_driver'])) {
            this.error['db_driver'] = this.language.get('error_db_driver');
        } else {
            try {
                const db = new Opencart.System.Library.DB(this.request.post['db_driver'], this.html_entity_decode(this.request.post['db_hostname']), this.html_entity_decode(this.request.post['db_username']), this.html_entity_decode(this.request.post['db_password']), this.html_entity_decode(this.request.post['db_database']), this.request.post['db_port']);
            } catch (e) {
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

        if (!this.isWritable(DIR_OPENCART + 'config.php')) {
            this.error['warning'] = this.language.get('error_config') + DIR_OPENCART + 'config.php!';
        }

        if (!this.isWritable(DIR_OPENCART + 'admin/config.php')) {
            this.error['warning'] = this.language.get('error_config') + DIR_OPENCART + 'admin/config.php!';
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
        return true; // Placeholder
    }
}

