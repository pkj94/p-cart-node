<?php
namespace Opencart\Catalog\Controller\Common;
/**
 *
 *
 * @package Opencart\Catalog\Controller\Common
 */
class SearchController extends Controller {
	/**
	 * @return string
	 */
	async index(): string {
		$this->load->language('common/search');

		$data['text_search'] = $this->language->get('text_search');

		if (($this->request->get['search'])) {
			$data['search'] = $this->request->get['search'];
		} else {
			$data['search'] = '';
		}

		$data['language'] = $this->config->get('config_language');

		return $this->load->view('common/search', $data);
	}
}