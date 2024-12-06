const rtrim = require("locutus/php/strings/rtrim");

module.exports = class ControllerCommonSecurity extends Controller {
	async index() {
		const data = {};
		await this.load.language('common/security');

		data['text_instruction'] = this.language.get('text_instruction');

		data['user_token'] = this.session.data['user_token'];

		data['storage'] = DIR_SYSTEM + 'storage/';

		let path = '';

		data['paths'] = [];

		let parts = rtrim(DIR_SYSTEM, '/').replaceAll('\\', '/').split('/');

		for (let part of parts) {
			path += part + '/';

			data['paths'].push(path);
		}

		data['paths'] = data['paths'].reverse();
		const documentRoot = expressPath.resolve(DIR_OPENCART, '..'); // Adjust __dirname to your context 
		let document_root = documentRoot.replace(/\\/g, '/');
		if (!document_root.endsWith('/')) { document_root += '/'; }
		data['document_root'] = document_root;

		return await this.load.view('common/security', data);
	}

	async move() {
		await this.load.language('common/security');

		const json = {};
		let path = '';
		if (this.request.post['path']) {
			path = this.request.post['path'];
		}
		let directory = '';
		if (this.request.post['directory']) {
			directory = this.request.post['directory'];
		}

		if (!await this.user.hasPermission('modify', 'common/security')) {
			json['error'] = this.language.get('error_permission');
		} else {
			if (DIR_STORAGE != DIR_SYSTEM + 'storage/') {
				json['error'] = this.language.get('error_path');
			}

			if (!path || fs.realpathSync(path).replaceAll('\\', '/') + '/' != DIR_SYSTEM.substr(0, path.length).replaceAll('\\', '/')) {
				json['error'] = this.language.get('error_path');
			}

			if (!directory || !/^[a-zA-Z0-9_-]+/g.test(directory)) {
				json['error'] = this.language.get('error_directory');
			}

			if (is_dir(path + directory)) {
				json['error'] = this.language.get('error_exists');
			}
			if (!fs.existsSync(fs.realpathSync(DIR_APPLICATION + '/../') + '/config.json') || !fs.existsSync(DIR_APPLICATION + 'config.json')) {
				json['error'] = this.language.get('error_writable');
			}

			if (!json.error) {
				let files = [];

				// Make path into an array
				let source = [DIR_SYSTEM + 'storage/'];

				// While the path array is still populated keep looping through
				while (source.length != 0) {
					let next = source.shift();

					for (let file of require('glob').sync(next)) {
						// If directory add to path array
						if (is_dir(file)) {
							source.push(file + '/*');
						}

						// Add the file to the files to be deleted array
						files.push((DIR_OPENCART + file).replaceAll('\\', '/'));
					}
				}

				// Create the new storage folder
				if (!is_dir(path + directory)) {
					fs.mkdirSync(path + directory);
				}

				// Copy the 
				for (let file of files) {
					let destination = path + '/' + directory + '/' + file.substr((DIR_SYSTEM + 'storage/').length);
					if (is_dir(file) && !is_dir(destination)) {
						fs.mkdirSync(destination);
					}

					if (is_file(file)) {
						fs.copyFileSync(file, destination);
					}
				}

				// Modify the config files
				files = [
					DIR_APPLICATION + 'config.json',
					fs.realpathSync(DIR_APPLICATION + '/../') + '/config.json'
				];

				for (let file of files) {
					let output = require(file);
					output.DIR_STORAGE = path + directory + '/';
					fs.writeFileSync(file, JSON.stringify(output, null, "\t"));
				}

				json['success'] = this.language.get('text_success');
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
