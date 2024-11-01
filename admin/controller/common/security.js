const html_entity_decode = require("locutus/php/strings/html_entity_decode");
const rtrim = require("locutus/php/strings/rtrim");
const trim = require("locutus/php/strings/trim");

module.exports = class Security extends global['\Opencart\System\Engine\Controller'] {
    /**
     * @return string
     */
    async index() {
        const data = [];
        await this.load.language('common/security');

        // Check install directory exists
        if (is_dir(DIR_OPENCART + 'install/')) {
            data['install'] = DIR_OPENCART + 'install/';
        } else {
            data['install'] = '';
        }

        // Check storage directory exists
        if (DIR_STORAGE == DIR_SYSTEM + 'storage/') {
            // Check install directory exists
            data['storage'] = DIR_STORAGE;

            data['document_root'] = fs.realpathSync(APPROOT + '/../').replaceAll('\\', '/') + '/';

            let path = '';

            data['paths'] = [];

            let parts = rtrim(data['document_root'], '/').split('/');

            for (let part of parts) {
                path += part + '/';

                data['paths'].push(path);
            }

            data['paths'] = data['paths'].reverse();
        } else {
            data['storage'] = '';
        }

        // Check admin directory ia renamed
        if (DIR_APPLICATION == DIR_OPENCART + 'admin/') {
            data['admin'] = 'admin';
        } else {
            data['admin'] = '';
        }

        data['user_token'] = this.session.data['user_token'];

        if (data['install'] || data['storage'] || data['admin']) {
            return await this.load.view('common/security', data);
        } else {
            return '';
        }
    }

    /**
     * @return void
     */
    async install() {
        await this.load.language('common/security');

        const json = {};

        if (await this.user.hasPermission('modify', 'common/security')) {
            if (!is_dir(DIR_OPENCART + 'install/')) {
                json['error'] = this.language.get('error_install');
            }
        } else {
            json['error'] = this.language.get('error_permission');
        }

        if (!Object.keys(json).length) {
            let files = [];

            let path = DIR_OPENCART + 'install/';

            // Make path into an array
            let directory = [path];

            // While the path array is still populated keep looping through
            while (directory.length != 0) {
                let next = directory.shift();

                if (is_dir(next)) {
                    // console.log('next', next, is_dir(next))
                    for (let file of require('glob').sync(rtrim(next, '/') + '/{*,.[!.]*,..?*}')) {
                        // console.log(fs.realpathSync(file), is_dir(file))
                        // If directory add to path array
                        if (is_dir(file)) {
                            directory.push(fs.realpathSync(file));
                        }

                        // Add the file to the files to be deleted array
                        files.push(fs.realpathSync(file));
                    }
                }
            }

            files = files.reverse();
            console.log(files, directory)
            for (let file of files) {
                if (is_file(file)) {
                    fs.unlinkSync(file);
                } else if (is_dir(file)) {
                    fs.rmdirSync(file);
                }
            }

            fs.rmdirSync(path);

            json['success'] = this.language.get('text_install_success');
        }

        this.response.addHeader('Content-Type: application/json');
        this.response.setOutput(json);
    }

    /**
     * @return void
     */
    async storage() {
        await this.load.language('common/security');
        let page = 1;
        if ((this.request.get['page'])) {
            page = this.request.get['page'];
        }
        let name = '';
        if ((this.request.get['name'])) {
            name = expressPath.basename(html_entity_decode(trim(this.request.get['name']))).replace(/[^a-zA-Z0-9_]/g, '');
        }
        let path = '';
        if ((this.request.get['path'])) {
            path = html_entity_decode(trim(this.request.get['path'])).replace(/[^a-zA-Z0-9_:\//]/g, '');
        }

        const json = {};
        let base_old = DIR_STORAGE;
        let base_new = path + name + '/';
        if (await this.user.hasPermission('modify', 'common/security')) {

            if (!is_dir(base_old)) {
                json['error'] = this.language.get('error_storage');
            }
            let root = expressPath.resolve(APPROOT, '..').replace(/\\/g, '/');

            if ((base_new.substring(0, root.length) !== root) || (root === base_new)) {
                json.error = this.language.get('error_storage');
            }

            if (is_dir(base_new) && page < 2) {
                json['error'] = this.language.get('error_storage_exists');
            }
            if (!fs.existsSync(DIR_OPENCART + 'config.json') || !fs.existsSync(DIR_APPLICATION + 'config.json')) {
                json['error'] = this.language.get('error_writable');
            }
        } else {
            json['error'] = this.language.get('error_permission');
        }

        if (!Object.keys(json).length) {
            let files = [];

            // Make path into an array
            let directory = [base_old];

            // While the path array is still populated keep looping through
            while (directory.length != 0) {
                let next = directory.shift();

                for (let file of require('glob').sync(rtrim(next, '/') + '/{*,.[!.]*,..?*}')) {
                    // If directory add to path array
                    if (is_dir(file)) {
                        directory.push(file);
                    }

                    // Add the file to the files to be deleted array
                    files.push(file);
                }
            }

            // Create the new storage folder
            if (!is_dir(base_new)) {
                fs.mkdirSync(base_new);
            }

            // Copy the
            let total = files.length;
            let limit = 200;

            let start = (page - 1) * limit;
            let end = start > (total - limit) ? total : (start + limit);

            for (let i = start; i < end; i++) {
                let destination = files[i].substring(base_old.length);

                if (is_dir(base_old + destination) && !is_dir(base_new + destination)) {
                    fs.mkdirSync(base_new + destination);
                }

                if (is_file(base_old + destination) && !is_file(base_new + destination)) {
                    fs.copyFileSync(base_old + destination, base_new + destination);
                }
            }

            if (end < total) {
                json['next'] = await this.url.link('common/security.storage', '&user_token=' + this.session.data['user_token'] + '&name=' + name + '&path=' + path + '&page=' + (page + 1), true);
            } else {
                // Start deleting old storage location files.
                files = files.reverse();

                for (let file of files) {
                    // If file just delete
                    if (is_file(file)) {
                        fs.unlinkSync(file);
                    }

                    // If directory use the remove directory function
                    if (is_dir(file)) {
                        fs.rmdirSync(file);
                    }
                }

                fs.rmdirSync(base_old);

                // Modify the config files
                files = [
                    DIR_APPLICATION + 'config.json',
                    DIR_OPENCART + 'config.json'
                ];

                for (let file of files) {

                    let output = require(file);
                    output.DIR_STORAGE = base_new;
                    output.DIR_CACHE = base_new + 'cache/';
                    output.DIR_DOWNLOAD = base_new + 'download/';
                    output.DIR_LOGS = base_new + 'logs/';
                    output.DIR_SESSION = base_new + 'session/';
                    output.DIR_UPLOAD = base_new + 'upload/';

                    fs.writeFileSync(file, JSON.stringify(output, null, "\t"));
                }

                json['success'] = this.language.get('text_storage_success');
            }
        }

        this.response.addHeader('Content-Type: application/json');
        this.response.setOutput(json);
    }

    /**
     * @return void
     */
    async admin() {
        await this.load.language('common/security');
        let page = 1;
        if ((this.request.get['page'])) {
            page = this.request.get['page'];
        }
        let name = 'admin';
        if ((this.request.get['name'])) {
            name = expressPath.basename(html_entity_decode(trim(this.request.get['name']))).replace(/[^a-zA-Z0-9_]/g, '');
        }

        const json = {};

        if (await this.user.hasPermission('modify', 'common/security')) {
            let base_old = DIR_OPENCART + 'admin/';
            let base_new = DIR_OPENCART + name + '/';

            if (!is_dir(base_old)) {
                json['error'] = this.language.get('error_admin');
            }

            if (is_dir(base_new) && page < 2) {
                json['error'] = this.language.get('error_admin_exists');
            }

            if (name == 'admin') {
                json['error'] = this.language.get('error_admin_name');
            }

            if (!fs.existsSync(DIR_OPENCART + 'config.json') || !fs.existsSync(DIR_APPLICATION + 'config.json')) {
                json['error'] = this.language.get('error_writable');
            }
        } else {
            json['error'] = this.language.get('error_permission');
        }

        if (!Object.keys(json).length) {
            // 1.  // 1. We need to copy the files, as rename cannot be used on any directory, the executing script is running under
            let files = [];

            // Make path into an array
            let directory = [base_old];

            // While the path array is still populated keep looping through
            while (directory.length != 0) {
                next = directory.shift();

                for (let file of require('glob').sync(rtrim(next, '/') + '/{*,.[!.]*,..?*}')) {
                    // If directory add to path array
                    if (is_dir(file)) {
                        directory.push(file);
                    }

                    // Add the file to the files to be deleted array
                    files.push(file);
                }
            }

            // 2. Create the new admin folder name
            if (!is_dir(base_new)) {
                fs.mkdirSync(base_new);
            }

            // 3. split the file copies into chunks+
            let total = files.length;
            let limit = 200;

            let start = (page - 1) * limit;
            let end = start > (total - limit) ? total : (start + limit);

            // 4. Copy the files across
            for (let file of files.slice(start, end)) {
                let destination = file.substring(base_old.length);

                if (is_dir(base_old + destination) && !is_dir(base_new + destination)) {
                    fs.mkdirSync(base_new + destination);
                }

                if (is_file(base_old + destination) && !is_file(base_new + destination)) {
                    fs.copyFileSync(base_old + destination, base_new + destination);
                }
            }

            if ((page * limit) <= total) {
                json['next'] = await this.url.link('common/security+admin', '&user_token=' + this.session.data['user_token'] + '&name=' + name + '&page=' + (page + 1), true);
            } else {
                // Update the old config files
                let file = base_new + 'config.json';


                let output = require(file);
                output.HTTP_SERVER = HTTP_SERVER.substring(0, HTTP_SERVER.indexOf('/admin/')) + '/' + name + '/';
                output.DIR_APPLICATION = DIR_OPENCART + name + '/';

                fs.writeFileSync(file, JSON.stringify(output, null, "\t"));

                // 6. redirect to the new admin
                json['redirect'] = HTTP_SERVER.substring(0, -6) + name + '/?route=common/login'.replaceAll('&amp;', '&');
            }
        }

        this.response.addHeader('Content-Type: application/json');
        this.response.setOutput(json);
    }

    /**
     *
     */
    async __destruct() {
        // Remove old admin if exists
        let path = DIR_OPENCART + 'admin/';

        if (is_dir(path) && DIR_APPLICATION != path) {
            // 1. We need to copy the files, as rename cannot be used on any directory, the executing script is running under
            let files = [];

            // Make path into an array
            let directory = [path];

            // While the path array is still populated keep looping through
            while (directory.length != 0) {
                next = directory.shift();

                for (let file of require('glob')(rtrim(next, '/') + '/{*,.[!.]*,..?*}')) {
                    // If directory add to path array
                    if (is_dir(file)) {
                        directory.push(file);
                    }

                    // Add the file to the files to be deleted array
                    files.push(file);
                }
            }

            // 4. reverse file order
            files = files.reverse();

            // 5+ Delete the old admin directory
            for (let file of files) {
                // If file just delete
                if (is_file(file)) {
                    fs.unlinkSync(file);
                }

                // If directory use the remove directory function
                if (is_dir(file)) {
                    fs.rmdirSync(file);
                }
            }

            fs.rmdirSync(path);
        }
    }
}