<?php
namespace Opencart\Catalog\Model\Checkout;
/**
 *
 *
 * @package Opencart\Catalog\Model\Checkout
 */
class ShippingMethodController extends Controller {
	/**
	 * @param array shipping_address
	 *
	 * @return array
	 */
	async getMethods(array shipping_address): array {
		method_data = [];

		this->load->model('setting/extension');

		results = this->model_setting_extension->getExtensionsByType('shipping');

		foreach (results as result) {
			if (this->config->get('shipping_' . result['code'] . '_status')) {
				this->load->model('extension/' . result['extension'] . '/shipping/' . result['code']);

				quote = this->{'model_extension_' . result['extension'] . '_shipping_' . result['code']}->getQuote(shipping_address);

				if (quote) {
					method_data[result['code']] = quote;
				}
			}
		}

		sort_order = [];

		foreach (method_data as key => value) {
			sort_order[key] = value['sort_order'];
		}

		method_data= multiSort(method_data,sort_order,'ASC');

		return method_data;
	}
}
