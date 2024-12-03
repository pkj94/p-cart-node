const str_replace = require('locutus/php/strings/str_replace');

module.exports = class ControllerMarketplaceInstaller extends Controller {
	async index() {
		const data = {};
		await this.load.language('marketplace/installer');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('marketplace/installer', 'user_token=' + this.session.data['user_token'], true)
		});

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('marketplace/installer', data));
	}

	async history() {
		const data = {};
		await this.load.language('marketplace/installer');
		let page = 1;
		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		}

		data['histories'] = [];

		this.load.model('setting/extension', this);

		const results = await this.model_setting_extension.getExtensionInstalls((page - 1) * 10, 10);

		for (let result of results) {
			data['histories'].push({
				'extension_install_id': result['extension_install_id'],
				'filename': result['filename'],
				'date_added': date(this.language.get('date_format_short'), strtotime(result['date_added']))
			});
		}

		const history_total = await this.model_setting_extension.getTotalExtensionInstalls();

		const pagination = new Pagination();
		pagination.total = history_total;
		pagination.page = page;
		pagination.limit = 10;
		pagination.url = await this.url.link('marketplace/installer/history', 'user_token=' + this.session.data['user_token'] + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (history_total) ? ((page - 1) * 10) + 1 : 0, (((page - 1) * 10) > (history_total - 10)) ? history_total : (((page - 1) * 10) + 10), history_total, Math.ceil(history_total / 10));

		this.response.setOutput(await this.load.view('marketplace/installer_history', data));
	}

	async upload() {
		await this.load.language('marketplace/installer');

		const json = {};

		// Check user has permission
		if (!await this.user.hasPermission('modify', 'marketplace/installer')) {
			json['error'] = this.language.get('error_permission');
		}

		// Check if there is a install zip already there
		let files = require('glob').sync(DIR_UPLOAD + '*.tmp');

		for (let file of files) {
			if (is_file(file) && (fs.statSync(file).ctime < (Date.now() - 5000))) {
				fs.unlinkSync(file);
			}

			if (is_file(file)) {
				json['error'] = this.language.get('error_install');

				break;
			}
		}

		// Check for any install directories
		let directories = require('glob').sync(DIR_UPLOAD + 'tmp-*');

		for (let directory of directories) {
			if (is_dir(directory) && (fs.statSync(directory).ctime < (Date.now() - 5000))) {
				// Get a list of files ready to upload
				let files = [];

				let path = [directory];

				while (path.length != 0) {
					let next = path.shift();

					// We have to use scandir function because glob will not pick up dot files.
					for (let file of fs.readdirSync(next)) {
						file = next + '/' + file;

						if (is_dir(file)) {
							path.push(file);
						}

						files.push(file);
					}
				}

				files = files.reverse();

				for (let file of files) {
					if (is_file(file)) {
						fs.unlinkSync(file);
					} else if (is_dir(file)) {
						fs.rmdirSync(file);
					}
				}

				fs.rmdirSync(directory);
			}

			if (is_dir(directory)) {
				json['error'] = this.language.get('error_install');

				break;
			}
		}

		if ((this.request.files['file']['name'])) {
			if (this.request.files['file']['name'].substr( -10) != '.ocmod.zip') {
				json['error'] = this.language.get('error_filetype');
			}

			// if (this.request.files['file']['error'] != UPLOAD_ERR_OK) {
			// 	json['error'] = this.language.get('error_upload_' + this.request.files['file']['error']);
			// }
		} else {
			json['error'] = this.language.get('error_upload');
		}

		if (!json) {
			this.session.data['install'] = oc_token(10);

			let file = DIR_UPLOAD + this.session.data['install'] + '.tmp';
			try{
				await uploadFile(this.request.files['file'], file);

			}catch(e){
				json['error'] = this.language.get('error_upload_' + this.request.files['file']['error']);
			}

			if (is_file(file)) {
				this.load.model('setting/extension', this);

				extension_install_id = await this.model_setting_extension.addExtensionInstall(this.request.files['file']['name']);

				json['text'] = this.language.get('text_install');

				json['next'] = str_replace('&amp;', '&', await this.url.link('marketplace/install/install', 'user_token=' + this.session.data['user_token'] + '&extension_install_id=' + extension_install_id, true));
			} else {
				json['error'] = this.language.get('error_file');
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}