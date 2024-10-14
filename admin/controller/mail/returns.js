module.exports=class ReturnsController extends Controller {
	/**
	 * @param string route
	 * @param array  args
	 * @param mixed  output
	 *
	 * @return void
	 * @throws \Exception
	 */
	async index(string &route, array &args, mixed &output) {
		if ((args[0])) {
			return_id = args[0];
		} else {
			return_id = '';
		}

		if ((args[1])) {
			return_status_id = args[1];
		} else {
			return_status_id = '';
		}

		if ((args[2])) {
			comment = args[2];
		} else {
			comment = '';
		}

		if ((args[3])) {
			notify = args[3];
		} else {
			notify = '';
		}

		if (notify) {
			this.load.model('sale/returns',this);

			const return_info = await this.model_sale_returns.getReturn(return_id);

			if (return_info) {
				this.load.model('sale/order',this);

				const order_info = await this.model_sale_order.getOrder(return_info['order_id']);

				if (order_info) {
					store_name = html_entity_decode(order_info['store_name']);
					store_url = order_info['store_url'];
				} else {
					store_name = html_entity_decode(this.config.get('config_name'));
					store_url = HTTP_CATALOG;
				}

				this.load.model('localisation/language',this);
				
				const language_info = await this.model_localisation_language.getLanguage(return_info['language_id']);

				if (language_info) {
					language_code = language_info['code'];
				} else {
					language_code = this.config.get('config_language');
				}

				await this.load.language('default', 'mail', language_code);
				await this.load.language('mail/returns', 'mail', language_code);

				let subject = sprintf(this.language.get('mail_text_subject'), store_name, return_id);

				data['return_id'] = return_id;
				data['date_added'] = date(this.language.get('date_format_short'), new Date(return_info['date_modified']));
				data['return_status'] = return_info['return_status'];
				data['comment'] = nl2br(comment);

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

					mail = new MailLibrary(this.config.get('config_mail_engine'), mail_option);
					mail.setTo(return_info['email']);
					mail.setFrom(this.config.get('config_email'));
					mail.setSender(store_name);
					mail.setSubject(subject);
					mail.setHtml(await this.load.view('mail/returns', data));
					mail.send();
				}
			}
		}
	}
}
