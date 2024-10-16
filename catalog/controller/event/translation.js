<?php
namespace Opencart\Catalog\Controller\Event;
/**
 *
 *
 * @package Opencart\Catalog\Controller\Event
 */
class TranslationController extends Controller {
	/**
	 * @param string route
	 * @param string prefix
	 *
	 * @return void
	 */
	async index(string &route, string &prefix): void {
		this->load->model('design/translation');

		results = this->model_design_translation->getTranslations(route);

		foreach (results as result) {
			if (!prefix) {
				this->language->set(result['key'], html_entity_decode(result['value']));
			} else {
				this->language->set(prefix . '_' . result['key'], html_entity_decode(result['value']));
			}
		}	
	}
}
