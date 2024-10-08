<?php
namespace Opencart\Catalog\Model\Checkout;
/**
 * Class PaymentMethod
 *
 * @package Opencart\Catalog\Model\Checkout
 */
class PaymentMethod extends \Opencart\System\Engine\Controller {
	/**
	 * @param array $payment_address
	 *
	 * @return array
	 */
	public function getMethods(array $payment_address = []): array {
		$method_data = [];

		$this->load->model('setting/extension');

		$results = $this->model_setting_extension->getExtensionsByType('payment');

		foreach ($results as $result) {
			if ($this->config->get('payment_' . $result['code'] . '_status')) {
				$this->load->model('extension/' . $result['extension'] . '/payment/' . $result['code']);

				$payment_methods = $this->{'model_extension_' . $result['extension'] . '_payment_' . $result['code']}->getMethods($payment_address);

				if ($payment_methods) {
					$method_data[$result['code']] = $payment_methods;
				}
			}
		}

		$sort_order = [];

		foreach ($method_data as $key => $value) {
			$sort_order[$key] = $value['sort_order'];
		}

		$method_data= multiSort($method_data,$sort_order,'ASC');

		return $method_data;
	}
}