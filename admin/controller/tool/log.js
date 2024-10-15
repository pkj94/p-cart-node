const fs = require('fs');
const sprintf = require('locutus/php/strings/sprintf');
const expressPath = require('path');
module.exports = class LogController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('tool/log');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': this.url.link('tool/log', 'user_token=' + this.session.data['user_token'])
		});

		if ((this.session.data['error'])) {
			data['error_warning'] = this.session.data['error'];

			delete (this.session.data['error']);
		} else {
			data['error_warning'] = '';
		}

		let file = DIR_LOGS + this.config.get('config_error_filename');

		if (!fs.lstatSync(file).isFile()) {
			fs.appendFileSync(file, '');
		}


		data['logs'] = [];

		let files = fs.globSync(DIR_LOGS + '*.log');

		for (let file of files) {
			let error = '';

			let filename = expressPath.basename(file);

			let size = fs.lstatSync(file).size;

			if (size >= 3145728) {
				let suffix = [
					'B',
					'KB',
					'MB',
					'GB',
					'TB',
					'PB',
					'EB',
					'ZB',
					'YB'
				];

				i = 0;

				while ((size / 1024) > 1) {
					size = size / 1024;
					i++;
				}
				const roundedSize = Math.round(parseFloat(size.toString().substring(0, size.toString().indexOf('.') + 4)) * 100);
				error = sprintf(this.language.get('error_size'), filename, roundedSize.toString() + suffix[i]);
			}
			const handle = fs.openSync(file, 'r+');
			data['logs'].push({
				'name': filename,
				'output': fs.readFileSync(handle, { encoding: 'utf8', length: 3145728 }),
				'download': this.url.link('tool/log.download', 'user_token=' + this.session.data['user_token'] + '&filename=' + filename),
				'clear': this.url.link('tool/log.clear', 'user_token=' + this.session.data['user_token'] + '&filename=' + filename),
				'error': error
			});
			fs.closeSync(handle);
		}

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('tool/log', data));
	}

	/**
	 * @return void
	 */
	async download() {
		await this.load.language('tool/log');
		let filename = '';
		if ((this.request.get['filename'])) {
			filename = expressPath.basename(this.request.get['filename']);
		}

		let file = DIR_LOGS + filename;

		if (!fs.lstatSync(file).isFile()) {
			this.session.data['error'] = sprintf(this.language.get('error_file'), filename);

			this.response.setRedirect(this.url.link('tool/log', 'user_token=' + this.session.data['user_token'], true));
		}

		if (!fs.lstatSync(file).size) {
			this.session.data['error'] = sprintf(this.language.get('error_!'), filename);

			this.response.setRedirect(this.url.link('tool/log', 'user_token=' + this.session.data['user_token'], true));
		}
		this.response.headers = [];
		this.response.addHeader('Pragma: public');
		this.response.addHeader('Expires: 0');
		this.response.addHeader('Content-Description: File Transfer');
		this.response.addHeader('Content-Type: application/octet-stream');
		this.response.addHeader('Content-Disposition: attachment; filename="' + this.config.get('config_name') + '_' + date('Y-m-d_H-i-s', time()) + '_error.log"');
		this.response.addHeader('Content-Transfer-Encoding: binary');

		this.response.setFile(file);
	}

	/**
	 * @return void
	 */
	async clear() {
		await this.load.language('tool/log');
		let filename = '';
		if ((this.request.get['filename'])) {
			filename = this.request.get['filename'];
		}

		const json = {};

		if (!await this.user.hasPermission('modify', 'tool/log')) {
			json['error'] = this.language.get('error_permission');
		}

		let file = DIR_LOGS + filename;

		if (!fs.lstatSync(file).isFile()) {
			json['error'] = sprintf(this.language.get('error_file'), filename);
		}

		if (!Object.keys(json).length) {
			let handle = fs.openSync(file, 'w+');

			fs.closeSync(handle);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}