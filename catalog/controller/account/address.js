const sprintf = require("locutus/php/strings/sprintf");
const trim = require("locutus/php/strings/trim");

module.exports = class AddressController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('account/address');

		if (!await this.customer.isLogged() || (!(this.request.get['customer_token']) || !(this.session.data['customer_token']) || (this.request.get['customer_token'] != this.session.data['customer_token']))) {
			this.session.data['redirect'] = await this.url.link('account/address', 'language=' + this.config.get('config_language'));

			this.response.setRedirect(await this.url.link('account/login', 'language=' + this.config.get('config_language')));
		}
		data['breadcrumbs'] = [];
		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/home', 'language=' + this.config.get('config_language'))
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_account'),
			'href': await this.url.link('account/account', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('account/address', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token'])
		});

		if ((this.session.data['success'])) {
			data['success'] = this.session.data['success'];

			delete this.session.data['success'];
		} else {
			data['success'] = '';
		}

		data['add'] = await this.url.link('account/address.form', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token']);
		data['back'] = await this.url.link('account/account', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token']);

		data['list'] = await this.getList();

		data['language'] = this.config.get('config_language');

		data['customer_token'] = this.session.data['customer_token'];

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');
		await this.session.save(this.session.data);
		this.response.setOutput(await this.load.view('account/address', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('account/address');

		if (!await this.customer.isLogged() || (!(this.request.get['customer_token']) || !(this.session.data['customer_token']) || (this.request.get['customer_token'] != this.session.data['customer_token']))) {
			this.session.data['redirect'] = await this.url.link('account/address', 'language=' + this.config.get('config_language'));

			this.response.setRedirect(await this.url.link('account/login', 'language=' + this.config.get('config_language')));
		}

		this.response.setOutput(await this.getList());
	}

	/**
	 * @return string
	 */
	async getList() {
		const data = {};
		data['addresses'] = [];

		this.load.model('account/address', this);

		const results = await this.model_account_address.getAddresses(await this.customer.getId());
		console.log(results);
		for (let [address_id, result] of Object.entries(results)) {
			let find = [
				'{firstname}',
				'{lastname}',
				'{company}',
				'{address_1}',
				'{address_2}',
				'{city}',
				'{postcode}',
				'{zone}',
				'{zone_code}',
				'{country}'
			];

			let replace = {
				'firstname': result['firstname'],
				'lastname': result['lastname'],
				'company': result['company'],
				'address_1': result['address_1'],
				'address_2': result['address_2'],
				'city': result['city'],
				'postcode': result['postcode'],
				'zone': result['zone'],
				'zone_code': result['zone_code'],
				'country': result['country']
			};
			let address = result.address_format;
			find.forEach((item, index) => {
				address = address.replace(new RegExp(item, 'g'), replace[Object.keys(replace)[index]]);
			});

			address = address.replace(/[\r\n]+/g, '<br/>').replace(/\s{2,}|\r{2,}|\n{2,}/g, '<br/>').trim();

			data['addresses'].push({
				'address_id': result['address_id'],
				'address': address,
				'edit': await this.url.link('account/address.form', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token'] + '&address_id=' + result['address_id']),
				'delete': await this.url.link('account/address.delete', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token'] + '&address_id=' + result['address_id'])
			});
		}
		return await this.load.view('account/address_list', data);
	}

	/**
	 * @return void
	 */
	async form() {
		const data = {};
		await this.load.language('account/address');

		if (!await this.customer.isLogged() || (!(this.request.get['customer_token']) || !(this.session.data['customer_token']) || (this.request.get['customer_token'] != this.session.data['customer_token']))) {
			this.session.data['redirect'] = await this.url.link('account/address', 'language=' + this.config.get('config_language'));

			this.response.setRedirect(await this.url.link('account/login', 'language=' + this.config.get('config_language')));
		}

		this.document.setTitle(this.language.get('heading_title'));

		data['text_address'] = !(this.request.get['address_id']) ? this.language.get('text_address_add') : this.language.get('text_address_edit');

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
			'text': this.language.get('heading_title'),
			'href': await this.url.link('account/address', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token'])
		});

		if (!(this.request.get['address_id'])) {
			data['breadcrumbs'].push({
				'text': this.language.get('text_address_add'),
				'href': await this.url.link('account/address.form', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token'])
			});
		} else {
			data['breadcrumbs'].push({
				'text': this.language.get('text_address_edit'),
				'href': await this.url.link('account/address.form', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token'] + '&address_id=' + this.request.get['address_id'])
			});
		}

		if (!(this.request.get['address_id'])) {
			data['save'] = await this.url.link('account/address.save', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token']);
		} else {
			data['save'] = await this.url.link('account/address.save', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token'] + '&address_id=' + this.request.get['address_id']);
		}

		data['upload'] = await this.url.link('tool/upload', 'language=' + this.config.get('config_language'));
		let address_info;
		if ((this.request.get['address_id'])) {
			this.load.model('account/address', this);

			address_info = await this.model_account_address.getAddress(await this.customer.getId(), this.request.get['address_id']);
		}

		if (address_info && address_info.address_id) {
			data['firstname'] = address_info['firstname'];
		} else {
			data['firstname'] = '';
		}

		if (address_info && address_info.address_id) {
			data['lastname'] = address_info['lastname'];
		} else {
			data['lastname'] = '';
		}

		if (address_info && address_info.address_id) {
			data['company'] = address_info['company'];
		} else {
			data['company'] = '';
		}

		if (address_info && address_info.address_id) {
			data['address_1'] = address_info['address_1'];
		} else {
			data['address_1'] = '';
		}

		if (address_info && address_info.address_id) {
			data['address_2'] = address_info['address_2'];
		} else {
			data['address_2'] = '';
		}

		if (address_info && address_info.address_id) {
			data['postcode'] = address_info['postcode'];
		} else {
			data['postcode'] = '';
		}

		if (address_info && address_info.address_id) {
			data['city'] = address_info['city'];
		} else {
			data['city'] = '';
		}

		if (address_info && address_info.address_id) {
			data['country_id'] = address_info['country_id'];
		} else {
			data['country_id'] = this.config.get('config_country_id');
		}

		if (address_info && address_info.address_id) {
			data['zone_id'] = address_info['zone_id'];
		} else {
			data['zone_id'] = '';
		}

		this.load.model('localisation/country', this);

		data['countries'] = await this.model_localisation_country.getCountries();

		// Custom fields
		data['custom_fields'] = [];

		this.load.model('account/custom_field', this);

		const custom_fields = await this.model_account_custom_field.getCustomFields(await this.customer.getGroupId());

		for (let custom_field of custom_fields) {
			if (custom_field['location'] == 'address') {
				data['custom_fields'].push(custom_field);
			}
		}

		if (address_info && address_info.address_id) {
			data['address_custom_field'] = address_info['custom_field'];
		} else {
			data['address_custom_field'] = [];
		}

		if ((this.request.get['address_id'])) {
			data['default'] = address_info['default'];
		} else {
			data['default'] = false;
		}

		data['back'] = await this.url.link('account/address', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token']);

		data['language'] = this.config.get('config_language');

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.setOutput(await this.load.view('account/address_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('account/address');

		const json = { error: {} };

		if (!await this.customer.isLogged() || (!(this.request.get['customer_token']) || !(this.session.data['customer_token']) || (this.request.get['customer_token'] != this.session.data['customer_token']))) {
			this.session.data['redirect'] = await this.url.link('account/address', 'language=' + this.config.get('config_language'));

			json['redirect'] = await this.url.link('account/login', 'language=' + this.config.get('config_language'), true);
		}

		if (!json['redirect']) {
			let keys = [
				'firstname',
				'lastname',
				'address_1',
				'address_2',
				'city',
				'postcode',
				'country_id',
				'zone_id'
			];

			for (let key of keys) {
				if (!(this.request.post[key])) {
					this.request.post[key] = '';
				}
			}

			if ((oc_strlen(this.request.post['firstname']) < 1) || (oc_strlen(this.request.post['firstname']) > 32)) {
				json['error']['firstname'] = this.language.get('error_firstname');
			}

			if ((oc_strlen(this.request.post['lastname']) < 1) || (oc_strlen(this.request.post['lastname']) > 32)) {
				json['error']['lastname'] = this.language.get('error_lastname');
			}

			if ((oc_strlen(this.request.post['address_1']) < 3) || (oc_strlen(this.request.post['address_1']) > 128)) {
				json['error']['address_1'] = this.language.get('error_address_1');
			}

			if ((oc_strlen(this.request.post['city']) < 2) || (oc_strlen(this.request.post['city']) > 128)) {
				json['error']['city'] = this.language.get('error_city');
			}

			this.load.model('localisation/country', this);

			const country_info = await this.model_localisation_country.getCountry(this.request.post['country_id']);

			if (country_info.country_id && country_info['postcode_required'] && (oc_strlen(this.request.post['postcode']) < 2 || oc_strlen(this.request.post['postcode']) > 10)) {
				json['error']['postcode'] = this.language.get('error_postcode');
			}

			if (this.request.post['country_id'] == '') {
				json['error']['country'] = this.language.get('error_country');
			}

			if (this.request.post['zone_id'] == '') {
				json['error']['zone'] = this.language.get('error_zone');
			}

			// Custom field validation
			this.load.model('account/custom_field', this);

			const custom_fields = await this.model_account_custom_field.getCustomFields(await this.customer.getGroupId());

			for (let custom_field of custom_fields) {
				if (custom_field['location'] == 'address') {
					if (custom_field['required'] && empty(this.request.post['custom_field'][custom_field['custom_field_id']])) {
						json['error']['custom_field_' + custom_field['custom_field_id']] = sprintf(this.language.get('error_custom_field'), custom_field['name']);
					} else if ((custom_field['type'] == 'text') && (custom_field['validation']) && !preg_match(html_entity_decode(custom_field['validation']), this.request.post['custom_field'][custom_field['custom_field_id']])) {
						json['error']['custom_field_' + custom_field['custom_field_id']] = sprintf(this.language.get('error_regex'), custom_field['name']);
					}
				}
			}

			if ((this.request.get['address_id']) && (await this.customer.getAddressId() == this.request.get['address_id']) && !this.request.post['default']) {
				json['error'] = this.language.get('error_default');
			}
		}

		if (!Object.keys(json.error).length) {
			this.load.model('account/address', this);

			// Add Address
			if (!(this.request.get['address_id'])) {
				await this.model_account_address.addAddress(await this.customer.getId(), this.request.post);

				this.session.data['success'] = this.language.get('text_add');
			}

			// Edit Address
			if ((this.request.get['address_id'])) {
				await this.model_account_address.editAddress(this.request.get['address_id'], this.request.post);

				// If address is in session update it+
				if ((this.session.data['shipping_address']) && (this.session.data['shipping_address']['address_id'] == this.request.get['address_id'])) {
					this.session.data['shipping_address'] = await this.model_account_address.getAddress(await this.customer.getId(), this.request.get['address_id']);

					delete this.session.data['shipping_method'];
					delete this.session.data['shipping_methods'];
					delete this.session.data['payment_method'];
					delete this.session.data['payment_methods'];
				}

				// If address is in session update it+
				if ((this.session.data['payment_address']) && (this.session.data['payment_address']['address_id'] == this.request.get['address_id'])) {
					this.session.data['payment_address'] = await this.model_account_address.getAddress(await this.customer.getId(), this.request.get['address_id']);

					delete this.session.data['shipping_method'];
					delete this.session.data['shipping_methods'];
					delete this.session.data['payment_method'];
					delete this.session.data['payment_methods'];
				}

				this.session.data['success'] = this.language.get('text_edit');
			}

			json['redirect'] = await this.url.link('account/address', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token'], true);
		}
		await this.session.save(this.session.data);
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async delete() {
		await this.load.language('account/address');

		const json = {};
		let address_id = 0;
		if ((this.request.get['address_id'])) {
			address_id = this.request.get['address_id'];
		}

		if (!await this.customer.isLogged() || (!(this.request.get['customer_token']) || !(this.session.data['customer_token']) || (this.request.get['customer_token'] != this.session.data['customer_token']))) {
			this.session.data['redirect'] = await this.url.link('account/address', 'language=' + this.config.get('config_language'));

			json['redirect'] = await this.url.link('account/login', 'language=' + this.config.get('config_language'), true);
		}

		if (!Object.keys(json).length) {
			if (await this.customer.getAddressId() == address_id) {
				json['error'] = this.language.get('error_default');
			}

			this.load.model('account/address', this);

			if (await this.model_account_address.getTotalAddresses(await this.customer.getId()) == 1) {
				json['error'] = this.language.get('error_delete');
			}

			this.load.model('account/subscription', this);

			let subscription_total = await this.model_account_subscription.getTotalSubscriptionByShippingAddressId(address_id);

			if (subscription_total) {
				json['error'] = sprintf(this.language.get('error_subscription'), subscription_total);
			}

			subscription_total = await this.model_account_subscription.getTotalSubscriptionByPaymentAddressId(address_id);

			if (subscription_total) {
				json['error'] = sprintf(this.language.get('error_subscription'), subscription_total);
			}
		}

		if (!Object.keys(json).length) {
			// Delete address from database+
			await this.model_account_address.deleteAddress(address_id);

			// Delete address from session+
			if ((this.session.data['shipping_address']['address_id']) && (this.session.data['shipping_address']['address_id'] == address_id)) {
				delete this.session.data['shipping_address'];
				delete this.session.data['shipping_method'];
				delete this.session.data['shipping_methods'];
				delete this.session.data['payment_method'];
				delete this.session.data['payment_methods'];
			}

			// Delete address from session+
			if ((this.session.data['payment_address']['address_id']) && (this.session.data['payment_address']['address_id'] == address_id)) {
				delete this.session.data['payment_address'];
				delete this.session.data['shipping_method'];
				delete this.session.data['shipping_methods'];
				delete this.session.data['payment_method'];
				delete this.session.data['payment_methods'];
			}

			json['success'] = this.language.get('text_delete');
		}
		await this.session.save(this.session.data);
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
