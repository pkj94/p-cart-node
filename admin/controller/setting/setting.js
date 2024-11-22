module.exports = class ControllerSettingSetting extends Controller {
	error = {};

	async index() {
		await this.load.language('setting/setting');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/setting',this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('config', this.request.post);

//			if (this.config.get('config_currency_auto')) {
//				this.load.model('localisation/currency',this);
//
//				await this.model_localisation_currency.refresh();
//			}

			this.session.data['success'] = this.language.get('text_success');

			this.response.setRedirect(await this.url.link('setting/store', 'user_token=' + this.session.data['user_token'], true));
		}
		
		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
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

		if ((this.error['meta_title'])) {
			data['error_meta_title'] = this.error['meta_title'];
		} else {
			data['error_meta_title'] = '';
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

		if ((this.error['customer_group_display'])) {
			data['error_customer_group_display'] = this.error['customer_group_display'];
		} else {
			data['error_customer_group_display'] = '';
		}

		if ((this.error['login_attempts'])) {
			data['error_login_attempts'] = this.error['login_attempts'];
		} else {
			data['error_login_attempts'] = '';
		}

		if ((this.error['voucher_min'])) {
			data['error_voucher_min'] = this.error['voucher_min'];
		} else {
			data['error_voucher_min'] = '';
		}

		if ((this.error['voucher_max'])) {
			data['error_voucher_max'] = this.error['voucher_max'];
		} else {
			data['error_voucher_max'] = '';
		}

		if ((this.error['processing_status'])) {
			data['error_processing_status'] = this.error['processing_status'];
		} else {
			data['error_processing_status'] = '';
		}

		if ((this.error['complete_status'])) {
			data['error_complete_status'] = this.error['complete_status'];
		} else {
			data['error_complete_status'] = '';
		}

		if ((this.error['log'])) {
			data['error_log'] = this.error['log'];
		} else {
			data['error_log'] = '';
		}

		if ((this.error['limit_admin'])) {
			data['error_limit_admin'] = this.error['limit_admin'];
		} else {
			data['error_limit_admin'] = '';
		}

		if ((this.error['encryption'])) {
			data['error_encryption'] = this.error['encryption'];
		} else {
			data['error_encryption'] = '';
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('text_stores'),
			'href' : await this.url.link('setting/store', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('setting/setting', 'user_token=' + this.session.data['user_token'], true)
		});

		if ((this.session.data['success'])) {
			data['success'] = this.session.data['success'];

			delete this.session.data['success']);
		} else {
			data['success'] = '';
		}

		data['action'] = await this.url.link('setting/setting', 'user_token=' + this.session.data['user_token'], true);

		data['cancel'] = await this.url.link('setting/store', 'user_token=' + this.session.data['user_token'], true);

		data['user_token'] = this.session.data['user_token'];

		if ((this.request.post['config_meta_title'])) {
			data['config_meta_title'] = this.request.post['config_meta_title'];
		} else {
			data['config_meta_title'] = this.config.get('config_meta_title');
		}

		if ((this.request.post['config_meta_description'])) {
			data['config_meta_description'] = this.request.post['config_meta_description'];
		} else {
			data['config_meta_description'] = this.config.get('config_meta_description');
		}

		if ((this.request.post['config_meta_keyword'])) {
			data['config_meta_keyword'] = this.request.post['config_meta_keyword'];
		} else {
			data['config_meta_keyword'] = this.config.get('config_meta_keyword');
		}

		if ((this.request.post['config_theme'])) {
			data['config_theme'] = this.request.post['config_theme'];
		} else {
			data['config_theme'] = this.config.get('config_theme');
		}

		if (this.request.server['HTTPS']) {
			data['store_url'] = HTTPS_CATALOG;
		} else {
			data['store_url'] = HTTP_CATALOG;
		}

		data['themes'] = {};

		this.load.model('setting/extension',this);

		extensions = await this.model_setting_extension.getInstalled('theme');

		for (extensions of code) {
			await this.load.language('extension/theme/' + code, 'extension');
			
			data['themes'].push({
				'text'  : this.language.get('extension').get('heading_title'),
				'value' : code
			});
		}
			
		if ((this.request.post['config_layout_id'])) {
			data['config_layout_id'] = this.request.post['config_layout_id'];
		} else {
			data['config_layout_id'] = this.config.get('config_layout_id');
		}

		this.load.model('design/layout',this);

		data['layouts'] = await this.model_design_layout.getLayouts();

		if ((this.request.post['config_name'])) {
			data['config_name'] = this.request.post['config_name'];
		} else {
			data['config_name'] = this.config.get('config_name');
		}

		if ((this.request.post['config_owner'])) {
			data['config_owner'] = this.request.post['config_owner'];
		} else {
			data['config_owner'] = this.config.get('config_owner');
		}

		if ((this.request.post['config_address'])) {
			data['config_address'] = this.request.post['config_address'];
		} else {
			data['config_address'] = this.config.get('config_address');
		}

		if ((this.request.post['config_geocode'])) {
			data['config_geocode'] = this.request.post['config_geocode'];
		} else {
			data['config_geocode'] = this.config.get('config_geocode');
		}

		if ((this.request.post['config_email'])) {
			data['config_email'] = this.request.post['config_email'];
		} else {
			data['config_email'] = this.config.get('config_email');
		}

		if ((this.request.post['config_telephone'])) {
			data['config_telephone'] = this.request.post['config_telephone'];
		} else {
			data['config_telephone'] = this.config.get('config_telephone');
		}
		
		if ((this.request.post['config_fax'])) {
			data['config_fax'] = this.request.post['config_fax'];
		} else {
			data['config_fax'] = this.config.get('config_fax');
		}
		
		if ((this.request.post['config_image'])) {
			data['config_image'] = this.request.post['config_image'];
		} else {
			data['config_image'] = this.config.get('config_image');
		}

		this.load.model('tool/image',this);

		if ((this.request.post['config_image']) && is_file(DIR_IMAGE + this.request.post['config_image'])) {
			data['thumb'] = await this.model_tool_image.resize(this.request.post['config_image'], 100, 100);
		} else if (this.config.get('config_image') && is_file(DIR_IMAGE + this.config.get('config_image'))) {
			data['thumb'] = await this.model_tool_image.resize(this.config.get('config_image'), 100, 100);
		} else {
			data['thumb'] = await this.model_tool_image.resize('no_image.png', 100, 100);
		}

		data['placeholder'] = await this.model_tool_image.resize('no_image.png', 100, 100);

		if ((this.request.post['config_open'])) {
			data['config_open'] = this.request.post['config_open'];
		} else {
			data['config_open'] = this.config.get('config_open');
		}

		if ((this.request.post['config_comment'])) {
			data['config_comment'] = this.request.post['config_comment'];
		} else {
			data['config_comment'] = this.config.get('config_comment');
		}

		this.load.model('localisation/location');

		data['locations'] = await this.model_localisation_location.getLocations();

		if ((this.request.post['config_location'])) {
			data['config_location'] = this.request.post['config_location'];
		} else if (this.config.get('config_location')) {
			data['config_location'] = this.config.get('config_location');
		} else {
			data['config_location'] = {};
		}

		if ((this.request.post['config_country_id'])) {
			data['config_country_id'] = this.request.post['config_country_id'];
		} else {
			data['config_country_id'] = this.config.get('config_country_id');
		}

		this.load.model('localisation/country');

		data['countries'] = await this.model_localisation_country.getCountries();

		if ((this.request.post['config_zone_id'])) {
			data['config_zone_id'] = this.request.post['config_zone_id'];
		} else {
			data['config_zone_id'] = this.config.get('config_zone_id');
		}

		if ((this.request.post['config_timezone'])) {
			data['config_timezone'] = this.request.post['config_timezone'];
		} else if (this.config.has('config_timezone')) {
			data['config_timezone'] = this.config.get('config_timezone');
		} else {
			data['config_timezone'] = 'UTC';
		}
		// Set Time Zone
		data['timezones'] = {};

		timestamp = time();

		timezones = timezone_identifiers_list();

		for(timezones of timezone) {
			date_default_timezone_set(timezone);
			hour = ' (' + date('P', timestamp) + ')';
			data['timezones'].push({
				'text'  : timezone + hour,
				'value' : timezone
			});
		}

		date_default_timezone_set(this.config.get('config_timezone'));

		if ((this.request.post['config_language'])) {
			data['config_language'] = this.request.post['config_language'];
		} else {
			data['config_language'] = this.config.get('config_language');
		}

		this.load.model('localisation/language',this);

		data['languages'] = await this.model_localisation_language.getLanguages();

		if ((this.request.post['config_admin_language'])) {
			data['config_admin_language'] = this.request.post['config_admin_language'];
		} else {
			data['config_admin_language'] = this.config.get('config_admin_language');
		}

		if ((this.request.post['config_currency'])) {
			data['config_currency'] = this.request.post['config_currency'];
		} else {
			data['config_currency'] = this.config.get('config_currency');
		}

		if ((this.request.post['config_currency_auto'])) {
			data['config_currency_auto'] = this.request.post['config_currency_auto'];
		} else {
			data['config_currency_auto'] = this.config.get('config_currency_auto');
		}

		if ((this.request.post['config_currency_engine'])) {
			data['config_currency_engine'] = this.request.post['config_currency_engine'];
		} else {
			data['config_currency_engine'] = this.config.get('config_currency_engine');
		}

		this.load.model('localisation/currency',this);

		data['currencies'] = await this.model_localisation_currency.getCurrencies();

		data['currency_engines'] = {};

		extension_codes = await this.model_setting_extension.getInstalled('currency');

		for (extension_codes of extension_code) {
			if (this.config.get('currency_' + extension_code + '_status')) {
				await this.load.language('extension/currency/' + extension_code, 'currency_engine');
				data['currency_engines'].push({
					'text'  : this.language.get('currency_engine').get('heading_title'),
					'value' : extension_code
				});
			}
		}

		if ((this.request.post['config_length_class_id'])) {
			data['config_length_class_id'] = this.request.post['config_length_class_id'];
		} else {
			data['config_length_class_id'] = this.config.get('config_length_class_id');
		}

		this.load.model('localisation/length_class',this);

		data['length_classes'] = await this.model_localisation_length_class.getLengthClasses();

		if ((this.request.post['config_weight_class_id'])) {
			data['config_weight_class_id'] = this.request.post['config_weight_class_id'];
		} else {
			data['config_weight_class_id'] = this.config.get('config_weight_class_id');
		}

		this.load.model('localisation/weight_class',this);

		data['weight_classes'] = await this.model_localisation_weight_class.getWeightClasses();

		if ((this.request.post['config_limit_admin'])) {
			data['config_limit_admin'] = this.request.post['config_limit_admin'];
		} else {
			data['config_limit_admin'] = Number(this.config.get('config_limit_admin'));
		}

		if ((this.request.post['config_product_count'])) {
			data['config_product_count'] = this.request.post['config_product_count'];
		} else {
			data['config_product_count'] = this.config.get('config_product_count');
		}

		if ((this.request.post['config_review_status'])) {
			data['config_review_status'] = this.request.post['config_review_status'];
		} else {
			data['config_review_status'] = this.config.get('config_review_status');
		}

		if ((this.request.post['config_review_guest'])) {
			data['config_review_guest'] = this.request.post['config_review_guest'];
		} else {
			data['config_review_guest'] = this.config.get('config_review_guest');
		}

		if ((this.request.post['config_voucher_min'])) {
			data['config_voucher_min'] = this.request.post['config_voucher_min'];
		} else {
			data['config_voucher_min'] = this.config.get('config_voucher_min');
		}

		if ((this.request.post['config_voucher_max'])) {
			data['config_voucher_max'] = this.request.post['config_voucher_max'];
		} else {
			data['config_voucher_max'] = this.config.get('config_voucher_max');
		}

		if ((this.request.post['config_tax'])) {
			data['config_tax'] = this.request.post['config_tax'];
		} else {
			data['config_tax'] = this.config.get('config_tax');
		}

		if ((this.request.post['config_tax_default'])) {
			data['config_tax_default'] = this.request.post['config_tax_default'];
		} else {
			data['config_tax_default'] = this.config.get('config_tax_default');
		}

		if ((this.request.post['config_tax_customer'])) {
			data['config_tax_customer'] = this.request.post['config_tax_customer'];
		} else {
			data['config_tax_customer'] = this.config.get('config_tax_customer');
		}

		if ((this.request.post['config_customer_online'])) {
			data['config_customer_online'] = this.request.post['config_customer_online'];
		} else {
			data['config_customer_online'] = this.config.get('config_customer_online');
		}

		if ((this.request.post['config_customer_activity'])) {
			data['config_customer_activity'] = this.request.post['config_customer_activity'];
		} else {
			data['config_customer_activity'] = this.config.get('config_customer_activity');
		}

		if ((this.request.post['config_customer_search'])) {
			data['config_customer_search'] = this.request.post['config_customer_search'];
		} else {
			data['config_customer_search'] = this.config.get('config_customer_search');
		}

		if ((this.request.post['config_customer_group_id'])) {
			data['config_customer_group_id'] = this.request.post['config_customer_group_id'];
		} else {
			data['config_customer_group_id'] = this.config.get('config_customer_group_id');
		}

		this.load.model('customer/customer_group',this);

		data['customer_groups'] = await this.model_customer_customer_group.getCustomerGroups();

		if ((this.request.post['config_customer_group_display'])) {
			data['config_customer_group_display'] = this.request.post['config_customer_group_display'];
		} else if (this.config.get('config_customer_group_display')) {
			data['config_customer_group_display'] = this.config.get('config_customer_group_display');
		} else {
			data['config_customer_group_display'] = {};
		}

		if ((this.request.post['config_customer_price'])) {
			data['config_customer_price'] = this.request.post['config_customer_price'];
		} else {
			data['config_customer_price'] = this.config.get('config_customer_price');
		}

		if ((this.request.post['config_login_attempts'])) {
			data['config_login_attempts'] = this.request.post['config_login_attempts'];
		} else if (this.config.has('config_login_attempts')) {
			data['config_login_attempts'] = this.config.get('config_login_attempts');
		} else {
			data['config_login_attempts'] = 5;
		}

		if ((this.request.post['config_account_id'])) {
			data['config_account_id'] = this.request.post['config_account_id'];
		} else {
			data['config_account_id'] = this.config.get('config_account_id');
		}

		this.load.model('catalog/information');

		data['informations'] = await this.model_catalog_information.getInformations();

		if ((this.request.post['config_cart_weight'])) {
			data['config_cart_weight'] = this.request.post['config_cart_weight'];
		} else {
			data['config_cart_weight'] = this.config.get('config_cart_weight');
		}

		if ((this.request.post['config_checkout_guest'])) {
			data['config_checkout_guest'] = this.request.post['config_checkout_guest'];
		} else {
			data['config_checkout_guest'] = this.config.get('config_checkout_guest');
		}

		if ((this.request.post['config_checkout_id'])) {
			data['config_checkout_id'] = this.request.post['config_checkout_id'];
		} else {
			data['config_checkout_id'] = this.config.get('config_checkout_id');
		}

		if ((this.request.post['config_invoice_prefix'])) {
			data['config_invoice_prefix'] = this.request.post['config_invoice_prefix'];
		} else if (this.config.get('config_invoice_prefix')) {
			data['config_invoice_prefix'] = this.config.get('config_invoice_prefix');
		} else {
			data['config_invoice_prefix'] = 'INV-' + date('Y') + '-00';
		}

		if ((this.request.post['config_order_status_id'])) {
			data['config_order_status_id'] = this.request.post['config_order_status_id'];
		} else {
			data['config_order_status_id'] = this.config.get('config_order_status_id');
		}

		if ((this.request.post['config_processing_status'])) {
			data['config_processing_status'] = this.request.post['config_processing_status'];
		} else if (this.config.get('config_processing_status')) {
			data['config_processing_status'] = this.config.get('config_processing_status');
		} else {
			data['config_processing_status'] = {};
		}

		if ((this.request.post['config_complete_status'])) {
			data['config_complete_status'] = this.request.post['config_complete_status'];
		} else if (this.config.get('config_complete_status')) {
			data['config_complete_status'] = this.config.get('config_complete_status');
		} else {
			data['config_complete_status'] = {};
		}

		if ((this.request.post['config_fraud_status_id'])) {
			data['config_fraud_status_id'] = this.request.post['config_fraud_status_id'];
		} else {
			data['config_fraud_status_id'] = this.config.get('config_fraud_status_id');
		}

		this.load.model('localisation/order_status');

		data['order_statuses'] = await this.model_localisation_order_status.getOrderStatuses();

		if ((this.request.post['config_api_id'])) {
			data['config_api_id'] = this.request.post['config_api_id'];
		} else {
			data['config_api_id'] = this.config.get('config_api_id');
		}

		this.load.model('user/api');

		data['apis'] = await this.model_user_api.getApis();

		if ((this.request.post['config_stock_display'])) {
			data['config_stock_display'] = this.request.post['config_stock_display'];
		} else {
			data['config_stock_display'] = this.config.get('config_stock_display');
		}

		if ((this.request.post['config_stock_warning'])) {
			data['config_stock_warning'] = this.request.post['config_stock_warning'];
		} else {
			data['config_stock_warning'] = this.config.get('config_stock_warning');
		}

		if ((this.request.post['config_stock_checkout'])) {
			data['config_stock_checkout'] = this.request.post['config_stock_checkout'];
		} else {
			data['config_stock_checkout'] = this.config.get('config_stock_checkout');
		}

		if ((this.request.post['config_affiliate_group_id'])) {
			data['config_affiliate_group_id'] = this.request.post['config_affiliate_group_id'];
		} else {
			data['config_affiliate_group_id'] = this.config.get('config_affiliate_group_id');
		}

		if ((this.request.post['config_affiliate_approval'])) {
			data['config_affiliate_approval'] = this.request.post['config_affiliate_approval'];
		} else if (this.config.has('config_affiliate_approval')) {
			data['config_affiliate_approval'] = this.config.get('config_affiliate_approval');
		} else {
			data['config_affiliate_approval'] = '';
		}

		if ((this.request.post['config_affiliate_auto'])) {
			data['config_affiliate_auto'] = this.request.post['config_affiliate_auto'];
		} else if (this.config.has('config_affiliate_auto')) {
			data['config_affiliate_auto'] = this.config.get('config_affiliate_auto');
		} else {
			data['config_affiliate_auto'] = '';
		}

		if ((this.request.post['config_affiliate_commission'])) {
			data['config_affiliate_commission'] = this.request.post['config_affiliate_commission'];
		} else if (this.config.has('config_affiliate_commission')) {
			data['config_affiliate_commission'] = this.config.get('config_affiliate_commission');
		} else {
			data['config_affiliate_commission'] = '5.00';
		}

		if ((this.request.post['config_affiliate_id'])) {
			data['config_affiliate_id'] = this.request.post['config_affiliate_id'];
		} else {
			data['config_affiliate_id'] = this.config.get('config_affiliate_id');
		}

		if ((this.request.post['config_return_id'])) {
			data['config_return_id'] = this.request.post['config_return_id'];
		} else {
			data['config_return_id'] = this.config.get('config_return_id');
		}

		if ((this.request.post['config_return_status_id'])) {
			data['config_return_status_id'] = this.request.post['config_return_status_id'];
		} else {
			data['config_return_status_id'] = this.config.get('config_return_status_id');
		}

		this.load.model('localisation/return_status');

		data['return_statuses'] = await this.model_localisation_return_status.getReturnStatuses();

		if ((this.request.post['config_captcha'])) {
			data['config_captcha'] = this.request.post['config_captcha'];
		} else {
			data['config_captcha'] = this.config.get('config_captcha');
		}
		
		this.load.model('setting/extension',this);

		data['captchas'] = {};

		// Get a list of installed captchas
		extensions = await this.model_setting_extension.getInstalled('captcha');

		for (extensions of code) {
			await this.load.language('extension/captcha/' + code, 'extension');

			if (this.config.get('captcha_' + code + '_status')) {
				data['captchas'].push({
					'text'  : this.language.get('extension').get('heading_title'),
					'value' : code
				});
			}
		}		

		if ((this.request.post['config_captcha_page'])) {
			data['config_captcha_page'] = this.request.post['config_captcha_page'];
		} else if (this.config.has('config_captcha_page')) {
		   	data['config_captcha_page'] = this.config.get('config_captcha_page');
		} else {
			data['config_captcha_page'] = {};
		}

		data['captcha_pages'] = {};

		data['captcha_pages'].push({
			'text'  : this.language.get('text_register'),
			'value' : 'register'
		});
		
		data['captcha_pages'].push({
			'text'  : this.language.get('text_guest'),
			'value' : 'guest'
		});
		
		data['captcha_pages'].push({
			'text'  : this.language.get('text_review'),
			'value' : 'review'
		});

		data['captcha_pages'].push({
			'text'  : this.language.get('text_return'),
			'value' : 'return'
		});

		data['captcha_pages'].push({
			'text'  : this.language.get('text_contact'),
			'value' : 'contact'
		});

		if ((this.request.post['config_logo'])) {
			data['config_logo'] = this.request.post['config_logo'];
		} else {
			data['config_logo'] = this.config.get('config_logo');
		}

		if ((this.request.post['config_logo']) && is_file(DIR_IMAGE + this.request.post['config_logo'])) {
			data['logo'] = await this.model_tool_image.resize(this.request.post['config_logo'], 100, 100);
		} else if (this.config.get('config_logo') && is_file(DIR_IMAGE + this.config.get('config_logo'))) {
			data['logo'] = await this.model_tool_image.resize(this.config.get('config_logo'), 100, 100);
		} else {
			data['logo'] = await this.model_tool_image.resize('no_image.png', 100, 100);
		}

		if ((this.request.post['config_icon'])) {
			data['config_icon'] = this.request.post['config_icon'];
		} else {
			data['config_icon'] = this.config.get('config_icon');
		}

		if ((this.request.post['config_icon']) && is_file(DIR_IMAGE + this.request.post['config_icon'])) {
			data['icon'] = await this.model_tool_image.resize(this.request.post['config_icon'], 100, 100);
		} else if (this.config.get('config_icon') && is_file(DIR_IMAGE + this.config.get('config_icon'))) {
			data['icon'] = await this.model_tool_image.resize(this.config.get('config_icon'), 100, 100);
		} else {
			data['icon'] = await this.model_tool_image.resize('no_image.png', 100, 100);
		}

		if ((this.request.post['config_mail_engine'])) {
			data['config_mail_engine'] = this.request.post['config_mail_engine'];
		} else {
			data['config_mail_engine'] = this.config.get('config_mail_engine');
		}

		if ((this.request.post['config_mail_parameter'])) {
			data['config_mail_parameter'] = this.request.post['config_mail_parameter'];
		} else {
			data['config_mail_parameter'] = this.config.get('config_mail_parameter');
		}

		if ((this.request.post['config_mail_smtp_hostname'])) {
			data['config_mail_smtp_hostname'] = this.request.post['config_mail_smtp_hostname'];
		} else {
			data['config_mail_smtp_hostname'] = this.config.get('config_mail_smtp_hostname');
		}

		if ((this.request.post['config_mail_smtp_username'])) {
			data['config_mail_smtp_username'] = this.request.post['config_mail_smtp_username'];
		} else {
			data['config_mail_smtp_username'] = this.config.get('config_mail_smtp_username');
		}

		if ((this.request.post['config_mail_smtp_password'])) {
			data['config_mail_smtp_password'] = this.request.post['config_mail_smtp_password'];
		} else {
			data['config_mail_smtp_password'] = this.config.get('config_mail_smtp_password');
		}

		if ((this.request.post['config_mail_smtp_port'])) {
			data['config_mail_smtp_port'] = this.request.post['config_mail_smtp_port'];
		} else if (this.config.has('config_mail_smtp_port')) {
			data['config_mail_smtp_port'] = this.config.get('config_mail_smtp_port');
		} else {
			data['config_mail_smtp_port'] = 25;
		}

		if ((this.request.post['config_mail_smtp_timeout'])) {
			data['config_mail_smtp_timeout'] = this.request.post['config_mail_smtp_timeout'];
		} else if (this.config.has('config_mail_smtp_timeout')) {
			data['config_mail_smtp_timeout'] = this.config.get('config_mail_smtp_timeout');
		} else {
			data['config_mail_smtp_timeout'] = 5;
		}

		if ((this.request.post['config_mail_alert'])) {
			data['config_mail_alert'] = this.request.post['config_mail_alert'];
		} else if (this.config.has('config_mail_alert')) {
		   	data['config_mail_alert'] = this.config.get('config_mail_alert');
		} else {
			data['config_mail_alert'] = {};
		}

		data['mail_alerts'] = {};

		data['mail_alerts'].push({
			'text'  : this.language.get('text_mail_account'),
			'value' : 'account'
		});

		data['mail_alerts'].push({
			'text'  : this.language.get('text_mail_affiliate'),
			'value' : 'affiliate'
		});

		data['mail_alerts'].push({
			'text'  : this.language.get('text_mail_order'),
			'value' : 'order'
		});

		data['mail_alerts'].push({
			'text'  : this.language.get('text_mail_review'),
			'value' : 'review'
		});

		if ((this.request.post['config_mail_alert_email'])) {
			data['config_mail_alert_email'] = this.request.post['config_mail_alert_email'];
		} else {
			data['config_mail_alert_email'] = this.config.get('config_mail_alert_email');
		}
		
		if ((this.request.post['config_secure'])) {
			data['config_secure'] = this.request.post['config_secure'];
		} else {
			data['config_secure'] = this.config.get('config_secure');
		}

		if ((this.request.post['config_shared'])) {
			data['config_shared'] = this.request.post['config_shared'];
		} else {
			data['config_shared'] = this.config.get('config_shared');
		}

		if ((this.request.post['config_robots'])) {
			data['config_robots'] = this.request.post['config_robots'];
		} else {
			data['config_robots'] = this.config.get('config_robots');
		}

		if ((this.request.post['config_seo_url'])) {
			data['config_seo_url'] = this.request.post['config_seo_url'];
		} else {
			data['config_seo_url'] = this.config.get('config_seo_url');
		}

		if ((this.request.post['config_file_max_size'])) {
			data['config_file_max_size'] = this.request.post['config_file_max_size'];
		} else if (this.config.get('config_file_max_size')) {
			data['config_file_max_size'] = this.config.get('config_file_max_size');
		} else {
			data['config_file_max_size'] = 300000;
		}

		if ((this.request.post['config_file_ext_allowed'])) {
			data['config_file_ext_allowed'] = this.request.post['config_file_ext_allowed'];
		} else {
			data['config_file_ext_allowed'] = this.config.get('config_file_ext_allowed');
		}

		if ((this.request.post['config_file_mime_allowed'])) {
			data['config_file_mime_allowed'] = this.request.post['config_file_mime_allowed'];
		} else {
			data['config_file_mime_allowed'] = this.config.get('config_file_mime_allowed');
		}

		if ((this.request.post['config_maintenance'])) {
			data['config_maintenance'] = this.request.post['config_maintenance'];
		} else {
			data['config_maintenance'] = this.config.get('config_maintenance');
		}

		if ((this.request.post['config_password'])) {
			data['config_password'] = this.request.post['config_password'];
		} else {
			data['config_password'] = this.config.get('config_password');
		}

		if ((this.request.post['config_encryption'])) {
			data['config_encryption'] = this.request.post['config_encryption'];
		} else {
			data['config_encryption'] = this.config.get('config_encryption');
		}

		if ((this.request.post['config_compression'])) {
			data['config_compression'] = this.request.post['config_compression'];
		} else {
			data['config_compression'] = this.config.get('config_compression');
		}

		if ((this.request.post['config_error_display'])) {
			data['config_error_display'] = this.request.post['config_error_display'];
		} else {
			data['config_error_display'] = this.config.get('config_error_display');
		}

		if ((this.request.post['config_error_log'])) {
			data['config_error_log'] = this.request.post['config_error_log'];
		} else {
			data['config_error_log'] = this.config.get('config_error_log');
		}

		if ((this.request.post['config_error_filename'])) {
			data['config_error_filename'] = this.request.post['config_error_filename'];
		} else {
			data['config_error_filename'] = this.config.get('config_error_filename');
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('setting/setting', data));
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'setting/setting')) {
			this.error['warning'] = this.language.get('error_permission');
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

		if (!this.request.post['config_limit_admin']) {
			this.error['limit_admin'] = this.language.get('error_limit');
		}

		if (this.request.post['config_login_attempts'] < 1) {
			this.error['login_attempts'] = this.language.get('error_login_attempts');
		}

		if (!this.request.post['config_voucher_min']) {
			this.error['voucher_min'] = this.language.get('error_voucher_min');
		}

		if (!this.request.post['config_voucher_max']) {
			this.error['voucher_max'] = this.language.get('error_voucher_max');
		}

		if (!(this.request.post['config_processing_status'])) {
			this.error['processing_status'] = this.language.get('error_processing_status');
		}

		if (!(this.request.post['config_complete_status'])) {
			this.error['complete_status'] = this.language.get('error_complete_status');
		}
		
		if (!this.request.post['config_error_filename']) {
			this.error['log'] = this.language.get('error_log_required');
		} else if (preg_match('/\.\.[\/\\\]?/', this.request.post['config_error_filename'])) {
			this.error['log'] = this.language.get('error_log_invalid');
		} else if (substr(this.request.post['config_error_filename'], strrpos(this.request.post['config_error_filename'], '.')) != '.log') {
			this.error['log'] = this.language.get('error_log_extension');
		}
		
		if ((oc_strlen(this.request.post['config_encryption']) < 32) || (oc_strlen(this.request.post['config_encryption']) > 1024)) {
			this.error['encryption'] = this.language.get('error_encryption');
		}

		if (Object.keys(this.error).length && !(this.error['warning'])) {
			this.error['warning'] = this.language.get('error_warning');
		}

		return Object.keys(this.error).length?false:true
	}
	
	async theme() {
		if (this.request.server['HTTPS']) {
			server = HTTPS_CATALOG;
		} else {
			server = HTTP_CATALOG;
		}
		
		// This is only here for compatibility with old themes.
		if (this.request.get['theme'] == 'theme_default') {
			theme = this.config.get('theme_default_directory');
		} else {
			theme = basename(this.request.get['theme']);
		}
		
		if (is_file(DIR_CATALOG + 'view/theme/' + theme + '/image/' + theme + '.png')) {
			this.response.setOutput(server + 'catalog/view/theme/' + theme + '/image/' + theme + '.png');
		} else {
			this.response.setOutput(server + 'image/no_image.png');
		}
	}	
}
