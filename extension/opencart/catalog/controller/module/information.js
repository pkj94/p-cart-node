<?php
namespace Opencart\Catalog\Controller\Extension\Opencart\Module;
/**
 * Class Information
 *
 * @package
 */
class InformationController extends Controller {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @return string
	 */
	async index() {
		this.load.language('extension/opencart/module/information');

		this.load.model('catalog/information',this);

		data['informations'] = [];

		foreach (this.model_catalog_information.getInformations() as result) {
			data['informations'].push({
				'title' : result['title'],
				'href'  : this.url.link('information/information', 'language=' . this.config.get('config_language') . '&information_id=' . result['information_id'])
			];
		}

		data['contact'] = this.url.link('information/contact', 'language=' . this.config.get('config_language'));
		data['sitemap'] = this.url.link('information/sitemap', 'language=' . this.config.get('config_language'));

		return await this.load.view('extension/opencart/module/information', data);
	}
}