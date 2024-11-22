module.exports = class ControllerMarketplaceExtension extends Controller {
	error = {};

	async index() {
		await this.load.language('marketplace/extension');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'], true)
		});

		data['user_token'] = this.session.data['user_token'];

		if ((this.request.get['type'])) {
			data['type'] = this.request.get['type'];
		} else {
			data['type'] = '';
		}
		
		data['categories'] = {};
		
		files = glob(DIR_APPLICATION + 'controller/extension/extension/*.php', GLOB_BRACE);
		
		for (let file of files) {
			extension = basename(file, '.php');

			if (extension=='promotion') {
				continue;
			}

			// Compatibility code for old extension folders
			await this.load.language('extension/extension/' + extension, 'extension');
		
			if (await this.user.hasPermission('access', 'extension/extension/' + extension)) {
				files = glob(DIR_APPLICATION + 'controller/extension/' + extension + '/*.php', GLOB_BRACE);
		
				data['categories'].push({
					'code' : extension,
					'text' : this.language.get('extension').get('heading_title') + ' (' + count(files) .')',
					'href' : await this.url.link('extension/extension/' + extension, 'user_token=' + this.session.data['user_token'], true)
				});
			}
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('marketplace/extension', data));
	}

	async refreshMenu() {
		output = await this.load.controller('common/column_left');
		this.response.setOutput(output);
	}
}
