<?php
namespace Opencart\Catalog\Controller\Api\Localisation;
/**
 *
 *
 * @package Opencart\Catalog\Controller\Api\Localisation
 */
class CurrencyController extends Controller {
	/**
	 * @return void
	 */
	async index(): void {
		this->load->language('api/localisation/currency');

		json = [];

		if ((this->request->post['currency'])) {
			currency = (string)this->request->post['currency'];
		} else {
			currency = '';
		}

		this->load->model('localisation/currency');

		currency_info = this->model_localisation_currency->getCurrencyByCode(currency);

		if (!currency_info) {
			json['error'] = this->language->get('error_currency');
		}

		if (!json) {
			this->session->data['currency'] = currency;

			json['success'] = this->language->get('text_success');
		}

		this->response->addHeader('Content-Type: application/json');
		this->response->setOutput(json_encode(json));
	}
}
