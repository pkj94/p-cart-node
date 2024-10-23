module.exports = class Affiliate extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('account/affiliate');

		if (!await this.customer.isLogged() || (!(this.request.get['customer_token']) || !(this.session.data['customer_token']) || (this.request.get['customer_token'] != this.session.data['customer_token']))) {
			await this.customer.logout();

			this.session.data['redirect'] = await this.url.link('account/affiliate', 'language=' + this.config.get('config_language'));

			this.response.setRedirect(await this.url.link('account/login', 'language=' + this.config.get('config_language')));
		}

		this.document.setTitle(this.language.get('heading_title'));

		data['error_upload_size'] = sprintf(this.language.get('error_upload_size'), Number(this.config.get('config_file_max_size')));

		data['config_file_max_size'] = (Number(this.config.get('config_file_max_size')) * 1024 * 1024);

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/home', 'language=' + this.config.get('config_language'))
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_account'),
			'href': await this.url.link('account/account', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_affiliate'),
			'href': await this.url.link('account/affiliate', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token'])
		});

		data['save'] = await this.url.link('account/affiliate+save', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token']);
		data['upload'] = await this.url.link('tool/upload', 'language=' + this.config.get('config_language'));

		this.load.model('account/affiliate', this);

		affiliate_info = await this.model_account_affiliate.getAffiliate(await this.customer.getId());

		if ((affiliate_info)) {
			data['company'] = affiliate_info['company'];
		} else {
			data['company'] = '';
		}

		if ((affiliate_info)) {
			data['website'] = affiliate_info['website'];
		} else {
			data['website'] = '';
		}

		if ((affiliate_info)) {
			data['tax'] = affiliate_info['tax'];
		} else {
			data['tax'] = '';
		}

		if ((affiliate_info)) {
			data['payment_method'] = affiliate_info['payment_method'];
		} else {
			data['payment_method'] = 'cheque';
		}

		if ((affiliate_info)) {
			data['cheque'] = affiliate_info['cheque'];
		} else {
			data['cheque'] = '';
		}

		if ((affiliate_info)) {
			data['paypal'] = affiliate_info['paypal'];
		} else {
			data['paypal'] = '';
		}

		if ((affiliate_info)) {
			data['bank_name'] = affiliate_info['bank_name'];
		} else {
			data['bank_name'] = '';
		}

		if ((affiliate_info)) {
			data['bank_branch_number'] = affiliate_info['bank_branch_number'];
		} else {
			data['bank_branch_number'] = '';
		}

		if ((affiliate_info)) {
			data['bank_swift_code'] = affiliate_info['bank_swift_code'];
		} else {
			data['bank_swift_code'] = '';
		}

		if ((affiliate_info)) {
			data['bank_account_name'] = affiliate_info['bank_account_name'];
		} else {
			data['bank_account_name'] = '';
		}

		if ((affiliate_info)) {
			data['bank_account_number'] = affiliate_info['bank_account_number'];
		} else {
			data['bank_account_number'] = '';
		}

		// Custom Fields
		this.load.model('account/custom_field', this);

		const custom_fields = await this.model_account_custom_field.getCustomFields(this.config.get('config_customer_group_id'));

		for (let custom_field of custom_fields) {
			if (custom_field['location'] == 'affiliate') {
				data['custom_fields'].push(custom_field);
			}
		}

		if ((affiliate_info)) {
			data['affiliate_custom_field'] = JSON.parse(affiliate_info['custom_field'], true);
		} else {
			data['affiliate_custom_field'] = [];
		}

		affiliate_info = await this.model_account_affiliate.getAffiliate(await this.customer.getId());

		if (!affiliate_info && this.config.get('config_affiliate_id')) {
			this.load.model('catalog/information', this);

			const information_info = await this.model_catalog_information.getInformation(this.config.get('config_affiliate_id'));

			if (information_info) {
				data['text_agree'] = sprintf(this.language.get('text_agree'), await this.url.link('information/information.info', 'language=' + this.config.get('config_language') + '&information_id=' + this.config.get('config_affiliate_id')), information_info['title']);
			} else {
				data['text_agree'] = '';
			}
		} else {
			data['text_agree'] = '';
		}

		data['back'] = await this.url.link('account/account', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token']);

		data['language'] = this.config.get('config_language');

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.setOutput(await this.load.view('account/affiliate', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('account/affiliate');

		const json = {};

		if (!await this.customer.isLogged() || (!(this.request.get['customer_token']) || !(this.session.data['customer_token']) || (this.request.get['customer_token'] != this.session.data['customer_token']))) {
			this.session.data['redirect'] = await this.url.link('account/affiliate', 'language=' + this.config.get('config_language'));

			json['redirect'] = await this.url.link('account/login', 'language=' + this.config.get('config_language'), true);
		}

		if (!this.config.get('config_affiliate_status')) {
			json['redirect'] = await this.url.link('account/account', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token'], true);
		}

		keys = [
			'payment_method',
			'cheque',
			'paypal',
			'bank_account_name',
			'bank_account_number',
			'agree'
		];

		for (let key of keys) {
			if (!(this.request.post[key])) {
				this.request.post[key] = '';
			}
		}

		if (!Object.keys(json).length) {
			// Payment validation
			if (empty(this.request.post['payment_method'])) {
				json['error']['payment_method'] = this.language.get('error_payment_method');
			}

			if (this.request.post['payment_method'] == 'cheque' && !this.request.post['cheque']) {
				json['error']['cheque'] = this.language.get('error_cheque');
			} else if (this.request.post['payment_method'] == 'paypal' && ((oc_strlen(this.request.post['paypal']) > 96) || !filter_var(this.request.post['paypal'], FILTER_VALIDATE_EMAIL))) {
				json['error']['paypal'] = this.language.get('error_paypal');
			} else if (this.request.post['payment_method'] == 'bank') {
				if (this.request.post['bank_account_name'] == '') {
					json['error']['bank_account_name'] = this.language.get('error_bank_account_name');
				}

				if (this.request.post['bank_account_number'] == '') {
					json['error']['bank_account_number'] = this.language.get('error_bank_account_number');
				}
			}

			// Custom field validation
			this.load.model('account/custom_field', this);

			const custom_fields = await this.model_account_custom_field.getCustomFields(this.config.get('config_customer_group_id'));

			for (let custom_field of custom_fields) {
				if (custom_field['location'] == 'affiliate') {
					if (custom_field['required'] && empty(this.request.post['custom_field'][custom_field['custom_field_id']])) {
						json['error']['custom_field_' + custom_field['custom_field_id']] = sprintf(this.language.get('error_custom_field'), custom_field['name']);
					} else if ((custom_field['type'] == 'text') && (custom_field['validation']) && !preg_match(html_entity_decode(custom_field['validation']), this.request.post['custom_field'][custom_field['custom_field_id']])) {
						json['error']['custom_field_' + custom_field['custom_field_id']] = sprintf(this.language.get('error_regex'), custom_field['name']);
					}
				}
			}

			// Validate agree only if customer not already an affiliate
			this.load.model('account/affiliate', this);

			affiliate_info = await this.model_account_affiliate.getAffiliate(await this.customer.getId());

			if (!affiliate_info) {
				this.load.model('catalog/information', this);

				const information_info = await this.model_catalog_information.getInformation(this.config.get('config_affiliate_id'));

				if (information_info && !this.request.post['agree']) {
					json['error']['warning'] = sprintf(this.language.get('error_agree'), information_info['title']);
				}
			}
		}

		if (!Object.keys(json).length) {
			if (!affiliate_info) {
				await this.model_account_affiliate.addAffiliate(await this.customer.getId(), this.request.post);
			} else {
				await this.model_account_affiliate.editAffiliate(await this.customer.getId(), this.request.post);
			}

			this.session.data['success'] = this.language.get('text_success');

			json['redirect'] = await this.url.link('account/account', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token'], true);
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}