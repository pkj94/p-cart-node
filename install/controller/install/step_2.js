

module.exports = class ControllerInstallStep2 extends Controller {
    error = {};

    async index() {
        const data = {};
        await this.load.language('install/step_2');
        if ((this.request.server['method'] == 'POST') && this.validate()) {
            this.response.setRedirect(await this.url.link('install/step_3'));
        }

        this.document.setTitle(this.language.get('heading_title'));

        data['heading_title'] = this.language.get('heading_title');

        data['text_step_2'] = this.language.get('text_step_2');
        data['text_install_js'] = this.language.get('text_install_js');
        data['text_install_extension'] = this.language.get('text_install_extension');
        data['text_install_file'] = this.language.get('text_install_file');
        data['text_install_directory'] = this.language.get('text_install_directory');
        data['text_setting'] = this.language.get('text_setting');
        data['text_current'] = this.language.get('text_current');
        data['text_required'] = this.language.get('text_required');
        data['text_extension'] = this.language.get('text_extension');
        data['text_file'] = this.language.get('text_file');
        data['text_directory'] = this.language.get('text_directory');
        data['text_status'] = this.language.get('text_status');
        data['text_on'] = this.language.get('text_on');
        data['text_off'] = this.language.get('text_off');
        data['text_missing'] = this.language.get('text_missing');
        data['text_writable'] = this.language.get('text_writable');
        data['text_unwritable'] = this.language.get('text_unwritable');
        data['text_version'] = this.language.get('text_version');
        data['text_db'] = this.language.get('text_db');


        data['button_continue'] = this.language.get('button_continue');
        data['button_back'] = this.language.get('button_back');

        if (this.error['warning']) {
            data['error_warning'] = this.error['warning'];
        } else {
            data['error_warning'] = '';
        }

        data['action'] = await this.url.link('install/step_2');

        // catalog config
        if (!is_file(DIR_OPENCART + 'config.json')) {
            data['error_catalog_config'] = this.language.get('error_missing');
        } else {
            data['error_catalog_config'] = '';
        }

        // admin configs
        if (!is_file(DIR_OPENCART + 'admin/config.json')) {
            data['error_admin_config'] = this.language.get('error_missing');
        } else {
            data['error_admin_config'] = '';
        }

        if (!is_dir(DIR_OPENCART + 'image/')) {
            data['error_image'] = this.language.get('error_unwritable');
        } else {
            data['error_image'] = '';
        }

        if (!is_dir(DIR_OPENCART + 'image/cache/')) {
            data['error_image_cache'] = this.language.get('error_unwritable');
        } else {
            data['error_image_cache'] = '';
        }

        if (!is_dir(DIR_OPENCART + 'image/catalog/')) {
            data['error_image_catalog'] = this.language.get('error_unwritable');
        } else {
            data['error_image_catalog'] = '';
        }

        if (!is_dir(DIR_SYSTEM + 'storage/cache/')) {
            data['error_cache'] = this.language.get('error_unwritable');
        } else {
            data['error_cache'] = '';
        }

        if (!is_dir(DIR_SYSTEM + 'storage/logs/')) {
            data['error_logs'] = this.language.get('error_unwritable');
        } else {
            data['error_logs'] = '';
        }

        if (!is_dir(DIR_SYSTEM + 'storage/download/')) {
            data['error_download'] = this.language.get('error_unwritable');
        } else {
            data['error_download'] = '';
        }

        if (!is_dir(DIR_SYSTEM + 'storage/upload/')) {
            data['error_upload'] = this.language.get('error_unwritable');
        } else {
            data['error_upload'] = '';
        }

        if (!is_dir(DIR_SYSTEM + 'storage/modification/')) {
            data['error_modification'] = this.language.get('error_unwritable');
        } else {
            data['error_modification'] = '';
        }

        data['node_version'] = process.version;


        let db = [
            'mysqli',
            'pgsql',
            'pdo'
        ];


        data['db'] = true;

        data['catalog_config'] = DIR_OPENCART + 'config.json';
        data['admin_config'] = DIR_OPENCART + 'admin/config.json';
        data['image'] = DIR_OPENCART + 'image';
        data['image_cache'] = DIR_OPENCART + 'image/cache';
        data['image_catalog'] = DIR_OPENCART + 'image/catalog';
        data['cache'] = DIR_SYSTEM + 'storage/cache';
        data['logs'] = DIR_SYSTEM + 'storage/logs';
        data['download'] = DIR_SYSTEM + 'storage/download';
        data['upload'] = DIR_SYSTEM + 'storage/upload';
        data['modification'] = DIR_SYSTEM + 'storage/modification';

        data['back'] = await this.url.link('install/step_1');

        data['footer'] = this.load.controller('common/footer');
        data['header'] = this.load.controller('common/header');
        data['column_left'] = this.load.controller('common/column_left');

        this.response.setOutput(this.load.view('install/step_2', data));
    }

    validate() {
        if (process.version < '18') {
            this.error['warning'] = this.language.get('error_version');
        }

        if (!fs.existsSync(DIR_OPENCART + 'config.json')) {
            this.error['warning'] = this.language.get('error_catalog_exist');
        }

        if (!fs.existsSync(DIR_OPENCART + 'admin/config.json')) {
            this.error['warning'] = this.language.get('error_admin_exist');
        }

        if (!is_dir(DIR_OPENCART + 'image')) {
            this.error['warning'] = this.language.get('error_image');
        }

        if (!is_dir(DIR_OPENCART + 'image/cache')) {
            this.error['warning'] = this.language.get('error_image_cache');
        }

        if (!is_dir(DIR_OPENCART + 'image/catalog')) {
            this.error['warning'] = this.language.get('error_image_catalog');
        }

        if (!is_dir(DIR_SYSTEM + 'storage/cache')) {
            this.error['warning'] = this.language.get('error_cache');
        }

        if (!is_dir(DIR_SYSTEM + 'storage/logs')) {
            this.error['warning'] = this.language.get('error_log');
        }

        if (!is_dir(DIR_SYSTEM + 'storage/download')) {
            this.error['warning'] = this.language.get('error_download');
        }

        if (!is_dir(DIR_SYSTEM + 'storage/upload')) {
            this.error['warning'] = this.language.get('error_upload');
        }

        if (!is_dir(DIR_SYSTEM + 'storage/modification')) {
            this.error['warning'] = this.language.get('error_modification');
        }

        return Object.keys(this.error);
    }
}
