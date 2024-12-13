module.exports = class ControllerAccountAffiliate extends Controller {
	error = {};

	async add() {
		if (!await this.customer.isLogged()) {
			this.session.data['redirect'] = await this.url.link('account/affiliate', '', true);
			await this.session.save(this.session.data);
			this.response.setRedirect(await this.url.link('affiliate/login', '', true));
		}

		await this.load.language('account/affiliate');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('account/customer',this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_account_customer.addAffiliate(await this.customer.getId(), this.request.post);

			this.session.data['success'] = this.language.get('text_success');

			this.response.setRedirect(await this.url.link('account/account', '', true));
		}
		
		this.getForm();
	}
	
	async edit() {
		if (!await this.customer.isLogged()) {
			this.session.data['redirect'] = await this.url.link('account/affiliate', '', true);
			await this.session.save(this.session.data);
			this.response.setRedirect(await this.url.link('affiliate/login', '', true));
		}

		await this.load.language('account/affiliate');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('account/customer',this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_account_customer.editAffiliate(await this.customer.getId(), this.request.post);

			this.session.data['success'] = this.language.get('text_success');

			this.response.setRedirect(await this.url.link('account/account', '', true));
		}
		
		this.getForm();
	}
		
	async getForm() {
		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : await this.url.link('common/home')
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('text_account'),
			'href' : await this.url.link('account/account', '', true)
		});

		if (this.request.get['route'] == 'account/affiliate/add') {
			data['breadcrumbs'].push({
				'text' : this.language.get('text_affiliate'),
				'href' : await this.url.link('account/affiliate/add', '', true)
			});
		} else {
			data['breadcrumbs'].push({
				'text' : this.language.get('text_affiliate'),
				'href' : await this.url.link('account/affiliate/edit', '', true)
			});		
		}
	
		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}
				
		if ((this.error['cheque'])) {
			data['error_cheque'] = this.error['cheque'];
		} else {
			data['error_cheque'] = '';
		}

		if ((this.error['paypal'])) {
			data['error_paypal'] = this.error['paypal'];
		} else {
			data['error_paypal'] = '';
		}

		if ((this.error['bank_account_name'])) {
			data['error_bank_account_name'] = this.error['bank_account_name'];
		} else {
			data['error_bank_account_name'] = '';
		}

		if ((this.error['bank_account_number'])) {
			data['error_bank_account_number'] = this.error['bank_account_number'];
		} else {
			data['error_bank_account_number'] = '';
		}
		
		if ((this.error['custom_field'])) {
			data['error_custom_field'] = this.error['custom_field'];
		} else {
			data['error_custom_field'] = array();
		}
				
		data['action'] = await this.url.link(this.request.get['route'], '', true);
		
		if (this.request.get['route'] == 'account/affiliate/edit' && this.request.server['method'] != 'POST') {
			affiliate_info = await this.model_account_customer.getAffiliate(await this.customer.getId());
		}
		
		if ((this.request.post['company'])) {
			data['company'] = this.request.post['company'];
		} else if (!empty(affiliate_info)) {
			data['company'] = affiliate_info['company'];
		} else {
			data['company'] = '';
		}
		
		if ((this.request.post['website'])) {
			data['website'] = this.request.post['website'];
		} else if (!empty(affiliate_info)) {
			data['website'] = affiliate_info['website'];
		} else {
			data['website'] = '';
		}
				
		if ((this.request.post['tax'])) {
			data['tax'] = this.request.post['tax'];
		} else if (!empty(affiliate_info)) {
			data['tax'] = affiliate_info['tax'];
		} else {
			data['tax'] = '';
		}

		if ((this.request.post['payment'])) {
			data['payment'] = this.request.post['payment'];
		} else if (!empty(affiliate_info)) {
			data['payment'] = affiliate_info['payment'];
		} else {
			data['payment'] = 'cheque';
		}

		if ((this.request.post['cheque'])) {
			data['cheque'] = this.request.post['cheque'];
		} else if (!empty(affiliate_info)) {
			data['cheque'] = affiliate_info['cheque'];
		} else {
			data['cheque'] = '';
		}

		if ((this.request.post['paypal'])) {
			data['paypal'] = this.request.post['paypal'];
		} else if (!empty(affiliate_info)) {
			data['paypal'] = affiliate_info['paypal'];
		} else {
			data['paypal'] = '';
		}

		if ((this.request.post['bank_name'])) {
			data['bank_name'] = this.request.post['bank_name'];
		} else if (!empty(affiliate_info)) {
			data['bank_name'] = affiliate_info['bank_name'];
		} else {
			data['bank_name'] = '';
		}

		if ((this.request.post['bank_branch_number'])) {
			data['bank_branch_number'] = this.request.post['bank_branch_number'];
		} else if (!empty(affiliate_info)) {
			data['bank_branch_number'] = affiliate_info['bank_branch_number'];
		} else {
			data['bank_branch_number'] = '';
		}

		if ((this.request.post['bank_swift_code'])) {
			data['bank_swift_code'] = this.request.post['bank_swift_code'];
		} else if (!empty(affiliate_info)) {
			data['bank_swift_code'] = affiliate_info['bank_swift_code'];
		} else {
			data['bank_swift_code'] = '';
		}

		if ((this.request.post['bank_account_name'])) {
			data['bank_account_name'] = this.request.post['bank_account_name'];
		} else if (!empty(affiliate_info)) {
			data['bank_account_name'] = affiliate_info['bank_account_name'];
		} else {
			data['bank_account_name'] = '';
		}

		if ((this.request.post['bank_account_number'])) {
			data['bank_account_number'] = this.request.post['bank_account_number'];
		} else if (!empty(affiliate_info)) {
			data['bank_account_number'] = affiliate_info['bank_account_number'];
		} else {
			data['bank_account_number'] = '';
		}

		// Custom Fields
		this.load.model('account/custom_field',this);

		data['custom_fields'] = await this.model_account_custom_field.getCustomFields(this.config.get('config_customer_group_id'));

		if ((this.request.post['custom_field'])) {
			data['affiliate_custom_field'] = this.request.post['custom_field'];
		} else if ((affiliate_info)) {
			data['affiliate_custom_field'] = JSON.parse(affiliate_info['custom_field'], true);
		} else {
			data['affiliate_custom_field'] = array();
		}

		affiliate_info = await this.model_account_customer.getAffiliate(await this.customer.getId());

		if (!affiliate_info && this.config.get('config_affiliate_id')) {
			this.load.model('catalog/information',this);

			information_info = await this.model_catalog_information.getInformation(this.config.get('config_affiliate_id'));

			if (information_info) {
				data['text_agree'] = sprintf(this.language.get('text_agree'), await this.url.link('information/information/agree', 'information_id=' + this.config.get('config_affiliate_id'), true), information_info['title']);
			} else {
				data['text_agree'] = '';
			}
		} else {
			data['text_agree'] = '';
		}

		if ((this.request.post['agree'])) {
			data['agree'] = this.request.post['agree'];
		} else {
			data['agree'] = false;
		}
		
		data['back'] = await this.url.link('account/account', '', true);

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.setOutput(await this.load.view('account/affiliate', data));
	}
	
	async validate() {
		if (this.request.post['payment'] == 'cheque' && !this.request.post['cheque']) {
			this.error['cheque'] = this.language.get('error_cheque');
		} else if ((this.request.post['payment'] == 'paypal') && ((utf8_strlen(this.request.post['paypal']) > 96) || !filter_var(this.request.post['paypal'], FILTER_VALIDATE_EMAIL))) {
			this.error['paypal'] = this.language.get('error_paypal');
		} else if (this.request.post['payment'] == 'bank') {
			if (this.request.post['bank_account_name'] == '') {
				this.error['bank_account_name'] = this.language.get('error_bank_account_name');
			}
	
			if (this.request.post['bank_account_number'] == '') {
				this.error['bank_account_number'] = this.language.get('error_bank_account_number');
			}
		}
		
		// Custom field validation
		this.load.model('account/custom_field',this);

		custom_fields = await this.model_account_custom_field.getCustomFields(this.config.get('config_customer_group_id'));

		for (custom_fields of custom_field) {
			if (custom_field['location'] == 'affiliate') {
				if (custom_field['required'] && empty(this.request.post['custom_field'][custom_field['location']][custom_field['custom_field_id']])) {
					this.error['custom_field'][custom_field['custom_field_id']] = sprintf(this.language.get('error_custom_field'), custom_field['name']);
				} else if ((custom_field['type'] == 'text') && !empty(custom_field['validation']) && !filter_var(this.request.post['custom_field'][custom_field['location']][custom_field['custom_field_id']], FILTER_VALIDATE_REGEXP, array('options' : array('regexp' : custom_field['validation'])))) {
					this.error['custom_field'][custom_field['custom_field_id']] = sprintf(this.language.get('error_custom_field'), custom_field['name']);
				}
			}
		}			
		
		// Validate agree only if customer not already an affiliate
		affiliate_info = await this.model_account_customer.getAffiliate(await this.customer.getId());
				
		if (!affiliate_info && this.config.get('config_affiliate_id')) {
			this.load.model('catalog/information',this);

			information_info = await this.model_catalog_information.getInformation(this.config.get('config_affiliate_id'));

			if (information_info && !(this.request.post['agree'])) {
				this.error['warning'] = sprintf(this.language.get('error_agree'), information_info['title']);
			}
		}

		return !Object.keys(this.error).length;
	}	
}