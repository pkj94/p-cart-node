const htmlspecialchars = require("locutus/php/strings/htmlspecialchars");

module.exports = class ControllerToolLog extends Controller {
	error = {};

	async index() {
		const data = {};
		await this.load.language('tool/log');

		this.document.setTitle(this.language.get('heading_title'));

		if ((this.session.data['error'])) {
			data['error_warning'] = this.session.data['error'];

			delete this.session.data['error'];
		} else if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.session.data['success'])) {
			data['success'] = this.session.data['success'];

			delete this.session.data['success'];
		} else {
			data['success'] = '';
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('tool/log', 'user_token=' + this.session.data['user_token'], true)
		});

		data['download'] = await this.url.link('tool/log/download', 'user_token=' + this.session.data['user_token'], true);
		data['clear'] = await this.url.link('tool/log/clear', 'user_token=' + this.session.data['user_token'], true);

		data['log'] = '';

		let file = DIR_LOGS + this.config.get('config_error_filename');

		if (is_file(file)) {
			let size = fs.statSync(file).size;

			if (size >= 5242880) {
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

				let i = 0;

				while ((size / 1024) > 1) {
					size = size / 1024;
					i++;
				}

				data['error_warning'] = sprintf(this.language.get('error_warning'), expressPath.basename(file), Math.round(size.toString().substr(0, size.indexOf('.') + 4), 2) + suffix[i]);
			} else {
				data['log'] = htmlspecialchars(fs.readFileSync(file,'utf-8'));
			}
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');
		await this.session.save(this.session.data);
		this.response.setOutput(await this.load.view('tool/log', data));
	}

	async download() {
		await this.load.language('tool/log');

		let file = DIR_LOGS + this.config.get('config_error_filename');

		if (is_file(file) && fs.statSync(file).size > 0) {
			this.response.addHeader('Pragma: public');
			this.response.addHeader('Expires: 0');
			this.response.addHeader('Content-Description: File Transfer');
			this.response.addHeader('Content-Type: application/octet-stream');
			this.response.addHeader('Content-Disposition: attachment; filename="' + this.config.get('config_name') + '_' + date('Y-m-d_H-i-s', time()) + '_error.log"');
			this.response.addHeader('Content-Transfer-Encoding: binary');

			this.response.setFile(file);
		} else {
			this.session.data['error'] = sprintf(this.language.get('error_warning'), expressPath.basename(file), '0B');
			await this.session.save(this.session.data);

			this.response.setRedirect(await this.url.link('tool/log', 'user_token=' + this.session.data['user_token'], true));
		}
	}

	async clear() {
		await this.load.language('tool/log');

		if (!await this.user.hasPermission('modify', 'tool/log')) {
			this.session.data['error'] = this.language.get('error_permission');
		} else {
			let file = DIR_LOGS + this.config.get('config_error_filename');
			fs.writeFileSync(file, '');
			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);
		}

		this.response.setRedirect(await this.url.link('tool/log', 'user_token=' + this.session.data['user_token'], true));
	}
}