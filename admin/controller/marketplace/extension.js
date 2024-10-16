const fs = require('fs');
const expressPath = require('path');
module.exports = class ExtensionController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('marketplace/extension');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'])
		});

		if ((this.request.get['type'])) {
			data['type'] = this.request.get['type'];
		} else {
			data['type'] = '';
		}

		data['categories'] = [];

		this.load.model('setting/extension', this);

		let files = fs.readdirSync(DIR_APPLICATION + 'controller/extension/').filter(a => a.indexOf('.js') >= 0);
		for (let file of files) {
			let extension = expressPath.basename(file).replace('.js','');
			await this.load.language('extension/' + extension, extension);

			if (await this.user.hasPermission('access', 'extension/' + extension)) {
				let extensions = await this.model_setting_extension.getPaths('%/admin/controller/' + extension + '/%.js');

				data['categories'].push({
					'code': extension,
					'text': this.language.get(extension + '_heading_title') + ' (' + extensions.length + ')',
					'href': await this.url.link('extension/' + extension, 'user_token=' + this.session.data['user_token'])
				});
			}
		}

		if ((this.request.get['type'])) {
			data['extension'] = await this.load.controller('extension/' + expressPath.basename(this.request.get['type']) + '.getList');
		} else if (data['categories']) {
			data['extension'] = await this.load.controller('extension/' + data['categories'][0]['code'] + '.getList');
		} else {
			data['extension'] = '';
		}

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('marketplace/extension', data));
	}
}