module.exports = class Home extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		this.document.setTitle(this.config.get('config_meta_title'));
		this.document.setDescription(this.config.get('config_meta_description'));
		this.document.setKeywords(this.config.get('config_meta_keyword'));
		
		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.setOutput(await this.load.view('common/home', data));
	}
}