module.exports = class ControllerSettingStore extends Controller {
	error = {};

	async index() {
const data = {};
		await this.load.language('setting/store');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/store',this);

		this.load.model('setting/setting',this);

		await this.getList();
	}

	async add() {
		await this.load.language('setting/store');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/store',this);

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			store_id = await this.model_setting_store.addStore(this.request.post);

			this.load.model('setting/setting',this);

			await this.model_setting_setting.editSetting('config', this.request.post, store_id);

			this.session.data['success'] = this.language.get('text_success');
await this.session.save(this.session.data);

			this.response.setRedirect(await this.url.link('setting/store', 'user_token=' + this.session.data['user_token'], true));
		}

		await this.getForm();
	}

	async edit() {
		await this.load.language('setting/store');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/store',this);

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_setting_store.editStore(this.request.get['store_id'], this.request.post);

			this.load.model('setting/setting',this);

			await this.model_setting_setting.editSetting('config', this.request.post, this.request.get['store_id']);

			this.session.data['success'] = this.language.get('text_success');
await this.session.save(this.session.data);

			this.response.setRedirect(await this.url.link('setting/store', 'user_token=' + this.session.data['user_token'] + '&store_id=' + this.request.get['store_id'], true));
		}

		await this.getForm();
	}

	async delete() {
		await this.load.language('setting/store');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/store',this);

		if ((this.request.post['selected']) && await this.validateDelete()) {
this.request.post['selected'] = Array.isArray(this.request.post['selected'])?this.request.post['selected']:[this.request.post['selected']]
			this.load.model('setting/setting',this);

			for (let store_id of this.request.post['selected'] ) {
				await this.model_setting_store.deleteStore(store_id);

				await this.model_setting_setting.deleteSetting('config', store_id);
			}

			this.session.data['success'] = this.language.get('text_success');
await this.session.save(this.session.data);

			this.response.setRedirect(await this.url.link('setting/store', 'user_token=' + this.session.data['user_token'], true));
		}

		await this.getList();
	}

	async getList() {
		const data = {};
		url = '';

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('setting/store', 'user_token=' + this.session.data['user_token'], true)
		});

		data['add'] = await this.url.link('setting/store/add', 'user_token=' + this.session.data['user_token'], true);
		data['delete'] = await this.url.link('setting/store/delete', 'user_token=' + this.session.data['user_token'], true);

		data['stores'] = {};

		data['stores'].push({
			'store_id' : 0,
			'name'     : this.config.get('config_name') + this.language.get('text_default'),
			'url'      : this.config.get('config_secure') ? HTTPS_CATALOG : HTTP_CATALOG,
			'edit'     : await this.url.link('setting/setting', 'user_token=' + this.session.data['user_token'], true)
		});

		store_total = await this.model_setting_store.getTotalStores();

		results = await this.model_setting_store.getStores();

		for (let result of results) {
			data['stores'].push({
				'store_id' : result['store_id'],
				'name'     : result['name'],
				'url'      : result['url'],
				'edit'     : await this.url.link('setting/store/edit', 'user_token=' + this.session.data['user_token'] + '&store_id=' + result['store_id'], true)
			});
		}

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

		if ((this.request.post['selected'])) {
			data['selected'] = this.request.post['selected'];
		} else {
			data['selected'] = [];
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('setting/store_list', data));
	}

	async getForm() {
		data['text_form'] = !(this.request.get['store_id']) ? this.language.get('text_add') : this.language.get('text_edit');

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.error['url'])) {
			data['error_url'] = this.error['url'];
		} else {
			data['error_url'] = '';
		}

		if ((this.error['meta_title'])) {
			data['error_meta_title'] = this.error['meta_title'];
		} else {
			data['error_meta_title'] = '';
		}

		if ((this.error['name'])) {
			data['error_name'] = this.error['name'];
		} else {
			data['error_name'] = '';
		}

		if ((this.error['owner'])) {
			data['error_owner'] = this.error['owner'];
		} else {
			data['error_owner'] = '';
		}

		if ((this.error['address'])) {
			data['error_address'] = this.error['address'];
		} else {
			data['error_address'] = '';
		}

		if ((this.error['email'])) {
			data['error_email'] = this.error['email'];
		} else {
			data['error_email'] = '';
		}

		if ((this.error['telephone'])) {
			data['error_telephone'] = this.error['telephone'];
		} else {
			data['error_telephone'] = '';
		}

		if ((this.error['customer_group_display'])) {
			data['error_customer_group_display'] = this.error['customer_group_display'];
		} else {
			data['error_customer_group_display'] = '';
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('setting/store', 'user_token=' + this.session.data['user_token'], true)
		});

		if (!(this.request.get['store_id'])) {
			data['breadcrumbs'].push({
				'text' : this.language.get('text_settings'),
				'href' : await this.url.link('setting/store/add', 'user_token=' + this.session.data['user_token'], true)
			});
		} else {
			data['breadcrumbs'].push({
				'text' : this.language.get('text_settings'),
				'href' : await this.url.link('setting/store/edit', 'user_token=' + this.session.data['user_token'] + '&store_id=' + this.request.get['store_id'], true)
			});
		}

		if ((this.session.data['success'])) {
			data['success'] = this.session.data['success'];

			delete this.session.data['success'];
		} else {
			data['success'] = '';
		}

		if (!(this.request.get['store_id'])) {
			data['action'] = await this.url.link('setting/store/add', 'user_token=' + this.session.data['user_token'], true);
		} else {
			data['action'] = await this.url.link('setting/store/edit', 'user_token=' + this.session.data['user_token'] + '&store_id=' + this.request.get['store_id'], true);
		}

		data['cancel'] = await this.url.link('setting/store', 'user_token=' + this.session.data['user_token'], true);

		if ((this.request.get['store_id']) && (this.request.server['method'] != 'POST')) {
			this.load.model('setting/setting',this);

			store_info = await this.model_setting_setting.getSetting('config', this.request.get['store_id']);
		}

		data['user_token'] = this.session.data['user_token'];

		if ((this.request.post['config_url'])) {
			data['config_url'] = this.request.post['config_url'];
		} else if ((store_info['config_url'])) {
			data['config_url'] = store_info['config_url'];
		} else {
			data['config_url'] = '';
		}

		if ((this.request.post['config_ssl'])) {
			data['config_ssl'] = this.request.post['config_ssl'];
		} else if ((store_info['config_ssl'])) {
			data['config_ssl'] = store_info['config_ssl'];
		} else {
			data['config_ssl'] = '';
		}

		if ((this.request.post['config_meta_title'])) {
			data['config_meta_title'] = this.request.post['config_meta_title'];
		} else if ((store_info['config_meta_title'])) {
			data['config_meta_title'] = store_info['config_meta_title'];
		} else {
			data['config_meta_title'] = '';
		}

		if ((this.request.post['config_meta_description'])) {
			data['config_meta_description'] = this.request.post['config_meta_description'];
		} else if ((store_info['config_meta_description'])) {
			data['config_meta_description'] = store_info['config_meta_description'];
		} else {
			data['config_meta_description'] = '';
		}

		if ((this.request.post['config_meta_keyword'])) {
			data['config_meta_keyword'] = this.request.post['config_meta_keyword'];
		} else if ((store_info['config_meta_keyword'])) {
			data['config_meta_keyword'] = store_info['config_meta_keyword'];
		} else {
			data['config_meta_keyword'] = '';
		}

		if ((this.request.post['config_theme'])) {
			data['config_theme'] = this.request.post['config_theme'];
		} else if ((store_info['config_theme'])) {
			data['config_theme'] = store_info['config_theme'];
		} else {
			data['config_theme'] = '';
		}

		data['themes'] = {};

		// Create a new language container so we don't pollute the current one
		language = new Language(this.config.get('config_language'));

		this.load.model('setting/extension',this);

		const extensions = await this.model_setting_extension.getInstalled('theme');

		for (extensions of code) {
			await this.load.language('extension/theme/' + code, 'extension');

			data['themes'].push({
				'text'  : this.language.get('extension').get('heading_title'),
				'value' : code
			});
		}

		if ((this.request.post['config_layout_id'])) {
			data['config_layout_id'] = this.request.post['config_layout_id'];
		} else if ((store_info['config_layout_id'])) {
			data['config_layout_id'] = store_info['config_layout_id'];
		} else {
			data['config_layout_id'] = '';
		}

		this.load.model('design/layout',this);

		data['layouts'] = await this.model_design_layout.getLayouts();

		if ((this.request.post['config_name'])) {
			data['config_name'] = this.request.post['config_name'];
		} else if ((store_info['config_name'])) {
			data['config_name'] = store_info['config_name'];
		} else {
			data['config_name'] = '';
		}

		if ((this.request.post['config_owner'])) {
			data['config_owner'] = this.request.post['config_owner'];
		} else if ((store_info['config_owner'])) {
			data['config_owner'] = store_info['config_owner'];
		} else {
			data['config_owner'] = '';
		}

		if ((this.request.post['config_address'])) {
			data['config_address'] = this.request.post['config_address'];
		} else if ((store_info['config_address'])) {
			data['config_address'] = store_info['config_address'];
		} else {
			data['config_address'] = '';
		}

		if ((this.request.post['config_geocode'])) {
			data['config_geocode'] = this.request.post['config_geocode'];
		} else if ((store_info['config_geocode'])) {
			data['config_geocode'] = store_info['config_geocode'];
		} else {
			data['config_geocode'] = '';
		}

		if ((this.request.post['config_email'])) {
			data['config_email'] = this.request.post['config_email'];
		} else if ((store_info['config_email'])) {
			data['config_email'] = store_info['config_email'];
		} else {
			data['config_email'] = '';
		}

		if ((this.request.post['config_telephone'])) {
			data['config_telephone'] = this.request.post['config_telephone'];
		} else if ((store_info['config_telephone'])) {
			data['config_telephone'] = store_info['config_telephone'];
		} else {
			data['config_telephone'] = '';
		}

		if ((this.request.post['config_fax'])) {
			data['config_fax'] = this.request.post['config_fax'];
		} else if ((store_info['config_fax'])) {
			data['config_fax'] = store_info['config_fax'];
		} else {
			data['config_fax'] = '';
		}

		if ((this.request.post['config_image'])) {
			data['config_image'] = this.request.post['config_image'];
		} else if ((store_info['config_image'])) {
			data['config_image'] = store_info['config_image'];
		} else {
			data['config_image'] = '';
		}

		this.load.model('tool/image',this);

		if ((this.request.post['config_image']) && is_file(DIR_IMAGE + this.request.post['config_image'])) {
			data['thumb'] = await this.model_tool_image.resize(this.request.post['config_image'], 100, 100);
		} else if ((store_info['config_image']) && is_file(DIR_IMAGE + store_info['config_image'])) {
			data['thumb'] = await this.model_tool_image.resize(store_info['config_image'], 100, 100);
		} else {
			data['thumb'] = await this.model_tool_image.resize('no_image.png', 100, 100);
		}

		data['placeholder'] = await this.model_tool_image.resize('no_image.png', 100, 100);

		if ((this.request.post['config_open'])) {
			data['config_open'] = this.request.post['config_open'];
		} else if ((store_info['config_open'])) {
			data['config_open'] = store_info['config_open'];
		} else {
			data['config_open'] = '';
		}

		if ((this.request.post['config_comment'])) {
			data['config_comment'] = this.request.post['config_comment'];
		} else if ((store_info['config_comment'])) {
			data['config_comment'] = store_info['config_comment'];
		} else {
			data['config_comment'] = '';
		}

		this.load.model('localisation/location');

		data['locations'] = await this.model_localisation_location.getLocations();

		if ((this.request.post['config_location'])) {
			data['config_location'] = this.request.post['config_location'];
		} else if ((store_info['config_location'])) {
			data['config_location'] = store_info['config_location'];
		} else {
			data['config_location'] = {};
		}

		if ((this.request.post['config_country_id'])) {
			data['config_country_id'] = this.request.post['config_country_id'];
		} else if ((store_info['config_country_id'])) {
			data['config_country_id'] = store_info['config_country_id'];
		} else {
			data['config_country_id'] = this.config.get('config_country_id');
		}

		this.load.model('localisation/country',this);

		data['countries'] = await this.model_localisation_country.getCountries();

		if ((this.request.post['config_zone_id'])) {
			data['config_zone_id'] = this.request.post['config_zone_id'];
		} else if ((store_info['config_zone_id'])) {
			data['config_zone_id'] = store_info['config_zone_id'];
		} else {
			data['config_zone_id'] = this.config.get('config_zone_id');
		}

		if ((this.request.post['config_language'])) {
			data['config_language'] = this.request.post['config_language'];
		} else if ((store_info['config_language'])) {
			data['config_language'] = store_info['config_language'];
		} else {
			data['config_language'] = this.config.get('config_language');
		}

		this.load.model('localisation/language',this);

		data['languages'] = await this.model_localisation_language.getLanguages();

		if ((this.request.post['config_currency'])) {
			data['config_currency'] = this.request.post['config_currency'];
		} else if ((store_info['config_currency'])) {
			data['config_currency'] = store_info['config_currency'];
		} else {
			data['config_currency'] = this.config.get('config_currency');
		}

		this.load.model('localisation/currency',this);

		data['currencies'] = await this.model_localisation_currency.getCurrencies();

		if ((this.request.post['config_tax'])) {
			data['config_tax'] = this.request.post['config_tax'];
		} else if ((store_info['config_tax'])) {
			data['config_tax'] = store_info['config_tax'];
		} else {
			data['config_tax'] = '';
		}

		if ((this.request.post['config_tax_default'])) {
			data['config_tax_default'] = this.request.post['config_tax_default'];
		} else if ((store_info['config_tax_default'])) {
			data['config_tax_default'] = store_info['config_tax_default'];
		} else {
			data['config_tax_default'] = '';
		}

		if ((this.request.post['config_tax_customer'])) {
			data['config_tax_customer'] = this.request.post['config_tax_customer'];
		} else if ((store_info['config_tax_customer'])) {
			data['config_tax_customer'] = store_info['config_tax_customer'];
		} else {
			data['config_tax_customer'] = '';
		}

		if ((this.request.post['config_customer_group_id'])) {
			data['config_customer_group_id'] = this.request.post['config_customer_group_id'];
		} else if ((store_info['config_customer_group_id'])) {
			data['config_customer_group_id'] = store_info['config_customer_group_id'];
		} else {
			data['config_customer_group_id'] = '';
		}

		this.load.model('customer/customer_group',this);

		data['customer_groups'] = await this.model_customer_customer_group.getCustomerGroups();

		if ((this.request.post['config_customer_group_display'])) {
			data['config_customer_group_display'] = this.request.post['config_customer_group_display'];
		} else if ((store_info['config_customer_group_display'])) {
			data['config_customer_group_display'] = store_info['config_customer_group_display'];
		} else {
			data['config_customer_group_display'] = {};
		}

		if ((this.request.post['config_customer_price'])) {
			data['config_customer_price'] = this.request.post['config_customer_price'];
		} else if ((store_info['config_customer_price'])) {
			data['config_customer_price'] = store_info['config_customer_price'];
		} else {
			data['config_customer_price'] = '';
		}

		if ((this.request.post['config_account_id'])) {
			data['config_account_id'] = this.request.post['config_account_id'];
		} else if ((store_info['config_account_id'])) {
			data['config_account_id'] = store_info['config_account_id'];
		} else {
			data['config_account_id'] = '';
		}

		this.load.model('catalog/information',this);

		data['informations'] = await this.model_catalog_information.getInformations();

		if ((this.request.post['config_cart_weight'])) {
			data['config_cart_weight'] = this.request.post['config_cart_weight'];
		} else if ((store_info['config_cart_weight'])) {
			data['config_cart_weight'] = store_info['config_cart_weight'];
		} else {
			data['config_cart_weight'] = '';
		}

		if ((this.request.post['config_checkout_guest'])) {
			data['config_checkout_guest'] = this.request.post['config_checkout_guest'];
		} else if ((store_info['config_checkout_guest'])) {
			data['config_checkout_guest'] = store_info['config_checkout_guest'];
		} else {
			data['config_checkout_guest'] = '';
		}

		if ((this.request.post['config_checkout_id'])) {
			data['config_checkout_id'] = this.request.post['config_checkout_id'];
		} else if ((store_info['config_checkout_id'])) {
			data['config_checkout_id'] = store_info['config_checkout_id'];
		} else {
			data['config_checkout_id'] = '';
		}

		if ((this.request.post['config_order_status_id'])) {
			data['config_order_status_id'] = this.request.post['config_order_status_id'];
		} else if ((store_info['config_order_status_id'])) {
			data['config_order_status_id'] = store_info['config_order_status_id'];
		} else {
			data['config_order_status_id'] = '';
		}

		this.load.model('localisation/order_status',this);

		data['order_statuses'] = await this.model_localisation_order_status.getOrderStatuses();

		if ((this.request.post['config_stock_display'])) {
			data['config_stock_display'] = this.request.post['config_stock_display'];
		} else if ((store_info['config_stock_display'])) {
			data['config_stock_display'] = store_info['config_stock_display'];
		} else {
			data['config_stock_display'] = '';
		}

		if ((this.request.post['config_stock_checkout'])) {
			data['config_stock_checkout'] = this.request.post['config_stock_checkout'];
		} else if ((store_info['config_stock_checkout'])) {
			data['config_stock_checkout'] = store_info['config_stock_checkout'];
		} else {
			data['config_stock_checkout'] = '';
		}

		if ((this.request.post['config_logo'])) {
			data['config_logo'] = this.request.post['config_logo'];
		} else if ((store_info['config_logo'])) {
			data['config_logo'] = store_info['config_logo'];
		} else {
			data['config_logo'] = '';
		}

		if ((this.request.post['config_logo']) && is_file(DIR_IMAGE + this.request.post['config_logo'])) {
			data['logo'] = await this.model_tool_image.resize(this.request.post['config_logo'], 100, 100);
		} else if ((store_info['config_logo']) && is_file(DIR_IMAGE + store_info['config_logo'])) {
			data['logo'] = await this.model_tool_image.resize(store_info['config_logo'], 100, 100);
		} else {
			data['logo'] = await this.model_tool_image.resize('no_image.png', 100, 100);
		}

		data['placeholder'] = await this.model_tool_image.resize('no_image.png', 100, 100);

		if ((this.request.post['config_icon'])) {
			data['config_icon'] = this.request.post['config_icon'];
		} else if ((store_info['config_icon'])) {
			data['config_icon'] = store_info['config_icon'];
		} else {
			data['config_icon'] = '';
		}

		if ((this.request.post['config_icon']) && is_file(DIR_IMAGE + this.request.post['config_icon'])) {
			data['icon'] = await this.model_tool_image.resize(this.request.post['config_icon'], 100, 100);
		} else if ((store_info['config_icon']) && is_file(DIR_IMAGE + store_info['config_icon'])) {
			data['icon'] = await this.model_tool_image.resize(store_info['config_icon'], 100, 100);
		} else {
			data['icon'] = await this.model_tool_image.resize('no_image.png', 100, 100);
		}

		if ((this.request.post['config_secure'])) {
			data['config_secure'] = this.request.post['config_secure'];
		} else if ((store_info['config_secure'])) {
			data['config_secure'] = store_info['config_secure'];
		} else {
			data['config_secure'] = '';
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('setting/store_form', data));
	}

	async validateForm() {
		if (!await this.user.hasPermission('modify', 'setting/store')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		if (!this.request.post['config_url']) {
			this.error['url'] = this.language.get('error_url');
		}

		if (!this.request.post['config_meta_title']) {
			this.error['meta_title'] = this.language.get('error_meta_title');
		}

		if (!this.request.post['config_name']) {
			this.error['name'] = this.language.get('error_name');
		}

		if ((oc_strlen(this.request.post['config_owner']) < 3) || (oc_strlen(this.request.post['config_owner']) > 64)) {
			this.error['owner'] = this.language.get('error_owner');
		}

		if ((oc_strlen(this.request.post['config_address']) < 3) || (oc_strlen(this.request.post['config_address']) > 256)) {
			this.error['address'] = this.language.get('error_address');
		}

		if ((oc_strlen(this.request.post['config_email']) > 96) || !filter_var(this.request.post['config_email'], FILTER_VALIDATE_EMAIL)) {
			this.error['email'] = this.language.get('error_email');
		}

		if ((oc_strlen(this.request.post['config_telephone']) < 3) || (oc_strlen(this.request.post['config_telephone']) > 32)) {
			this.error['telephone'] = this.language.get('error_telephone');
		}

		if ((this.request.post['config_customer_group_display']) && !in_array(this.request.post['config_customer_group_id'], this.request.post['config_customer_group_display'])) {
			this.error['customer_group_display'] = this.language.get('error_customer_group_display');
		}

		if (Object.keys(this.error).length && !(this.error['warning'])) {
			this.error['warning'] = this.language.get('error_warning');
		}

		return Object.keys(this.error).length?false:true
	}

	async validateDelete() {
		if (!await this.user.hasPermission('modify', 'setting/store')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		this.load.model('sale/order',this);
		this.request.post['selected']  = Array.isArray(this.request.post['selected'])?this.request.post['selected']:[this.request.post['selected']];

		for (let store_id of this.request.post['selected'] ) {
			if (!store_id) {
				this.error['warning'] = this.language.get('error_default');
			}

			store_total = await this.model_sale_order.getTotalOrdersByStoreId(store_id);

			if (store_total) {
				this.error['warning'] = sprintf(this.language.get('error_store'), store_total);
			}
		}

		return Object.keys(this.error).length?false:true
	}
}
