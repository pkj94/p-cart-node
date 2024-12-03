module.exports = class ControllerMarketplaceExtension extends Controller {
	error = {};

	async index() {
		const data = {};
		await this.load.language('marketplace/extension');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'], true)
		});

		data['user_token'] = this.session.data['user_token'];

		if ((this.request.get['type'])) {
			data['type'] = this.request.get['type'];
		} else {
			data['type'] = '';
		}

		data['categories'] = [];

		let files = require('glob').sync(DIR_APPLICATION + 'controller/extension/extension/*.js');

		for (let file of files.sort()) {
			let extension = expressPath.basename(file, '.js');

			if (extension == 'promotion') {
				continue;
			}

			// Compatibility code for old extension folders
			await this.load.language('extension/extension/' + extension, 'extension');

			if (await this.user.hasPermission('access', 'extension/extension/' + extension)) {
				let files = require('glob').sync(DIR_APPLICATION + 'controller/extension/' + extension + '/*.js');

				data['categories'].push({
					'code': extension,
					'text': this.language.get('extension').get('heading_title') + ' (' + files.length + ')',
					'href': await this.url.link('extension/extension/' + extension, 'user_token=' + this.session.data['user_token'], true)
				});
			}
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('marketplace/extension', data));
	}

	async refreshMenu() {
		const output = await this.load.controller('common/column_left');
		this.response.setOutput(output);
	}
}
