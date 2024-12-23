const nl2br = require("locutus/php/strings/nl2br");

module.exports = class Contact extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('information/contact');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/home', 'language=' + this.config.get('config_language'))
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('information/contact', 'language=' + this.config.get('config_language'))
		});

		data['send'] = await this.url.link('information/contact+send', 'language=' + this.config.get('config_language'));

		this.load.model('tool/image', this);

		if (this.config.get('config_image')) {
			data['image'] = await this.model_tool_image.resize(html_entity_decode(this.config.get('config_image')), this.config.get('config_image_location_width'), this.config.get('config_image_location_height'));
		} else {
			data['image'] = false;
		}

		data['store'] = this.config.get('config_name');
		data['address'] = nl2br(this.config.get('config_address'));
		data['geocode'] = this.config.get('config_geocode');
		data['geocode_hl'] = this.config.get('config_language');
		data['telephone'] = this.config.get('config_telephone');
		data['open'] = nl2br(this.config.get('config_open'));
		data['comment'] = nl2br(this.config.get('config_comment'));

		data['locations'] = [];

		this.load.model('localisation/location', this);
		if (this.config.get('config_location'))
			for (let location_id of this.config.get('config_location')) {
				const location_info = await this.model_localisation_location.getLocation(location_id);

				if (location_info.location_id) {
					let image = '';
					if (location_info['image'] && is_file(DIR_IMAGE + html_entity_decode(location_info['image']))) {
						image = await this.model_tool_image.resize(html_entity_decode(location_info['image']), this.config.get('config_image_location_width'), this.config.get('config_image_location_height'));
					}

					data['locations'].push({
						'location_id': location_info['location_id'],
						'name': location_info['name'],
						'address': nl2br(location_info['address']),
						'geocode': location_info['geocode'],
						'telephone': location_info['telephone'],
						'image': image,
						'open': nl2br(location_info['open']),
						'comment': location_info['comment']
					});
				}
			}

		data['name'] = await this.customer.getFirstName();
		data['email'] = await this.customer.getEmail();

		// Captcha
		this.load.model('setting/extension', this);

		const extension_info = await this.model_setting_extension.getExtensionByCode('captcha', this.config.get('config_captcha'));

		if (extension_info.extension_id && Number(this.config.get('captcha_' + this.config.get('config_captcha') + '_status')) && this.config.get('config_captcha_page').includes('contact')) {
			data['captcha'] = await this.load.controller('extension/' + extension_info['extension'] + '/captcha/' + extension_info['code']);
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

	/**
	 * @return void
	 * @throws \Exception
	 */
	async send() {
		await this.load.language('information/contact');

		const json = { error: {} };

		let keys = [
			'name',
			'email',
			'enquiry'
		];

		for (let key of keys) {
			if (!(this.request.post[key])) {
				this.request.post[key] = '';
			}
		}

		if ((oc_strlen(this.request.post['name']) < 3) || (oc_strlen(this.request.post['name']) > 32)) {
			json['error']['name'] = this.language.get('error_name');
		}

		if (!filter_var(this.request.post['email'], FILTER_VALIDATE_EMAIL)) {
			json['error']['email'] = this.language.get('error_email');
		}

		if ((oc_strlen(this.request.post['enquiry']) < 10) || (oc_strlen(this.request.post['enquiry']) > 3000)) {
			json['error']['enquiry'] = this.language.get('error_enquiry');
		}

		// Captcha
		this.load.model('setting/extension', this);

		const extension_info = await this.model_setting_extension.getExtensionByCode('captcha', this.config.get('config_captcha'));

		if (extension_info.extension_id && Number(this.config.get('captcha_' + this.config.get('config_captcha') + '_status')) && this.config.get('config_captcha_page').includes('contact')) {
			const captcha = await this.load.controller('extension/' + extension_info['extension'] + '/captcha/' + extension_info['code'] + '.validate');

			if (captcha) {
				json['error']['captcha'] = captcha;
			}
		}

		if (!Object.keys(json).length) {
			if (this.config.get('config_mail_engine')) {
				let mail_option = {
					'parameter': this.config.get('config_mail_parameter'),
					'smtp_hostname': this.config.get('config_mail_smtp_hostname'),
					'smtp_username': this.config.get('config_mail_smtp_username'),
					'smtp_password': html_entity_decode(this.config.get('config_mail_smtp_password')),
					'smtp_port': this.config.get('config_mail_smtp_port'),
					'smtp_timeout': this.config.get('config_mail_smtp_timeout')
				};

				const mail = new global['\Opencart\System\Library\Mail'](this.config.get('config_mail_engine'), mail_option);
				mail.setTo(this.config.get('config_email'));
				// Less spam and fix bug when using SMTP like sendgrid+
				mail.setFrom(this.config.get('config_email'));
				mail.setReplyTo(this.request.post['email']);
				mail.setSender(html_entity_decode(this.request.post['name']));
				mail.setSubject(html_entity_decode(sprintf(this.language.get('email_subject'), this.request.post['name'])));
				mail.setText(this.request.post['enquiry']);
				await mail.send();
			}

			json['redirect'] = await this.url.link('information/contact+success', 'language=' + this.config.get('config_language'), true);
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async success() {
		await this.load.language('information/contact');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/home', 'language=' + this.config.get('config_language'))
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('information/contact', 'language=' + this.config.get('config_language'))
		});

		data['text_message'] = this.language.get('text_message');

		data['continue'] = await this.url.link('common/home', 'language=' + this.config.get('config_language'));

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.setOutput(await this.load.view('common/success', data));
	}
}
