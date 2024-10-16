<?php
namespace Opencart\Catalog\Controller\Mail;
/**
 *
 *
 * @package Opencart\Catalog\Controller\Mail
 */
class ForgottenController extends Controller {
	// catalog/model/account/customer/editCode/after
	/**
	 * @param string route
	 * @param array  args
	 * @param mixed  output
	 *
	 * @return void
	 * @throws \Exception
	 */
	async index(string &route, array &args, mixed &output): void {
		if (args[0] && args[1]) {
			this->load->model('account/customer');

			customer_info = this->model_account_customer->getCustomerByEmail(args[0]);

			if (customer_info) {
				this->load->language('mail/forgotten');

				store_name = html_entity_decode(this->config->get('config_name'));

				subject = sprintf(this->language->get('text_subject'), store_name);

				data['text_greeting'] = sprintf(this->language->get('text_greeting'), store_name);

				data['reset'] = this->url->link('account/forgotten.reset', 'language=' . this->config->get('config_language') . '&email=' . encodeURIComponent(args[0]) . '&code=' . args[1], true);
				data['ip'] = this->request->server['REMOTE_ADDR'];

				data['store'] = store_name;
				data['store_url'] = this->config->get('config_url');

				if (this->config->get('config_mail_engine')) {
					mail_option = [
						'parameter'     => this->config->get('config_mail_parameter'),
						'smtp_hostname' => this->config->get('config_mail_smtp_hostname'),
						'smtp_username' => this->config->get('config_mail_smtp_username'),
						'smtp_password' => html_entity_decode(this->config->get('config_mail_smtp_password')),
						'smtp_port'     => this->config->get('config_mail_smtp_port'),
						'smtp_timeout'  => this->config->get('config_mail_smtp_timeout')
					];

					mail = new MailLibrary(this->config->get('config_mail_engine'), mail_option);
					mail->setTo(args[0]);
					mail->setFrom(this->config->get('config_email'));
					mail->setSender(store_name);
					mail->setSubject(subject);
					mail->setHtml(this->load->view('mail/forgotten', data));
					mail->send();
				}
			}
		}
	}
}
