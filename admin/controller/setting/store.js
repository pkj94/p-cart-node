const sprintf = require("locutus/php/strings/sprintf");
const fs = require('fs');
module.exports = class StoreController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('setting/store');

		this.document.setTitle(this.language.get('heading_title'));

		let url = '';

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': this.url.link('setting/store', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['add'] = this.url.link('setting/store.form', 'user_token=' + this.session.data['user_token'] + url);
		data['delete'] = this.url.link('setting/store.delete', 'user_token=' + this.session.data['user_token']);

		data['list'] = await this.getList();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('setting/store', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('setting/store');

		this.response.setOutput(await this.getList());
	}

	/**
	 * @return string
	 */
	async getList() {
		const data = {};
		let page = 1;
		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		}

		let url = '';

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['action'] = this.url.link('setting/store.list', 'user_token=' + this.session.data['user_token'] + url);

		data['stores'] = [];

		let store_total = 0;

		if (page == 1) {
			store_total = 1;

			data['stores'].push({
				'store_id': 0,
				'name': this.config.get('config_name') + this.language.get('text_default'),
				'url': HTTP_CATALOG,
				'edit': this.url.link('setting/setting', 'user_token=' + this.session.data['user_token'])
			});
		}

		this.load.model('setting/store', this);

		this.load.model('setting/setting', this);

		store_total + await this.model_setting_store.getTotalStores();

		const results = await this.model_setting_store.getStores();

		for (let result of results) {
			data['stores'].push({
				'store_id': result['store_id'],
				'name': result['name'],
				'url': result['url'],
				'edit': this.url.link('setting/store.form', 'user_token=' + this.session.data['user_token'] + '&store_id=' + result['store_id'])
			});
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': store_total,
			'page': page,
			'limit': this.config.get('config_pagination_admin'),
			'url': this.url.link('setting/store.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (store_total) ? ((page - 1) * Number(this.config.get('config_pagination_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_pagination_admin'))) > (store_total - this.config.get('config_pagination_admin'))) ? store_total : (((page - 1) * Number(this.config.get('config_pagination_admin'))) + this.config.get('config_pagination_admin')), store_total, Math.ceil(store_total / this.config.get('config_pagination_admin')));

		return await this.load.view('setting/store_list', data);
	}

	/**
	 * @return void
	 */
	async form() {
		await this.load.language('setting/store');

		this.document.setTitle(this.language.get('heading_title'));

		data['text_form'] = !(this.request.get['store_id']) ? this.language.get('text_add') : this.language.get('text_edit');

		let url = '';

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': this.url.link('setting/store', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_settings'),
			'href': this.url.link('setting/store.form', 'user_token=' + this.session.data['user_token'] + ((this.request.post['store_id']) ? '&store_id=' + this.request.get['store_id'] : '') + url)
		});

		data['save'] = this.url.link('setting/store.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = this.url.link('setting/store', 'user_token=' + this.session.data['user_token']);
		let store_info;
		if ((this.request.get['store_id'])) {
			this.load.model('setting/setting', this);
			store_info = await this.model_setting_setting.getSetting('config', this.request.get['store_id']);
		}

		if ((this.request.get['store_id'])) {
			data['store_id'] = this.request.get['store_id'];
		} else {
			data['store_id'] = 0;
		}

		if ((store_info['config_url'])) {
			data['config_url'] = store_info['config_url'];
		} else {
			data['config_url'] = '';
		}

		if ((store_info['config_meta_title'])) {
			data['config_meta_title'] = store_info['config_meta_title'];
		} else {
			data['config_meta_title'] = '';
		}

		if ((store_info['config_meta_description'])) {
			data['config_meta_description'] = store_info['config_meta_description'];
		} else {
			data['config_meta_description'] = '';
		}

		if ((store_info['config_meta_keyword'])) {
			data['config_meta_keyword'] = store_info['config_meta_keyword'];
		} else {
			data['config_meta_keyword'] = '';
		}

		data['themes'] = [];

		this.load.model('setting/extension', this);

		const extensions = await this.model_setting_extension.getExtensionsByType('theme');

		for (let extension of extensions) {
			await this.load.language('extension/' + extension['extension'] + '/theme/' + extension['code'], 'extension');

			data['themes'].push({
				'text': this.language.get('extension_heading_title'),
				'value': extension['code']
			});
		}

		if ((store_info['config_theme'])) {
			data['config_theme'] = store_info['config_theme'];
		} else {
			data['config_theme'] = '';
		}

		this.load.model('design/layout', this);

		data['layouts'] = await this.model_design_layout.getLayouts();

		if ((store_info['config_layout_id'])) {
			data['config_layout_id'] = store_info['config_layout_id'];
		} else {
			data['config_layout_id'] = '';
		}

		if ((store_info['config_name'])) {
			data['config_name'] = store_info['config_name'];
		} else {
			data['config_name'] = '';
		}

		if ((store_info['config_owner'])) {
			data['config_owner'] = store_info['config_owner'];
		} else {
			data['config_owner'] = '';
		}

		if ((store_info['config_address'])) {
			data['config_address'] = store_info['config_address'];
		} else {
			data['config_address'] = '';
		}

		if ((store_info['config_geocode'])) {
			data['config_geocode'] = store_info['config_geocode'];
		} else {
			data['config_geocode'] = '';
		}

		if ((store_info['config_email'])) {
			data['config_email'] = store_info['config_email'];
		} else {
			data['config_email'] = '';
		}

		if ((store_info['config_telephone'])) {
			data['config_telephone'] = store_info['config_telephone'];
		} else {
			data['config_telephone'] = '';
		}

		if ((store_info['config_image'])) {
			data['config_image'] = store_info['config_image'];
		} else {
			data['config_image'] = '';
		}

		this.load.model('tool/image', this);

		data['placeholder'] = await this.model_tool_image.resize('no_image.png', 100, 100);

		if (data['config_image'] && fs.existsSync(DIR_IMAGE + html_entity_decode(data['config_image']))) {
			data['thumb'] = await this.model_tool_image.resize(html_entity_decode(data['config_image']), 750, 90);
		} else {
			data['thumb'] = data['placeholder'];
		}

		if ((store_info['config_open'])) {
			data['config_open'] = store_info['config_open'];
		} else {
			data['config_open'] = '';
		}

		if ((store_info['config_comment'])) {
			data['config_comment'] = store_info['config_comment'];
		} else {
			data['config_comment'] = '';
		}

		this.load.model('localisation/location',this);

		data['locations'] = await this.model_localisation_location.getLocations();

		if ((store_info['config_location'])) {
			data['config_location'] = store_info['config_location'];
		} else {
			data['config_location'] = [];
		}

		this.load.model('localisation/country', this);

		data['countries'] = await this.model_localisation_country.getCountries();

		if ((store_info['config_country_id'])) {
			data['config_country_id'] = store_info['config_country_id'];
		} else {
			data['config_country_id'] = this.config.get('config_country_id');
		}

		if ((store_info['config_zone_id'])) {
			data['config_zone_id'] = store_info['config_zone_id'];
		} else {
			data['config_zone_id'] = this.config.get('config_zone_id');
		}

		this.load.model('localisation/language', this);

		data['languages'] = await this.model_localisation_language.getLanguages();

		if ((store_info['config_language'])) {
			data['config_language'] = store_info['config_language'];
		} else {
			data['config_language'] = this.config.get('config_language');
		}

		this.load.model('localisation/currency', this);

		data['currencies'] = await this.model_localisation_currency.getCurrencies();

		if ((store_info['config_currency'])) {
			data['config_currency'] = store_info['config_currency'];
		} else {
			data['config_currency'] = this.config.get('config_currency');
		}

		// Options
		if ((store_info['config_product_description_length'])) {
			data['config_product_description_length'] = store_info['config_product_description_length'];
		} else {
			data['config_product_description_length'] = 100;
		}

		if ((store_info['config_pagination'])) {
			data['config_pagination'] = store_info['config_pagination'];
		} else {
			data['config_pagination'] = 15;
		}

		if ((store_info['config_product_count'])) {
			data['config_product_count'] = store_info['config_product_count'];
		} else {
			data['config_product_count'] = 10;
		}

		if ((store_info['config_cookie_id'])) {
			data['config_cookie_id'] = store_info['config_cookie_id'];
		} else {
			data['config_cookie_id'] = '';
		}

		if ((store_info['config_gdpr_id'])) {
			data['config_gdpr_id'] = store_info['config_gdpr_id'];
		} else {
			data['config_gdpr_id'] = '';
		}

		if ((store_info['config_tax'])) {
			data['config_tax'] = store_info['config_tax'];
		} else {
			data['config_tax'] = '';
		}

		if ((store_info['config_tax_default'])) {
			data['config_tax_default'] = store_info['config_tax_default'];
		} else {
			data['config_tax_default'] = '';
		}

		if ((store_info['config_tax_customer'])) {
			data['config_tax_customer'] = store_info['config_tax_customer'];
		} else {
			data['config_tax_customer'] = '';
		}

		this.load.model('customer/customer_group', this);

		data['customer_groups'] = await this.model_customer_customer_group.getCustomerGroups();

		if ((store_info['config_customer_group_id'])) {
			data['config_customer_group_id'] = store_info['config_customer_group_id'];
		} else {
			data['config_customer_group_id'] = '';
		}

		if ((store_info['config_customer_group_display'])) {
			data['config_customer_group_display'] = store_info['config_customer_group_display'];
		} else {
			data['config_customer_group_display'] = [];
		}

		if ((store_info['config_customer_price'])) {
			data['config_customer_price'] = store_info['config_customer_price'];
		} else {
			data['config_customer_price'] = '';
		}

		this.load.model('catalog/information', this);

		data['informations'] = await this.model_catalog_information.getInformations();

		if ((store_info['config_account_id'])) {
			data['config_account_id'] = store_info['config_account_id'];
		} else {
			data['config_account_id'] = '';
		}

		if ((store_info['config_cart_weight'])) {
			data['config_cart_weight'] = store_info['config_cart_weight'];
		} else {
			data['config_cart_weight'] = '';
		}

		if ((store_info['config_checkout_guest'])) {
			data['config_checkout_guest'] = store_info['config_checkout_guest'];
		} else {
			data['config_checkout_guest'] = '';
		}

		if ((store_info['config_checkout_id'])) {
			data['config_checkout_id'] = store_info['config_checkout_id'];
		} else {
			data['config_checkout_id'] = '';
		}

		if ((store_info['config_stock_display'])) {
			data['config_stock_display'] = store_info['config_stock_display'];
		} else {
			data['config_stock_display'] = '';
		}

		if ((store_info['config_stock_checkout'])) {
			data['config_stock_checkout'] = store_info['config_stock_checkout'];
		} else {
			data['config_stock_checkout'] = '';
		}

		// Images
		if ((store_info['config_logo'])) {
			data['config_logo'] = store_info['config_logo'];
		} else {
			data['config_logo'] = '';
		}

		this.load.model('tool/image', this);

		data['placeholder'] = await this.model_tool_image.resize('no_image.png', 100, 100);

		if (data['config_logo'] && fs.existsSync(DIR_IMAGE + html_entity_decode(data['config_logo']))) {
			data['logo'] = await this.model_tool_image.resize(html_entity_decode(data['config_logo']), 100, 100);
		} else {
			data['logo'] = data['placeholder'];
		}

		if ((store_info['config_image_category_width'])) {
			data['config_image_category_width'] = store_info['config_image_category_width'];
		} else {
			data['config_image_category_width'] = 80;
		}

		if ((store_info['config_image_category_height'])) {
			data['config_image_category_height'] = store_info['config_image_category_height'];
		} else {
			data['config_image_category_height'] = 80;
		}

		if ((store_info['config_image_thumb_width'])) {
			data['config_image_thumb_width'] = store_info['config_image_thumb_width'];
		} else {
			data['config_image_thumb_width'] = 228;
		}

		if ((store_info['config_image_thumb_height'])) {
			data['config_image_thumb_height'] = store_info['config_image_thumb_height'];
		} else {
			data['config_image_thumb_height'] = 228;
		}

		if ((store_info['config_image_popup_width'])) {
			data['config_image_popup_width'] = store_info['config_image_popup_width'];
		} else {
			data['config_image_popup_width'] = 500;
		}

		if ((store_info['config_image_popup_height'])) {
			data['config_image_popup_height'] = store_info['config_image_popup_height'];
		} else {
			data['config_image_popup_height'] = 500;
		}

		if ((store_info['config_image_product_width'])) {
			data['config_image_product_width'] = store_info['config_image_product_width'];
		} else {
			data['config_image_product_width'] = 228;
		}

		if ((store_info['config_image_product_height'])) {
			data['config_image_product_height'] = store_info['config_image_product_height'];
		} else {
			data['config_image_product_height'] = 228;
		}

		if ((store_info['config_image_additional_width'])) {
			data['config_image_additional_width'] = store_info['config_image_additional_width'];
		} else {
			data['config_image_additional_width'] = 74;
		}

		if ((store_info['config_image_additional_height'])) {
			data['config_image_additional_height'] = store_info['config_image_additional_height'];
		} else {
			data['config_image_additional_height'] = 74;
		}

		if ((store_info['config_image_related_width'])) {
			data['config_image_related_width'] = store_info['config_image_related_width'];
		} else {
			data['config_image_related_width'] = 80;
		}

		if ((store_info['config_image_related_height'])) {
			data['config_image_related_height'] = store_info['config_image_related_height'];
		} else {
			data['config_image_related_height'] = 80;
		}

		if ((store_info['config_image_blog_width'])) {
			data['config_image_blog_width'] = store_info['config_image_blog_width'];
		} else {
			data['config_image_blog_width'] = 90;
		}

		if ((store_info['config_image_blog_height'])) {
			data['config_image_blog_height'] = store_info['config_image_blog_height'];
		} else {
			data['config_image_blog_height'] = 90;
		}

		if ((store_info['config_image_compare_width'])) {
			data['config_image_compare_width'] = store_info['config_image_compare_width'];
		} else {
			data['config_image_compare_width'] = 90;
		}

		if ((store_info['config_image_compare_height'])) {
			data['config_image_compare_height'] = store_info['config_image_compare_height'];
		} else {
			data['config_image_compare_height'] = 90;
		}

		if ((store_info['config_image_wishlist_width'])) {
			data['config_image_wishlist_width'] = store_info['config_image_wishlist_width'];
		} else {
			data['config_image_wishlist_width'] = 47;
		}

		if ((store_info['config_image_wishlist_height'])) {
			data['config_image_wishlist_height'] = store_info['config_image_wishlist_height'];
		} else {
			data['config_image_wishlist_height'] = 47;
		}

		if ((store_info['config_image_cart_width'])) {
			data['config_image_cart_width'] = store_info['config_image_cart_width'];
		} else {
			data['config_image_cart_width'] = 47;
		}

		if ((store_info['config_image_cart_height'])) {
			data['config_image_cart_height'] = store_info['config_image_cart_height'];
		} else {
			data['config_image_cart_height'] = 47;
		}

		if ((store_info['config_image_location_width'])) {
			data['config_image_location_width'] = store_info['config_image_location_width'];
		} else {
			data['config_image_location_width'] = 268;
		}

		if ((store_info['config_image_location_height'])) {
			data['config_image_location_height'] = store_info['config_image_location_height'];
		} else {
			data['config_image_location_height'] = 50;
		}

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('setting/store_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('setting/store');

		const json = { error: {} };

		if (!await this.user.hasPermission('modify', 'setting/store')) {
			json['error']['warning'] = this.language.get('error_permission');
		}

		if (!this.request.post['config_url']) {
			json['error']['url'] = this.language.get('error_url');
		}

		if (!this.request.post['config_meta_title']) {
			json['error']['meta_title'] = this.language.get('error_meta_title');
		}

		if (!this.request.post['config_name']) {
			json['error']['name'] = this.language.get('error_name');
		}

		if ((oc_strlen(this.request.post['config_owner']) < 3) || (oc_strlen(this.request.post['config_owner']) > 64)) {
			json['error']['owner'] = this.language.get('error_owner');
		}

		if ((oc_strlen(this.request.post['config_address']) < 3) || (oc_strlen(this.request.post['config_address']) > 256)) {
			json['error']['address'] = this.language.get('error_address');
		}

		if ((oc_strlen(this.request.post['config_email']) > 96) || !filter_var(this.request.post['config_email'], FILTER_VALIDATE_EMAIL)) {
			json['error']['email'] = this.language.get('error_email');
		}

		if ((oc_strlen(this.request.post['config_telephone']) < 3) || (oc_strlen(this.request.post['config_telephone']) > 32)) {
			json['error']['telephone'] = this.language.get('error_telephone');
		}

		if ((this.request.post['config_customer_group_display']) && !in_array(this.request.post['config_customer_group_id'], this.request.post['config_customer_group_display'])) {
			json['error']['customer_group_display'] = this.language.get('error_customer_group_display');
		}

		if (!this.request.post['config_product_description_length']) {
			json['error']['product_description_length'] = this.language.get('error_product_description_length');
		}

		if (!this.request.post['config_pagination']) {
			json['error']['pagination'] = this.language.get('error_pagination');
		}

		if (!this.request.post['config_image_category_width'] || !this.request.post['config_image_category_height']) {
			json['error']['image_category'] = this.language.get('error_image_category');
		}

		if (!this.request.post['config_image_thumb_width'] || !this.request.post['config_image_thumb_height']) {
			json['error']['image_thumb'] = this.language.get('error_image_thumb');
		}

		if (!this.request.post['config_image_popup_width'] || !this.request.post['config_image_popup_height']) {
			json['error']['image_popup'] = this.language.get('error_image_popup');
		}

		if (!this.request.post['config_image_product_width'] || !this.request.post['config_image_product_height']) {
			json['error']['image_product'] = this.language.get('error_image_product');
		}

		if (!this.request.post['config_image_additional_width'] || !this.request.post['config_image_additional_height']) {
			json['error']['image_additional'] = this.language.get('error_image_additional');
		}

		if (!this.request.post['config_image_related_width'] || !this.request.post['config_image_related_height']) {
			json['error']['image_related'] = this.language.get('error_image_related');
		}

		if (!this.request.post['config_image_compare_width'] || !this.request.post['config_image_compare_height']) {
			json['error']['image_compare'] = this.language.get('error_image_compare');
		}

		if (!this.request.post['config_image_wishlist_width'] || !this.request.post['config_image_wishlist_height']) {
			json['error']['image_wishlist'] = this.language.get('error_image_wishlist');
		}

		if (!this.request.post['config_image_cart_width'] || !this.request.post['config_image_cart_height']) {
			json['error']['image_cart'] = this.language.get('error_image_cart');
		}

		if (!this.request.post['config_image_location_width'] || !this.request.post['config_image_location_height']) {
			json['error']['image_location'] = this.language.get('error_image_location');
		}

		if (Object.keys(json['error']).length && !(json['error']['warning'])) {
			json['error']['warning'] = this.language.get('error_warning');
		}

		if (!Object.keys(json.error).length) {
			this.load.model('setting/setting', this);

			this.load.model('setting/store', this);
			this.request.post['store_id'] = Number(this.request.post['store_id']);
			if (!this.request.post['store_id']) {
				json['store_id'] = await this.model_setting_store.addStore(this.request.post);

				await this.model_setting_setting.editSetting('config', this.request.post, json['store_id']);
			} else {
				await this.model_setting_store.editStore(this.request.post['store_id'], this.request.post);

				await this.model_setting_setting.editSetting('config', this.request.post, this.request.post['store_id']);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async delete() {
		await this.load.language('setting/store');

		const json = {};

		let selected = [];
		if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		}

		if (!await this.user.hasPermission('modify', 'setting/store')) {
			json['error'] = this.language.get('error_permission');
		}

		this.load.model('sale/order', this);
		this.load.model('sale/subscription', this);

		for (selected of store_id) {
			if (!store_id) {
				json['error'] = this.language.get('error_default');
			}

			const order_total = await this.model_sale_order.getTotalOrdersByStoreId(store_id);

			if (order_total) {
				json['error'] = sprintf(this.language.get('error_store'), order_total);
			}

			const subscription_total = await this.model_sale_subscription.getTotalSubscriptionsByStoreId(store_id);

			if (subscription_total) {
				json['error'] = sprintf(this.language.get('error_store'), subscription_total);
			}
		}

		if (!Object.keys(json).length) {
			this.load.model('setting/store', this);

			this.load.model('setting/setting', this);

			for (let store_id of selected) {
				await this.model_setting_store.deleteStore(store_id);

				await this.model_setting_setting.deleteSetting('config', store_id);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
