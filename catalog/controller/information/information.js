module.exports = class Information extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('information/information');

		if ((this.request.get['information_id'])) {
			information_id = this.request.get['information_id'];
		} else {
			information_id = 0;
		}

		this.load.model('catalog/information', this);

		const information_info = await this.model_catalog_information.getInformation(information_id);

		if (information_info) {
			this.document.setTitle(information_info['meta_title']);
			this.document.setDescription(information_info['meta_description']);
			this.document.setKeywords(information_info['meta_keyword']);

			data['breadcrumbs'] = [];

			data['breadcrumbs'].push({
				'text': this.language.get('text_home'),
				'href': await this.url.link('common/home', 'language=' + this.config.get('config_language'))
			});

			data['breadcrumbs'].push({
				'text': information_info['title'],
				'href': await this.url.link('information/information', 'language=' + this.config.get('config_language') + '&information_id=' + information_id)
			});

			data['heading_title'] = information_info['title'];

			data['description'] = html_entity_decode(information_info['description']);

			data['continue'] = await this.url.link('common/home', 'language=' + this.config.get('config_language'));

			data['column_left'] = await this.load.controller('common/column_left');
			data['column_right'] = await this.load.controller('common/column_right');
			data['content_top'] = await this.load.controller('common/content_top');
			data['content_bottom'] = await this.load.controller('common/content_bottom');
			data['footer'] = await this.load.controller('common/footer');
			data['header'] = await this.load.controller('common/header');

			this.response.setOutput(await this.load.view('information/information', data));
		} else {
			return new global['\Opencart\System\Engine\Action']('error/not_found');
		}

		return null;
	}

	/**
	 * @return void
	 */
	async info() {
		if ((this.request.get['information_id'])) {
			information_id = this.request.get['information_id'];
		} else {
			information_id = 0;
		}

		this.load.model('catalog/information', this);

		const information_info = await this.model_catalog_information.getInformation(information_id);

		if (information_info) {
			data['title'] = information_info['title'];
			data['description'] = html_entity_decode(information_info['description']);

			this.response.addHeader('X-Robots-Tag: noindex');
			this.response.setOutput(await this.load.view('information/information_info', data));
		}
	}
}