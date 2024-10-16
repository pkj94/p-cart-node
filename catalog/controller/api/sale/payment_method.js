<?php
namespace Opencart\Catalog\Controller\Api\Sale;
/**
 *
 *
 * @package Opencart\Catalog\Controller\Api\Sale
 */
class PaymentMethodController extends Controller {
	/**
	 * @return void
	 */
	async index(): void {
		$this->load->language('api/sale/payment_method');

		$json = [];

		if (!$this->cart->hasProducts() && empty($this->session->data['vouchers'])) {
			$json['error'] = $this->language->get('error_product');
		}

		if ($this->config->get('config_checkout_payment_address') && !($this->session->data['payment_address'])) {
			$json['error'] = $this->language->get('error_payment_address');
		}

		if (!$json) {
			$payment_address = [];

			if (($this->session->data['payment_address'])) {
				$payment_address = $this->session->data['payment_address'];
			} elseif ($this->config->get('config_checkout_shipping_address') && ($this->session->data['shipping_address'])) {
				$payment_address = $this->session->data['shipping_address'];
			}

			$this->load->model('checkout/payment_method');

			$payment_methods = $this->model_checkout_payment_method->getMethods($payment_address);

			if ($payment_methods) {
				$json['payment_methods'] = $this->session->data['payment_methods'] = $payment_methods;
			} else {
				$json['error'] = $this->language->get('error_no_payment');
			}
		}

		$this->response->addHeader('Content-Type: application/json');
		$this->response->setOutput(json_encode($json));
	}

	/**
	 * @return void
	 */
	async save(): void {
		$this->load->language('api/sale/payment_method');

		$json = [];

		// Payment Address
		if ($this->config->get('config_checkout_payment_address') && !($this->session->data['payment_address'])) {
			$json['error'] = $this->language->get('error_payment_address');
		}

		// Payment Method
		if (($this->request->post['payment_method']) && ($this->session->data['payment_methods'])) {
			$payment = explode('.', $this->request->post['payment_method']);

			if (!($payment[0]) || !($payment[1]) || !($this->session->data['payment_methods'][$payment[0]]['option'][$payment[1]])) {
				$json['error'] = $this->language->get('error_payment_method');
			}
		} else {
			$json['error'] = $this->language->get('error_payment_method');
		}

		if (!$json) {
			$this->session->data['payment_method'] = $this->session->data['payment_methods'][$payment[0]]['option'][$payment[1]];

			$json['success'] = $this->language->get('text_success');
		}

		$this->response->addHeader('Content-Type: application/json');
		$this->response->setOutput(json_encode($json));
	}
}
