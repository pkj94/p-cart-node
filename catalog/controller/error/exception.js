module.exports = class Exception extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @param string message
	 * @param string code
	 * @param string file
	 * @param string line
	 *
	 * @return void
	 */
	async index(message, code, file, line) {
		await this.load.language('error/exception');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('error/exception', 'user_token=' + this.session.data['user_token'])
		});

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('error/exception', data));
	}
}