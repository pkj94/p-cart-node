module.exports = class ControllerExtensionModuleInformation extends Controller {
	async index() {
const data = {};
		await this.load.language('extension/module/information');

		this.load.model('catalog/information',this);

		data['informations'] = [];

		for (let result of await this.model_catalog_information.getInformations()) {
			data['informations'].push(array(
				'title' : result['title'],
				'href'  : await this.url.link('information/information', 'information_id=' + result['information_id'])
			});
		}

		data['contact'] = await this.url.link('information/contact');
		data['sitemap'] = await this.url.link('information/sitemap');

		return await this.load.view('extension/module/information', data);
	}
}