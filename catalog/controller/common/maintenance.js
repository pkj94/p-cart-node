module.exports = class Maintenance extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('common/maintenance');

		this.document.setTitle(this.language.get('heading_title'));

		if (this.request.server['protocol'].toLowerCase() == 'http') {
			this.response.setStatus(503);
		} else {
			this.response.setStatus(503);
		}

		this.response.addHeader('Retry-After: 3600');

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_maintenance'),
			'href': await this.url.link('common/maintenance', 'language=' + this.config.get('config_language'))
		});

		data['message'] = this.language.get('text_message');

		data['header'] = await this.load.controller('common/header');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('common/maintenance', data));
	}
}
