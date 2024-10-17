module.exports = class InformationController extends Controller {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @return string
	 */
	async index() {
		const data = {};
		await this.load.language('extension/opencart/module/information');

		this.load.model('catalog/information', this);

		data['informations'] = [];

		for (let result of await this.model_catalog_information.getInformations()) {
			data['informations'].push({
				'title': result['title'],
				'href': await this.url.link('information/information', 'language=' + this.config.get('config_language') + '&information_id=' + result['information_id'])
			});
		}

		data['contact'] = await this.url.link('information/contact', 'language=' + this.config.get('config_language'));
		data['sitemap'] = await this.url.link('information/sitemap', 'language=' + this.config.get('config_language'));

		return await this.load.view('extension/opencart/module/information', data);
	}
}