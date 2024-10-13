<?php
namespace Opencart\Admin\Controller\Mail;
/**
 * 
 *
 * @package Opencart\Admin\Controller\Mail
 */
class RewardController extends Controller {
	/**
	 * @param string route
	 * @param array  args
	 * @param mixed  output
	 *
	 * @return void
	 * @throws \Exception
	 */
	async index(string route, array args, mixed output) {
		if ((args[0])) {
			customer_id = args[0];
		} else {
			customer_id = 0;
		}

		if ((args[1])) {
			description = args[1];
		} else {
			description = '';
		}

		if ((args[2])) {
			points = args[2];
		} else {
			points = 0;
		}

		if ((args[3])) {
			order_id = args[3];
		} else {
			order_id = 0;
		}

		this.load.model('customer/customer',this);

		const customer_info = await this.model_customer_customer.getCustomer(customer_id);

		if (customer_info) {
			await this.load.language('mail/reward');

			this.load.model('setting/store',this);

			const store_info = await this.model_setting_store.getStore(customer_info['store_id']);

			if (store_info && store_info.store_id) {
				store_name = html_entity_decode(store_info['name']);
				store_url = store_info['url'];
			} else {
				store_name = html_entity_decode(this.config.get('config_name'));
				store_url = HTTP_CATALOG;
			}

			this.load.model('localisation/language',this);

			language_info await this.model_localisation_language.getLanguage(customer_info['language_id']);

			if (language_info) {
				language_code = language_info['code'];
			} else {
				language_code = this.config.get('config_language');
			}

			await this.load.language('default', 'mail', language_code);
			await this.load.language('mail/reward', 'mail', language_code);

			subject = sprintf(this.language.get('mail_text_subject'), store_name);

			data['text_received'] = sprintf(this.language.get('mail_text_received'), points);
			data['text_total'] = sprintf(this.language.get('mail_text_total'), this.model_customer_customer.getRewardTotal(customer_id));

			data['store'] = store_name;
			data['store_url'] = store_url;

			if (this.config.get('config_mail_engine')) {
				mail_option = [
					'parameter'     : this.config.get('config_mail_parameter'),
					'smtp_hostname' : this.config.get('config_mail_smtp_hostname'),
					'smtp_username' : this.config.get('config_mail_smtp_username'),
					'smtp_password' : html_entity_decode(this.config.get('config_mail_smtp_password')),
					'smtp_port'     : this.config.get('config_mail_smtp_port'),
					'smtp_timeout'  : this.config.get('config_mail_smtp_timeout')
				];

				mail = new \Opencart\System\Library\Mail(this.config.get('config_mail_engine'), mail_option);
				mail.setTo(customer_info['email']);
				mail.setFrom(this.config.get('config_email'));
				mail.setSender(store_name);
				mail.setSubject(subject);
				mail.setHtml(await this.load.view('mail/reward', data));
				mail.send();
			}
		}
	}
}
