module.exports = class ControllerMailTransaction extends Controller {
	async index(route, args, output) {
		if ((args[0])) {
			customer_id = args[0];
		} else {
			customer_id = '';
		}
		
		if ((args[1])) {
			description = args[1];
		} else {
			description = '';
		}		
		
		if ((args[2])) {
			amount = args[2];
		} else {
			amount = '';
		}
		
		if ((args[3])) {
			order_id = args[3];
		} else {
			order_id = '';
		}
			
		this.load.model('customer/customer',this);
						
		customer_info = await this.model_customer_customer.getCustomer(customer_id);

		if (customer_info) {
			await this.load.language('mail/transaction');

			this.load.model('setting/store',this);

			store_info = await this.model_setting_store.getStore(customer_info['store_id']);

			if (store_info) {
				store_name = store_info['name'];
			} else {
				store_name = this.config.get('config_name');
			}

			data['text_received'] = sprintf(this.language.get('text_received'), this.currency.format(amount, this.config.get('config_currency')));
			data['text_total'] = sprintf(this.language.get('text_total'), this.currency.format(await this.model_customer_customer.getTransactionTotal(customer_id), this.config.get('config_currency')));
			
			mail = new Mail(this.config.get('config_mail_engine'));
			mail.parameter = this.config.get('config_mail_parameter');
			mail.smtp_hostname = this.config.get('config_mail_smtp_hostname');
			mail.smtp_username = this.config.get('config_mail_smtp_username');
			mail.smtp_password = html_entity_decode(this.config.get('config_mail_smtp_password'));
			mail.smtp_port = this.config.get('config_mail_smtp_port');
			mail.smtp_timeout = this.config.get('config_mail_smtp_timeout');

			mail.setTo(customer_info['email']);
			mail.setFrom(this.config.get('config_email'));
			mail.setSender(html_entity_decode(store_name));
			mail.setSubject(sprintf(this.language.get('text_subject'), html_entity_decode(this.config.get('config_name'))));
			mail.setText(await this.load.view('mail/transaction', data));
			mail.send();
		}
	}		
}	
