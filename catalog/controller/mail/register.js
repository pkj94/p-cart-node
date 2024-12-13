module.exports = class ControllerMailRegister extends Controller {
	async index(&route, &args, &output) {
		await this.load.language('mail/register');

		data['text_welcome'] = sprintf(this.language.get('text_welcome'), html_entity_decode(this.config.get('config_name')));
		data['text_login'] = this.language.get('text_login');
		data['text_approval'] = this.language.get('text_approval');
		data['text_service'] = this.language.get('text_service');
		data['text_thanks'] = this.language.get('text_thanks');

		this.load.model('account/customer_group',this);
			
		if ((args[0]['customer_group_id'])) {
			customer_group_id = args[0]['customer_group_id'];
		} else {
			customer_group_id = this.config.get('config_customer_group_id');
		}
					
		customer_group_info = await this.model_account_customer_group.getCustomerGroup(customer_group_id);
		
		if (customer_group_info) {
			data['approval'] = customer_group_info['approval'];
		} else {
			data['approval'] = '';
		}
			
		data['login'] = await this.url.link('account/login', '', true);		
		data['store'] = html_entity_decode(this.config.get('config_name'));

		const mail = new Mail(this.config.get('config_mail_engine'));
		mail.parameter = this.config.get('config_mail_parameter');
		mail.smtp_hostname = this.config.get('config_mail_smtp_hostname');
		mail.smtp_username = this.config.get('config_mail_smtp_username');
		mail.smtp_password = html_entity_decode(this.config.get('config_mail_smtp_password'));
		mail.smtp_port = this.config.get('config_mail_smtp_port');
		mail.smtp_timeout = this.config.get('config_mail_smtp_timeout');

		mail.setTo(args[0]['email']);
		mail.setFrom(this.config.get('config_email'));
		mail.setSender(html_entity_decode(this.config.get('config_name')));
		mail.setSubject(sprintf(this.language.get('text_subject'), html_entity_decode(this.config.get('config_name'))));
		mail.setText(await this.load.view('mail/register', data));
		await mail.send(); 
	}
	
	async alert(&route, &args, &output) {
		// Send to main admin email if new account email is enabled
		if (in_array('account', this.config.get('config_mail_alert'))) {
			await this.load.language('mail/register');
			
			data['text_signup'] = this.language.get('text_signup');
			data['text_firstname'] = this.language.get('text_firstname');
			data['text_lastname'] = this.language.get('text_lastname');
			data['text_customer_group'] = this.language.get('text_customer_group');
			data['text_email'] = this.language.get('text_email');
			data['text_telephone'] = this.language.get('text_telephone');
			
			data['firstname'] = args[0]['firstname'];
			data['lastname'] = args[0]['lastname'];
			
			this.load.model('account/customer_group',this);
			
			if ((args[0]['customer_group_id'])) {
				customer_group_id = args[0]['customer_group_id'];
			} else {
				customer_group_id = this.config.get('config_customer_group_id');
			}
			
			customer_group_info = await this.model_account_customer_group.getCustomerGroup(customer_group_id);
			
			if (customer_group_info) {
				data['customer_group'] = customer_group_info['name'];
			} else {
				data['customer_group'] = '';
			}
			
			data['email'] = args[0]['email'];
			data['telephone'] = args[0]['telephone'];

			const mail = new Mail(this.config.get('config_mail_engine'));
			mail.parameter = this.config.get('config_mail_parameter');
			mail.smtp_hostname = this.config.get('config_mail_smtp_hostname');
			mail.smtp_username = this.config.get('config_mail_smtp_username');
			mail.smtp_password = html_entity_decode(this.config.get('config_mail_smtp_password'));
			mail.smtp_port = this.config.get('config_mail_smtp_port');
			mail.smtp_timeout = this.config.get('config_mail_smtp_timeout');

			mail.setTo(this.config.get('config_email'));
			mail.setFrom(this.config.get('config_email'));
			mail.setSender(html_entity_decode(this.config.get('config_name')));
			mail.setSubject(html_entity_decode(this.language.get('text_new_customer')));
			mail.setText(await this.load.view('mail/register_alert', data));
			await mail.send();

			// Send to additional alert emails if new account email is enabled
			emails = this.config.get('config_mail_alert_email').split(',');

			for (emails of email) {
				if (utf8_strlen(email) > 0 && filter_var(email, FILTER_VALIDATE_EMAIL)) {
					mail.setTo(email);
					await mail.send();
				}
			}
		}	
	}
}		