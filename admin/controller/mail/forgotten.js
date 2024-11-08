module.exports = class ControllerMailForgotten extends Controller {
	async index(&route, &args, &output) {			            
		await this.load.language('mail/forgotten');
		
		data['text_greeting'] = sprintf(this.language.get('text_greeting'), html_entity_decode(this.config.get('config_name')));
		
		data['reset'] = str_replace('&amp;', '&', await this.url.link('common/reset', 'code=' + args[1], true));
		data['ip'] = this.request.server['REMOTE_ADDR'];
		
		mail = new Mail(this.config.get('config_mail_engine'));
		mail.parameter = this.config.get('config_mail_parameter');
		mail.smtp_hostname = this.config.get('config_mail_smtp_hostname');
		mail.smtp_username = this.config.get('config_mail_smtp_username');
		mail.smtp_password = html_entity_decode(this.config.get('config_mail_smtp_password'));
		mail.smtp_port = this.config.get('config_mail_smtp_port');
		mail.smtp_timeout = this.config.get('config_mail_smtp_timeout');

		mail.setTo(args[0]);
		mail.setFrom(this.config.get('config_email'));
		mail.setSender(html_entity_decode(this.config.get('config_name')));
		mail.setSubject(html_entity_decode(sprintf(this.language.get('text_subject'), html_entity_decode(this.config.get('config_name')))));
		mail.setText(await this.load.view('mail/forgotten', data));
		mail.send();
	}
}
