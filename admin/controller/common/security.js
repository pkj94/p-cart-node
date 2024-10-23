
const pathExpress = require('path');
module.exports = class SecurityController extends global['\Opencart\System\Engine\Controller'] {
    constructor(registry) {
        super(registry);
    }
    /**
     * @return string
     */
    async index() {
        const data = {};
        await  this.load.language('common/security');

        // Check install directory exists
        if (fs.existsSync(DIR_OPENCART + 'install/')) {
            data['install'] = DIR_OPENCART + 'install/';
        } else {
            data['install'] = '';
        }

        // Check storage directory exists
        if (DIR_STORAGE == DIR_SYSTEM + 'storage/') {
            // Check install directory exists
            data['storage'] = DIR_STORAGE;

            data['document_root'] = fs.realpathSync(this.request.server['DOCUMENT_ROOT'] + '/../').replaceAll('\\', '/') + '/';

            let path = '';

            data['paths'] = [];

            let parts = data['document_root'].replace(new RegExp('/' + "*"), '').split('/');
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
            return ''//await this.load.view('common/security', data);
        } else {
            return '';
        }
    }

    /**
     * @return void
     */
    async install() {
        await  this.load.language('common/security');

        const json = {};

        if (await  this.user.hasPermission('modify', 'common/security')) {
            if (!fs.existsSync(DIR_OPENCART + 'install/')) {
                json['error'] = this.language.get('error_install');
            }
        } else {
            json['error'] = this.language.get('error_permission');
        }

        if (!Object.keys(json).length) {
            let files = [];

            path = DIR_OPENCART + 'install/';

            // Make path into an array
            directory = [path];

            // While the path array is still populated keep looping through
            while (directory.length != 0) {
                let next = directory.shift();

                if (fs.existsSync(next)) {
                    for (let file of fs.readdirSync(next.replace(new RegExp('/' + "*"), ''))) {
                        // If directory add to path array
                        if (fs.lstatSync(next + file).isDirectory()) {
                            directory.push(next + file);
                        }

                        // Add the file to the files to be deleted array
                        files.push(file);
                    }
                }
            }

            files = files.reverse(files);

            for (let file of files) {
                if (fs.lstatSync(file).isFile()) {
                    fs.fs.unlinkSyncSync(file);
                } else if (fs.lstatSync(file).isFile()) {
                    fs.fs.rmdirSyncSync(file);
                }
            }

            fs.fs.rmdirSyncSync(path);

            json['success'] = this.language.get('text_install_success');
        }

        this.response.addHeader('Content-Type: application/json');
        this.response.setOutput(json);
    }

    /**
     * @return void
     */
    async storage() {
        await  this.load.language('common/security');
        let page = 1;
        if ((this.request.get['page'])) {
            page = Number(this.request.get['page']);
        }
        let name = '';
        if ((this.request.get['name'])) {
            name = pathExpress.basename(this.request.get['name'].trim()).replace(new RegExp('[^a-zA-z0-9_]'), '');
        }
        let path = '';
        if ((this.request.get['path'])) {
            path = this.request.get['path'].replace(new RegExp('[^a-zA-z0-9_]'), '');
        }

        const json = {};

        if (await  this.user.hasPermission('modify', 'common/security')) {
            let base_old = DIR_STORAGE;
            let base_new = path + name + '/';

            if (!fs.existsSync(base_old)) {
                json['error'] = this.language.get('error_storage');
            }

            root = fs.realpathSync(this.request.server['DOCUMENT_ROOT'] + '/../').replaceAll('\\', '/');

            if ((base_new.substring(0, strlen(root)) != root) || (root == base_new)) {
                json['error'] = this.language.get('error_storage');
            }

            if (fs.existsSync(base_new) && page < 2) {
                json['error'] = this.language.get('error_storage_exists');
            }

            if (!fs.existsSync(DIR_OPENCART + 'config.json') || !fs.existsSync(DIR_APPLICATION + 'config.json')) {
                json['error'] = this.language.get('error_writable');
            }
        } else {
            json['error'] = this.language.get('error_permission');
        }

        if (!json.error) {
            let files = [];

            // Make path into an array
            let directory = [base_old];

            // While the path array is still populated keep looping through
            while (directory.length != 0) {
                let next = directory.shift();

                for (let file of fs.readdirSync(next.replace(new RegExp('/' + "*"), ''))) {
                    // If directory add to path array
                    if (fs.lstatSync(file).isFile()) {
                        directory.push(file);
                    }

                    // Add the file to the files to be deleted array
                    files.push(file);
                }
            }

            // Create the new storage folder
            if (!fs.existsSync(base_new)) {
                fs.mkdirSync(base_new);
            }

            // Copy the
            let total = files.length;
            let limit = 200;

            let start = (page - 1) * limit;
            let end = start > (total - limit) ? total : (start + limit);

            for (let i = start; i < end; i++) {
                let destination = files[i].substring(base_old.length);

                if (fs.existsSync(base_old + destination) && !fs.existsSync(base_new + destination)) {
                    fs.mkdirSync(base_new + destination);
                }

                if (fs.lstatSync(base_old + destination).isFile() && !fs.lstatSync(base_new + destination).isFile()) {
                    fs.copyFileSync(base_old + destination, base_new + destination);
                }
            }

            if (end < total) {
                json['next'] = await this.url.link('common/security+storage', '&user_token=' + this.session.data['user_token'] + '&name=' + name + '&path=' + path + '&page=' + (page + 1), true);
            } else {
                // Start deleting old storage location files+
                files = files.reverse();

                for (let file of files) {
                    // If file just delete
                    if (fs.lstatSync(file).isFile()) {
                        fs.fs.unlinkSyncSync(file);
                    }

                    // If directory use the remove directory function
                    if (fs.lstatSync(file).isFile()) {
                        fs.fs.rmdirSyncSync(file);
                    }
                }

                fs.fs.rmdirSyncSync(base_old);

                // Modify the config files
                files = [
                    DIR_APPLICATION + 'config.json',
                    DIR_OPENCART + 'config.json'
                ];

                for (let file of files) {
                    let output = require(file);
                    let find = '';
                    for (let [key, value] of output) {
                        if (key == 'DIR_STORAGE')
                            find = value;
                        output[k] = value.replace(find, base_new);
                    }
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
        await  this.load.language('common/security');
        let page = 1;
        if ((this.request.get['page'])) {
            page = Number(this.request.get['page']);
        }
        let name = 'admin';
        if ((this.request.get['name'])) {
            name = pathExpress.basename(this.request.get['name'].trim()).replace(new RegExp('[^a-zA-z0-9]'), '');
        }

        const json = {};

        if (await  this.user.hasPermission('modify', 'common/security')) {
            let base_old = DIR_OPENCART + 'admin/';
            let base_new = DIR_OPENCART + name + '/';

            if (!fs.existsSync(base_old)) {
                json['error'] = this.language.get('error_admin');
            }

            if (fs.existsSync(base_new) && page < 2) {
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

        if (!json.error) {
            // 1+  // 1+ We need to copy the files, of rename cannot be used on any directory, the executing script is running under
            let files = [];

            // Make path into an array
            let directory = [base_old];

            // While the path array is still populated keep looping through
            while (directory.length != 0) {
                let next = directory.shift();

                for (let file of fs.readdirSync(next.replace(new RegExp('/' + "*"), ''))) {
                    // If directory add to path array
                    if (fs.lstatSync(file).isFile()) {
                        directory.push(file);
                    }

                    // Add the file to the files to be deleted array
                    files.push(file);
                }
            }

            // 2+ Create the new admin folder name
            if (!fs.existsSync(base_new)) {
                fs.mkdirSync(base_new);
            }

            // 3+ split the file copies into chunks+
            let total = files.length;
            let limit = 200;

            let start = (page - 1) * limit;
            let end = start > (total - limit) ? total : (start + limit);

            // 4+ Copy the files across
            for (let file of files.slice(start, end)) {
                let destination = file.substring(base_old.length);

                if (fs.existsSync(base_old + destination) && !fs.existsSync(base_new + destination)) {
                    fs.mkdirSync(base_new + destination);
                }

                if (fs.lstatSync(base_old + destination).isFile() && !fs.lstatSync(base_new + destination).isFile()) {
                    fs.copyFileSync(base_old + destination, base_new + destination);
                }
            }

            if ((page * limit) <= total) {
                json['next'] = await this.url.link('common/security+admin', '&user_token=' + this.session.data['user_token'] + '&name=' + name + '&page=' + (page + 1), true);
            } else {
                // Update the old config files
                let file = base_new + 'config.json';
                let output = require(file);
                output.HTTP_SERVER = output.HTTP_SERVER.replace('admin', name)
                output.DIR_OPENCART = output.DIR_OPENCART + name + '/'
                fs.writeFileSync(file, JSON.stringify(output, null, "\t"));

                // 6+ redirect to the new admin
                json['redirect'] = (HTTP_SERVER.substring(0, -6) + name + '?route=common/login').replace('&amp;', '&');
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

        if (fs.existsSync(path) && DIR_APPLICATION != path) {
            // 1+ We need to copy the files, of rename cannot be used on any directory, the executing script is running under
            let files = [];

            // Make path into an array
            let directory = [path];

            // While the path array is still populated keep looping through
            while (directory.length != 0) {
                let next = directory.shift();

                for (let file of fs.readdirSync(next.replace(new RegExp('/' + "*"), ''))) {
                    // If directory add to path array
                    if (fs.existsSync(file)) {
                        directory.push(file);
                    }

                    // Add the file to the files to be deleted array
                    files.push(file);
                }
            }

            // 4+ reverse file order
            files = files.reverse()

            // 5+ Delete the old admin directory
            for (let file of files) {
                // If file just delete
                if (fs.lstatSync(file).isFile()) {
                    fs.fs.unlinkSyncSync(file);
                }

                // If directory use the remove directory function
                if (fs.lstatSync(file).isFile()) {
                    fs.fs.rmdirSyncSync(file);
                }
            }

            fs.rmdirSync(path);
        }
    }
}