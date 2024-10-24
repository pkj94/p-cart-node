const nl2br = require("locutus/php/strings/nl2br");

module.exports = class UpgradeController extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('tool/upgrade');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('tool/upgrade', 'user_token=' + this.session.data['user_token'])
		});

		data['current_version'] = VERSION;
		data['upgrade'] = false;
		let response_info = {}
		try {
			const curl = await require("axios").get(OPENCART_SERVER + 'index.php?route=api/upgrade');
			response_info = curl.data;
		} catch (e) {

		}
		if (response_info) {
			data['latest_version'] = response_info['version'];
			data['date_added'] = date(this.language.get('date_format_short'), new Date(response_info['date_added']));
			data['log'] = nl2br(response_info['log']);

			if (VERSION < response_info['version']) {
				data['upgrade'] = true;
			}
		} else {
			data['latest_version'] = '';
			data['date_added'] = '';
			data['log'] = '';
		}
		// For testing
		//data['latest_version'] = 'master';

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('tool/upgrade', data));
	}

	/**
	 * @return void
	 */
	async download() {
		await this.load.language('tool/upgrade');

		const json = {};
		let version = '';
		if ((this.request.get['version'])) {
			version = this.request.get['version'];
		}

		if (!await this.user.hasPermission('modify', 'tool/upgrade')) {
			json['error'] = this.language.get('error_permission');
		}

		if (version_compare(version, VERSION, '<')) {
			json['error'] = this.language.get('error_version');
		}

		let file = DIR_DOWNLOAD + 'opencart-' + version + '.zip';

		curl = curl_init('https://github.com/opencart/opencart/archive/' + version + '.zip');

		curl_setopt(curl, CURLOPT_USERAGENT, 'OpenCart ' + VERSION);
		curl_setopt(curl, CURLOPT_FOLLOWLOCATION, 1);
		curl_setopt(curl, CURLOPT_FORBID_REUSE, 1);
		curl_setopt(curl, CURLOPT_FRESH_CONNECT, 1);
		curl_setopt(curl, CURLOPT_TIMEOUT, 300);
		curl_setopt(curl, CURLOPT_FILE, handle);

		curl_exec(curl);

		fclose(handle);

		status = curl_getinfo(curl, CURLINFO_HTTP_CODE);

		if (status != 200) {
			json['error'] = this.language.get('error_download');
		}

		curl_close(curl);

		if (!Object.keys(json).length) {
			json['text'] = this.language.get('text_install');

			json['next'] = await this.url.link('tool/upgrade.install', 'user_token=' + this.session.data['user_token'] + '&version=' + version, true);
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async install() {
		await this.load.language('tool/upgrade');

		const json = {};

		if ((this.request.get['version'])) {
			version = this.request.get['version'];
		} else {
			version = '';
		}

		if (!await this.user.hasPermission('modify', 'tool/upgrade')) {
			json['error'] = this.language.get('error_permission');
		}

		file = DIR_DOWNLOAD + 'opencart-' + version + '.zip';

		if (!fs.lstatSync(file).isFile()) {
			json['error'] = this.language.get('error_file');
		}

		if (!Object.keys(json).length) {
			// Unzip the files
			zip = new ZipArchive();

			if (zip.open(file, ZipArchive)) {
				remove = 'opencart-' + version + '/upload/';

				// Check if any of the files already exist.
				for (let i = 0; i < zip.numFiles; i++) {
					source = zip.getNameIndex(i);

					if (substr(source, 0, strlen(remove)) == remove) {
						// Only extract the contents of the upload folder
						destination = str_replace('\\', '/', substr(source, strlen(remove)));

						if (substr(destination, 0, 8) == 'install/') {
							// Default copy location
							path = '';

							// Must not have a path before files and directories can be moved
							directories = explode('/', dirname(destination));

							for (directories of directory) {
								if (!path) {
									path = directory;
								} else {
									path = path + '/' + directory;
								}

								if (!is_dir(DIR_OPENCART + path) && !mkdir(DIR_OPENCART + path)) {
									json['error'] = sprintf(this.language.get('error_directory'), path);
								}
							}

							// Check if the path is not directory and check there is no existing file
							if (substr(destination, -1) != '/') {
								if (is_file(DIR_OPENCART + destination)) {
									fs.unlinkSync(DIR_OPENCART + destination);
								}

								if (!copy('zip://' + file + '#' + source, DIR_OPENCART + destination)) {
									json['error'] = sprintf(this.language.get('error_copy'), source, destination);
								}
							}
						}
					}
				}

				zip.close();

				json['text'] = this.language.get('text_patch');

				json['next'] = HTTP_CATALOG + 'install/upgrade/upgrade_1&version=' + version + '&admin=' + rtrim(substr(DIR_APPLICATION, strlen(DIR_OPENCART), -1));
			} else {
				json['error'] = this.language.get('error_unzip');
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
