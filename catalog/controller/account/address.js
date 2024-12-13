const trim = require("locutus/php/strings/trim");
const is_numeric = require("locutus/php/var/is_numeric");

module.exports = class ControllerAccountAddress extends Controller {
	error = {};

	async index() {
		if (!await this.customer.isLogged()) {
			this.session.data['redirect'] = await this.url.link('account/address', '', true);
			await this.session.save(this.session.data);
			this.response.setRedirect(await this.url.link('account/login', '', true));
		}

		await this.load.language('account/address');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('account/address', this);

		await this.getList();
	}

	async add() {
		if (!await this.customer.isLogged()) {
			this.session.data['redirect'] = await this.url.link('account/address', '', true);
			await this.session.save(this.session.data);
			this.response.setRedirect(await this.url.link('account/login', '', true));
		}

		await this.load.language('account/address');

		this.document.setTitle(this.language.get('heading_title'));

		this.document.addScript('catalog/view/javascript/jquery/datetimepicker/moment/moment.min.js');
		this.document.addScript('catalog/view/javascript/jquery/datetimepicker/moment/moment-with-locales.min.js');
		this.document.addScript('catalog/view/javascript/jquery/datetimepicker/bootstrap-datetimepicker.min.js');
		this.document.addStyle('catalog/view/javascript/jquery/datetimepicker/bootstrap-datetimepicker.min.css');

		this.load.model('account/address', this);

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_account_address.addAddress(await this.customer.getId(), this.request.post);

			this.session.data['success'] = this.language.get('text_add');
			await this.session.save(this.session.data);
			this.response.setRedirect(await this.url.link('account/address', '', true));
		} else {
			await this.getForm();
		}
	}

	async edit() {
		if (!await this.customer.isLogged()) {
			this.session.data['redirect'] = await this.url.link('account/address', '', true);
			await this.session.save(this.session.data);
			this.response.setRedirect(await this.url.link('account/login', '', true));
		}

		await this.load.language('account/address');

		this.document.setTitle(this.language.get('heading_title'));

		this.document.addScript('catalog/view/javascript/jquery/datetimepicker/moment/moment.min.js');
		this.document.addScript('catalog/view/javascript/jquery/datetimepicker/moment/moment-with-locales.min.js');
		this.document.addScript('catalog/view/javascript/jquery/datetimepicker/bootstrap-datetimepicker.min.js');
		this.document.addStyle('catalog/view/javascript/jquery/datetimepicker/bootstrap-datetimepicker.min.css');

		this.load.model('account/address', this);

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_account_address.editAddress(this.request.get['address_id'], this.request.post);

			// Default Shipping Address
			if ((this.session.data['shipping_address'] && this.session.data['shipping_address']['address_id']) && (this.request.get['address_id'] == this.session.data['shipping_address']['address_id'])) {
				this.session.data['shipping_address'] = await this.model_account_address.getAddress(this.request.get['address_id']);

				delete this.session.data['shipping_method'];
				delete this.session.data['shipping_methods'];
			}

			// Default Payment Address
			if ((this.session.data['payment_address'] && this.session.data['payment_address']['address_id']) && (this.request.get['address_id'] == this.session.data['payment_address']['address_id'])) {
				this.session.data['payment_address'] = await this.model_account_address.getAddress(this.request.get['address_id']);

				delete this.session.data['payment_method'];
				delete this.session.data['payment_methods'];
			}

			this.session.data['success'] = this.language.get('text_edit');
			await this.session.save(this.session.data);
			this.response.setRedirect(await this.url.link('account/address', '', true));
		} else {
			await this.getForm();
		}
	}

	async delete() {
		if (!await this.customer.isLogged()) {
			this.session.data['redirect'] = await this.url.link('account/address', '', true);
			await this.session.save(this.session.data);
			this.response.setRedirect(await this.url.link('account/login', '', true));
		} else {

			await this.load.language('account/address');

			this.document.setTitle(this.language.get('heading_title'));

			this.load.model('account/address', this);

			if ((this.request.get['address_id']) && this.validateDelete()) {
				await this.model_account_address.deleteAddress(this.request.get['address_id']);

				// Default Shipping Address
				if ((this.session.data['shipping_address']['address_id']) && (this.request.get['address_id'] == this.session.data['shipping_address']['address_id'])) {
					delete this.session.data['shipping_address'];
					delete this.session.data['shipping_method'];
					delete this.session.data['shipping_methods'];
				}

				// Default Payment Address
				if ((this.session.data['payment_address'] && this.session.data['payment_address']['address_id']) && (this.request.get['address_id'] == this.session.data['payment_address']['address_id'])) {
					delete this.session.data['payment_address'];
					delete this.session.data['payment_method'];
					delete this.session.data['payment_methods'];
				}

				this.session.data['success'] = this.language.get('text_delete');
				await this.session.save(this.session.data);
				this.response.setRedirect(await this.url.link('account/address', '', true));
			} else {
				await this.getList();
			}
		}
	}

	async getList() {
		const data = {};
		data['breadcrumbs'] = [];
		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/home')
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_account'),
			'href': await this.url.link('account/account', '', true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('account/address', '', true)
		});

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.session.data['success'])) {
			data['success'] = this.session.data['success'];

			delete this.session.data['success'];
		} else {
			data['success'] = '';
		}

		data['addresses'] = [];

		const results = await this.model_account_address.getAddresses();

		for (let [address_id, result] of Object.entries(results)) {
			let format = '{firstname} {lastname}' + "\n" + '{company}' + "\n" + '{address_1}' + "\n" + '{address_2}' + "\n" + '{city} {postcode}' + "\n" + '{zone}' + "\n" + '{country}';
			if (result['address_format']) {
				format = result['address_format'];
			}

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
				'country': result['country'],
				"\r\n": '<br />',
				"\r": '<br />',
				"\n": '<br />',
				"/\s\s+/": '<br />',
				"/\r\r+/": '<br />',
				"/\n\n+/": '<br />'
			};
			for (let [k, v] of Object.entries(replace)) {
				format = format.trim().replaceAll('{' + k + '}', v).replaceAll(k, v)
			}
			data['addresses'].push({
				'address_id': result['address_id'],
				'address': format,
				'update': await this.url.link('account/address/edit', 'address_id=' + result['address_id'], true),
				'delete': await this.url.link('account/address/delete', 'address_id=' + result['address_id'], true)
			});
		}
		data['add'] = await this.url.link('account/address/add', '', true);
		data['back'] = await this.url.link('account/account', '', true);

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');
		await this.session.save(this.session.data);
		this.response.setOutput(await this.load.view('account/address_list', data));
	}

	async getForm() {
		const data = {};
		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/home')
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_account'),
			'href': await this.url.link('account/account', '', true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('account/address', '', true)
		});

		if (!(this.request.get['address_id'])) {
			data['breadcrumbs'].push({
				'text': this.language.get('text_address_add'),
				'href': await this.url.link('account/address/add', '', true)
			});
		} else {
			data['breadcrumbs'].push({
				'text': this.language.get('text_address_edit'),
				'href': await this.url.link('account/address/edit', 'address_id=' + this.request.get['address_id'], true)
			});
		}

		data['text_address'] = !(this.request.get['address_id']) ? this.language.get('text_address_add') : this.language.get('text_address_edit');

		if ((this.error['firstname'])) {
			data['error_firstname'] = this.error['firstname'];
		} else {
			data['error_firstname'] = '';
		}

		if ((this.error['lastname'])) {
			data['error_lastname'] = this.error['lastname'];
		} else {
			data['error_lastname'] = '';
		}

		if ((this.error['address_1'])) {
			data['error_address_1'] = this.error['address_1'];
		} else {
			data['error_address_1'] = '';
		}

		if ((this.error['city'])) {
			data['error_city'] = this.error['city'];
		} else {
			data['error_city'] = '';
		}

		if ((this.error['postcode'])) {
			data['error_postcode'] = this.error['postcode'];
		} else {
			data['error_postcode'] = '';
		}

		if ((this.error['country'])) {
			data['error_country'] = this.error['country'];
		} else {
			data['error_country'] = '';
		}

		if ((this.error['zone'])) {
			data['error_zone'] = this.error['zone'];
		} else {
			data['error_zone'] = '';
		}

		if ((this.error['custom_field'])) {
			data['error_custom_field'] = this.error['custom_field'];
		} else {
			data['error_custom_field'] = {};
		}

		if (!(this.request.get['address_id'])) {
			data['action'] = await this.url.link('account/address/add', '', true);
		} else {
			data['action'] = await this.url.link('account/address/edit', 'address_id=' + this.request.get['address_id'], true);
		}
		let address_info;
		if ((this.request.get['address_id']) && (this.request.server['method'] != 'POST')) {
			address_info = await this.model_account_address.getAddress(this.request.get['address_id']);
		}

		if ((this.request.post['firstname'])) {
			data['firstname'] = this.request.post['firstname'];
		} else if ((address_info)) {
			data['firstname'] = address_info['firstname'];
		} else {
			data['firstname'] = '';
		}

		if ((this.request.post['lastname'])) {
			data['lastname'] = this.request.post['lastname'];
		} else if ((address_info)) {
			data['lastname'] = address_info['lastname'];
		} else {
			data['lastname'] = '';
		}

		if ((this.request.post['company'])) {
			data['company'] = this.request.post['company'];
		} else if ((address_info)) {
			data['company'] = address_info['company'];
		} else {
			data['company'] = '';
		}

		if ((this.request.post['address_1'])) {
			data['address_1'] = this.request.post['address_1'];
		} else if ((address_info)) {
			data['address_1'] = address_info['address_1'];
		} else {
			data['address_1'] = '';
		}

		if ((this.request.post['address_2'])) {
			data['address_2'] = this.request.post['address_2'];
		} else if ((address_info)) {
			data['address_2'] = address_info['address_2'];
		} else {
			data['address_2'] = '';
		}

		if ((this.request.post['postcode'])) {
			data['postcode'] = this.request.post['postcode'];
		} else if ((address_info)) {
			data['postcode'] = address_info['postcode'];
		} else {
			data['postcode'] = '';
		}

		if ((this.request.post['city'])) {
			data['city'] = this.request.post['city'];
		} else if ((address_info)) {
			data['city'] = address_info['city'];
		} else {
			data['city'] = '';
		}

		if ((this.request.post['country_id'])) {
			data['country_id'] = this.request.post['country_id'];
		} else if ((address_info)) {
			data['country_id'] = address_info['country_id'];
		} else {
			data['country_id'] = this.config.get('config_country_id');
		}

		if ((this.request.post['zone_id'])) {
			data['zone_id'] = this.request.post['zone_id'];
		} else if ((address_info)) {
			data['zone_id'] = address_info['zone_id'];
		} else {
			data['zone_id'] = '';
		}

		if ((this.request.post['custom_field'] && this.request.post['custom_field']['address'])) {
			data['address_custom_field'] = this.request.post['custom_field']['address'];
		} else if ((address_info && address_info['custom_field'])) {
			data['address_custom_field'] = address_info['custom_field'];
		} else {
			data['address_custom_field'] = {};
		}

		this.load.model('localisation/country', this);

		data['countries'] = await this.model_localisation_country.getCountries();

		// Custom fields
		data['custom_fields'] = [];

		this.load.model('tool/upload', this);
		this.load.model('account/custom_field', this);

		const custom_fields = await this.model_account_custom_field.getCustomFields(this.config.get('config_customer_group_id'));

		for (let custom_field of custom_fields) {
			if (custom_field['location'] == 'address') {
				if (custom_field['type'] == 'file' && (data['address_custom_field'][custom_field['custom_field_id']])) {
					const code = data['address_custom_field'][custom_field['custom_field_id']];

					const upload_result = await this.model_tool_upload.getUploadByCode(code);

					data['address_custom_field'][custom_field['custom_field_id']] = {};
					if (upload_result.code) {
						data['address_custom_field'][custom_field['custom_field_id']]['name'] = upload_result['name'];
						data['address_custom_field'][custom_field['custom_field_id']]['code'] = upload_result['code'];
					} else {
						data['address_custom_field'][custom_field['custom_field_id']]['name'] = "";
						data['address_custom_field'][custom_field['custom_field_id']]['code'] = code;
					}
					data['custom_fields'].push(custom_field);
				} else {
					data['custom_fields'].push(custom_field);
				}
			}
		}

		if ((this.request.post['default'])) {
			data['default'] = this.request.post['default'];
		} else if ((this.request.get['address_id'])) {
			data['default'] = await this.customer.getAddressId() == this.request.get['address_id'];
		} else {
			data['default'] = false;
		}

		data['back'] = await this.url.link('account/address', '', true);

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.setOutput(await this.load.view('account/address_form', data));
	}

	async validateForm() {
		if ((utf8_strlen(trim(this.request.post['firstname'])) < 1) || (utf8_strlen(trim(this.request.post['firstname'])) > 32)) {
			this.error['firstname'] = this.language.get('error_firstname');
		}

		if ((utf8_strlen(trim(this.request.post['lastname'])) < 1) || (utf8_strlen(trim(this.request.post['lastname'])) > 32)) {
			this.error['lastname'] = this.language.get('error_lastname');
		}

		if ((utf8_strlen(trim(this.request.post['address_1'])) < 3) || (utf8_strlen(trim(this.request.post['address_1'])) > 128)) {
			this.error['address_1'] = this.language.get('error_address_1');
		}

		if ((utf8_strlen(trim(this.request.post['city'])) < 2) || (utf8_strlen(trim(this.request.post['city'])) > 128)) {
			this.error['city'] = this.language.get('error_city');
		}

		this.load.model('localisation/country', this);

		const country_info = await this.model_localisation_country.getCountry(this.request.post['country_id']);

		if (country_info.country_id && country_info['postcode_required'] && (utf8_strlen(trim(this.request.post['postcode'])) < 2 || utf8_strlen(trim(this.request.post['postcode'])) > 10)) {
			this.error['postcode'] = this.language.get('error_postcode');
		}

		if (this.request.post['country_id'] == '' || !is_numeric(this.request.post['country_id'])) {
			this.error['country'] = this.language.get('error_country');
		}

		if (!(this.request.post['zone_id']) || this.request.post['zone_id'] == '' || !is_numeric(this.request.post['zone_id'])) {
			this.error['zone'] = this.language.get('error_zone');
		}

		// Custom field validation
		this.load.model('account/custom_field', this);

		const custom_fields = await this.model_account_custom_field.getCustomFields(this.config.get('config_customer_group_id'));

		for (let custom_field of custom_fields) {
			if (custom_field['location'] == 'address') {
				if (custom_field['required'] && !(this.request.post['custom_field'][custom_field['location']][custom_field['custom_field_id']])) {
					this.error['custom_field'] = this.error['custom_field'] || {};
					this.error['custom_field'][custom_field['custom_field_id']] = sprintf(this.language.get('error_custom_field'), custom_field['name']);
				} else if (custom_field.type === 'text' && custom_field.validation) {
					const regex = new RegExp(custom_field.validation);
					if (!regex.test(this.request.post['custom_field'][custom_field['location']][custom_field['custom_field_id']])) {
						this.error['custom_field'] = this.error['custom_field'] || {};
						this.error['custom_field'][custom_field['custom_field_id']] = sprintf(this.language.get('error_custom_field'), custom_field['name']);
					}
				}
			}
		}

		return !Object.keys(this.error).length;
	}

	async validateDelete() {
		if (await this.model_account_address.getTotalAddresses() == 1) {
			this.error['warning'] = this.language.get('error_delete');
		}

		if (await this.customer.getAddressId() == this.request.get['address_id']) {
			this.error['warning'] = this.language.get('error_default');
		}

		return !Object.keys(this.error).length;
	}
}
