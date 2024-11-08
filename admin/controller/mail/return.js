module.exports = class ControllerMailReturn extends Controller {
	async index(route, args, output) {
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
			this.load.model('sale/return');
			
			return_info = await this.model_sale_return.getReturn(return_id);
			
			if (return_info) {
				await this.load.language('mail/return');

				data['return_id'] = return_id;
				data['date_added'] = date(this.language.get('date_format_short'), strtotime(return_info['date_modified']));
				data['return_status'] = return_info['return_status'];
				data['comment'] = strip_tags(html_entity_decode(comment));

				mail = new Mail(this.config.get('config_mail_engine'));
				mail.parameter = this.config.get('config_mail_parameter');
				mail.smtp_hostname = this.config.get('config_mail_smtp_hostname');
				mail.smtp_username = this.config.get('config_mail_smtp_username');
				mail.smtp_password = html_entity_decode(this.config.get('config_mail_smtp_password'));
				mail.smtp_port = this.config.get('config_mail_smtp_port');
				mail.smtp_timeout = this.config.get('config_mail_smtp_timeout');

				mail.setTo(return_info['email']);
				mail.setFrom(this.config.get('config_email'));
				mail.setSender(html_entity_decode(this.config.get('config_name')));
				mail.setSubject(sprintf(this.language.get('text_subject'), html_entity_decode(this.config.get('config_name')), return_id));
				mail.setText(await this.load.view('mail/return', data));
				mail.send();
			}
		}
	}
}	