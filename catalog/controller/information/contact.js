const nl2br = require("locutus/php/strings/nl2br");

module.exports = class ControllerInformationContact extends Controller {
	error = {};

	async index() {
		const data = {};
		await this.load.language('information/contact');

		this.document.setTitle(this.language.get('heading_title'));

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			const mail = new Mail(this.config.get('config_mail_engine'));
			mail.parameter = this.config.get('config_mail_parameter');
			mail.smtp_hostname = this.config.get('config_mail_smtp_hostname');
			mail.smtp_username = this.config.get('config_mail_smtp_username');
			mail.smtp_password = html_entity_decode(this.config.get('config_mail_smtp_password'));
			mail.smtp_port = this.config.get('config_mail_smtp_port');
			mail.smtp_timeout = this.config.get('config_mail_smtp_timeout');

			mail.setTo(this.config.get('config_email'));
			mail.setFrom(this.config.get('config_email'));
			mail.setReplyTo(this.request.post['email']);
			mail.setSender(html_entity_decode(this.request.post['name']));
			mail.setSubject(html_entity_decode(sprintf(this.language.get('email_subject'), this.request.post['name'])));
			mail.setText(this.request.post['enquiry']);
			await mail.send();

			this.response.setRedirect(await this.url.link('information/contact/success'));
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/home')
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('information/contact')
		});

		if ((this.error['name'])) {
			data['error_name'] = this.error['name'];
		} else {
			data['error_name'] = '';
		}

		if ((this.error['email'])) {
			data['error_email'] = this.error['email'];
		} else {
			data['error_email'] = '';
		}

		if ((this.error['enquiry'])) {
			data['error_enquiry'] = this.error['enquiry'];
		} else {
			data['error_enquiry'] = '';
		}

		data['button_submit'] = this.language.get('button_submit');

		data['action'] = await this.url.link('information/contact', '', true);

		this.load.model('tool/image', this);

		if (this.config.get('config_image')) {
			data['image'] = await this.model_tool_image.resize(this.config.get('config_image'), this.config.get('theme_' + this.config.get('config_theme') + '_image_location_width'), this.config.get('theme_' + this.config.get('config_theme') + '_image_location_height'));
		} else {
			data['image'] = false;
		}

		data['store'] = this.config.get('config_name');
		data['address'] = nl2br(this.config.get('config_address'));
		data['geocode'] = this.config.get('config_geocode');
		data['geocode_hl'] = this.config.get('config_language');
		data['telephone'] = this.config.get('config_telephone');
		data['fax'] = this.config.get('config_fax');
		data['open'] = nl2br(this.config.get('config_open'));
		data['comment'] = this.config.get('config_comment');

		data['locations'] = [];

		this.load.model('localisation/location', this);

		for (let location_id of (this.config.get('config_location') || [])) {
			const location_info = await this.model_localisation_location.getLocation(location_id);

			if (location_info.location_id) {
				let image = false;
				if (location_info['image']) {
					image = await this.model_tool_image.resize(location_info['image'], this.config.get('theme_' + this.config.get('config_theme') + '_image_location_width'), this.config.get('theme_' + this.config.get('config_theme') + '_image_location_height'));
				}

				data['locations'].push({
					'location_id': location_info['location_id'],
					'name': location_info['name'],
					'address': nl2br(location_info['address']),
					'geocode': location_info['geocode'],
					'telephone': location_info['telephone'],
					'fax': location_info['fax'],
					'image': image,
					'open': nl2br(location_info['open']),
					'comment': location_info['comment']
				});
			}
		}

		if ((this.request.post['name'])) {
			data['name'] = this.request.post['name'];
		} else {
			data['name'] = await this.customer.getFirstName();
		}

		if ((this.request.post['email'])) {
			data['email'] = this.request.post['email'];
		} else {
			data['email'] = await this.customer.getEmail();
		}

		if ((this.request.post['enquiry'])) {
			data['enquiry'] = this.request.post['enquiry'];
		} else {
			data['enquiry'] = '';
		}

		// Captcha
		if (Number(this.config.get('captcha_' + this.config.get('config_captcha') + '_status')) && this.config.get('config_captcha_page').includes('contact')) {
			data['captcha'] = await this.load.controller('extension/captcha/' + this.config.get('config_captcha'), this.error);
		} else {
			data['captcha'] = '';
		}

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.setOutput(await this.load.view('information/contact', data));
	}

	async validate() {
		if ((utf8_strlen(this.request.post['name']) < 3) || (utf8_strlen(this.request.post['name']) > 32)) {
			this.error['name'] = this.language.get('error_name');
		}

		if (!isEmailValid(this.request.post['email'])) {
			this.error['email'] = this.language.get('error_email');
		}

		if ((utf8_strlen(this.request.post['enquiry']) < 10) || (utf8_strlen(this.request.post['enquiry']) > 3000)) {
			this.error['enquiry'] = this.language.get('error_enquiry');
		}

		// Captcha
		if (Number(this.config.get('captcha_' + this.config.get('config_captcha') + '_status')) && this.config.get('config_captcha_page').includes('contact')) {
			const captcha = await this.load.controller('extension/captcha/' + this.config.get('config_captcha') + '/validate');

			if (captcha) {
				this.error['captcha'] = captcha;
			}
		}

		return !Object.keys(this.error).length;
	}

	async success() {
		await this.load.language('information/contact');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/home')
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('information/contact')
		});

		data['text_message'] = this.language.get('text_message');

		data['continue'] = await this.url.link('common/home');

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.setOutput(await this.load.view('common/success', data));
	}
}
