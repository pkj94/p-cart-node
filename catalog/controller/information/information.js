module.exports = class ControllerInformationInformation extends Controller {
	async index() {
		const data = {};
		await this.load.language('information/information');

		this.load.model('catalog/information', this);

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/home')
		});
		let information_id = 0;
		if ((this.request.get['information_id'])) {
			information_id = this.request.get['information_id'];
		}

		const information_info = await this.model_catalog_information.getInformation(information_id);

		if (information_info.information_id) {
			this.document.setTitle(information_info['meta_title']);
			this.document.setDescription(information_info['meta_description']);
			this.document.setKeywords(information_info['meta_keyword']);

			data['breadcrumbs'].push({
				'text': information_info['title'],
				'href': await this.url.link('information/information', 'information_id=' + information_id)
			});

			data['heading_title'] = information_info['title'];

			data['description'] = html_entity_decode(information_info['description']);

			data['continue'] = await this.url.link('common/home');

			data['column_left'] = await this.load.controller('common/column_left');
			data['column_right'] = await this.load.controller('common/column_right');
			data['content_top'] = await this.load.controller('common/content_top');
			data['content_bottom'] = await this.load.controller('common/content_bottom');
			data['footer'] = await this.load.controller('common/footer');
			data['header'] = await this.load.controller('common/header');

			this.response.setOutput(await this.load.view('information/information', data));
		} else {
			data['breadcrumbs'].push({
				'text': this.language.get('text_error'),
				'href': await this.url.link('information/information', 'information_id=' + information_id)
			});

			this.document.setTitle(this.language.get('text_error'));

			data['heading_title'] = this.language.get('text_error');

			data['text_error'] = this.language.get('text_error');

			data['continue'] = await this.url.link('common/home');

			this.response.addHeader(this.request.server.protocol + ' 404 Not Found');

			data['column_left'] = await this.load.controller('common/column_left');
			data['column_right'] = await this.load.controller('common/column_right');
			data['content_top'] = await this.load.controller('common/content_top');
			data['content_bottom'] = await this.load.controller('common/content_bottom');
			data['footer'] = await this.load.controller('common/footer');
			data['header'] = await this.load.controller('common/header');

			this.response.setOutput(await this.load.view('error/not_found', data));
		}
	}

	async agree() {
		this.load.model('catalog/information', this);
		let information_id = 0;
		if ((this.request.get['information_id'])) {
			information_id = this.request.get['information_id'];
		}

		let output = '';

		const information_info = await this.model_catalog_information.getInformation(information_id);

		if (information_info.information_id) {
			output += html_entity_decode(information_info['description']) + "\n";
		}

		this.response.addHeader('X-Robots-Tag: noindex');

		this.response.setOutput(output);
	}
}
