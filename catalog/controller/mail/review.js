<?php
namespace Opencart\Catalog\Controller\Mail;
/**
 * Class Review
 *
 * @package Opencart\Catalog\Controller\Mail
 */
class Review extends \Opencart\System\Engine\Controller {
	// catalog/model/catalog/review/addReview/after
	/**
	 * @param string $route
	 * @param array  $args
	 * @param mixed  $output
	 *
	 * @return void
	 * @throws \Exception
	 */
	public function index(string &$route, array &$args, mixed &$output): void {
		if (in_array('review', (array)$this->config->get('config_mail_alert'))) {
			$this->load->language('mail/review');

			$this->load->model('catalog/product');

			$product_info = $this->model_catalog_product->getProduct((int)$args[0]);

			if ($product_info) {
				$store_name = html_entity_decode($this->config->get('config_name'));

				$subject = sprintf($this->language->get('text_subject'), $store_name);

				$data['product'] = html_entity_decode($product_info['name']);
				$data['reviewer'] = html_entity_decode($args[1]['name']);
				$data['rating'] = (int)$args[1]['rating'];
				$data['text'] = nl2br($args[1]['text']);

				$data['store'] = $store_name;
				$data['store_url'] = $this->config->get('config_url');

				if ($this->config->get('config_mail_engine')) {
					$mail_option = [
						'parameter'     => $this->config->get('config_mail_parameter'),
						'smtp_hostname' => $this->config->get('config_mail_smtp_hostname'),
						'smtp_username' => $this->config->get('config_mail_smtp_username'),
						'smtp_password' => html_entity_decode($this->config->get('config_mail_smtp_password')),
						'smtp_port'     => $this->config->get('config_mail_smtp_port'),
						'smtp_timeout'  => $this->config->get('config_mail_smtp_timeout')
					];

					$mail = new MailLibrary($this->config->get('config_mail_engine'), $mail_option);
					$mail->setTo($this->config->get('config_email'));
					$mail->setFrom($this->config->get('config_email'));
					$mail->setSender($store_name);
					$mail->setSubject($subject);
					$mail->setHtml($this->load->view('mail/review', $data));
					$mail->send();

					// Send to additional alert emails
					$emails = explode(',', (string)$this->config->get('config_mail_alert_email'));

					foreach ($emails as $email) {
						if ($email && filter_var($email, FILTER_VALIDATE_EMAIL)) {
							$mail->setTo(trim($email));
							$mail->send();
						}
					}
				}
			}
		}
	}
}
