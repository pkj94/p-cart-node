const realpath = require("locutus/php/filesystem/realpath");
const explode = require("locutus/php/strings/explode");
const rtrim = require("locutus/php/strings/rtrim");
const str_replace = require("locutus/php/strings/str_replace");
const substr = require("locutus/php/strings/substr");

module.exports = class ControllerCommonSecurity extends Controller {
	async index() {
		const data = {};
		await this.load.language('common/security');

		data['text_instruction'] = this.language.get('text_instruction');

		data['user_token'] = this.session.data['user_token'];

		data['storage'] = DIR_SYSTEM + 'storage/';

		let path = '';

		data['paths'] = [];

		let parts = explode('/', str_replace('\\', '/', rtrim(DIR_SYSTEM, '/')));

		for (let part of parts) {
			path += part + '/';

			data['paths'].push(path);
		}

		data['paths'] = data['paths'].reverse();

		data['document_root'] = str_replace('\\', '/', realpath(__dirname + '..') + '/');

		return await this.load.view('common/security', data);
	}

	async move() {
		await this.load.language('common/security');

		const json = {};
		let path = '';
		if (this.request.post['path']) {
			path = this.request.post['path'];
		} else {
			path = '';
		}
		let directory = '';
		if (this.request.post['directory']) {
			directory = this.request.post['directory'];
		} else {
			directory = '';
		}

		if (!await this.user.hasPermission('modify', 'common/security')) {
			json['error'] = this.language.get('error_permission');
		} else {
			if (DIR_STORAGE != DIR_SYSTEM + 'storage/') {
				data['error'] = this.language.get('error_path');
			}

			if (!path || str_replace('\\', '/', realpath(path)) + '/' != str_replace('\\', '/', substr(DIR_SYSTEM, 0, path.length))) {
				json['error'] = this.language.get('error_path');
			}

			if (!directory || !/^[a-zA-Z0-9_-]+/g.test(directory)) {
				json['error'] = this.language.get('error_directory');
			}

			if (is_dir(path + directory)) {
				json['error'] = this.language.get('error_exists');
			}

			if (!fs.existsSync(realpath(DIR_APPLICATION + '/../') + '/config.js') || !fs.existsSync(DIR_APPLICATION + 'config.js')) {
				json['error'] = this.language.get('error_writable');
			}

			if (!json) {
				let files = [];

				// Make path into an array
				let source = [DIR_SYSTEM + 'storage/'];

				// While the path array is still populated keep looping through
				while (source.length != 0) {
					let next = source.shift();

					for (require('glob').sync(next) of file) {
						// If directory add to path array
						if (is_dir(file)) {
							source.push(file + '/*');
						}

						// Add the file to the files to be deleted array
						files.push(file);
					}
				}

				// Create the new storage folder
				if (!is_dir(path + directory)) {
					fs.mkdirSync(path + directory);
				}

				// Copy the 
				for (let file of files) {
					let destination = path + directory + substr(file, (DIR_SYSTEM + 'storage/').length);

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
					realpath(DIR_APPLICATION + '/../') + '/config.json'
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
