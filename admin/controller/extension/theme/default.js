module.exports = class ControllerExtensionThemeDefault extends Controller {
	error = {};

	async index() {
		const data = {};
		await this.load.language('extension/theme/default');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/setting', this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('theme_default', this.request.post, this.request.get['store_id']);

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);

			this.response.setRedirect(await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=theme', true));
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.error['product_limit'])) {
			data['error_product_limit'] = this.error['product_limit'];
		} else {
			data['error_product_limit'] = '';
		}

		if ((this.error['product_description_length'])) {
			data['error_product_description_length'] = this.error['product_description_length'];
		} else {
			data['error_product_description_length'] = '';
		}

		if ((this.error['image_category'])) {
			data['error_image_category'] = this.error['image_category'];
		} else {
			data['error_image_category'] = '';
		}

		if ((this.error['image_thumb'])) {
			data['error_image_thumb'] = this.error['image_thumb'];
		} else {
			data['error_image_thumb'] = '';
		}

		if ((this.error['image_popup'])) {
			data['error_image_popup'] = this.error['image_popup'];
		} else {
			data['error_image_popup'] = '';
		}

		if ((this.error['image_product'])) {
			data['error_image_product'] = this.error['image_product'];
		} else {
			data['error_image_product'] = '';
		}

		if ((this.error['image_additional'])) {
			data['error_image_additional'] = this.error['image_additional'];
		} else {
			data['error_image_additional'] = '';
		}

		if ((this.error['image_related'])) {
			data['error_image_related'] = this.error['image_related'];
		} else {
			data['error_image_related'] = '';
		}

		if ((this.error['image_compare'])) {
			data['error_image_compare'] = this.error['image_compare'];
		} else {
			data['error_image_compare'] = '';
		}

		if ((this.error['image_wishlist'])) {
			data['error_image_wishlist'] = this.error['image_wishlist'];
		} else {
			data['error_image_wishlist'] = '';
		}

		if ((this.error['image_cart'])) {
			data['error_image_cart'] = this.error['image_cart'];
		} else {
			data['error_image_cart'] = '';
		}

		if ((this.error['image_location'])) {
			data['error_image_location'] = this.error['image_location'];
		} else {
			data['error_image_location'] = '';
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_extension'),
			'href': await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=theme', true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('extension/theme/default', 'user_token=' + this.session.data['user_token'] + '&store_id=' + this.request.get['store_id'], true)
		});

		data['action'] = await this.url.link('extension/theme/default', 'user_token=' + this.session.data['user_token'] + '&store_id=' + this.request.get['store_id'], true);

		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=theme', true);
		let setting_info;
		if ((this.request.get['store_id']) && (this.request.server['method'] != 'POST')) {
			setting_info = await this.model_setting_setting.getSetting('theme_default', this.request.get['store_id']);
		}

		if ((this.request.post['theme_default_directory'])) {
			data['theme_default_directory'] = this.request.post['theme_default_directory'];
		} else if ((setting_info['theme_default_directory'])) {
			data['theme_default_directory'] = setting_info['theme_default_directory'];
		} else {
			data['theme_default_directory'] = 'default';
		}

		data['directories'] = [];

		const directories = require('glob').sync(DIR_CATALOG + 'view/theme/*');
		for (let directory of directories) {
			data['directories'].push(expressPath.basename(directory));
		}

		if ((this.request.post['theme_default_product_limit'])) {
			data['theme_default_product_limit'] = this.request.post['theme_default_product_limit'];
		} else if ((setting_info['theme_default_product_limit'])) {
			data['theme_default_product_limit'] = setting_info['theme_default_product_limit'];
		} else {
			data['theme_default_product_limit'] = 15;
		}

		if ((this.request.post['theme_default_status'])) {
			data['theme_default_status'] = this.request.post['theme_default_status'];
		} else if ((setting_info['theme_default_status'])) {
			data['theme_default_status'] = setting_info['theme_default_status'];
		} else {
			data['theme_default_status'] = '';
		}

		if ((this.request.post['theme_default_product_description_length'])) {
			data['theme_default_product_description_length'] = this.request.post['theme_default_product_description_length'];
		} else if ((setting_info['theme_default_product_description_length'])) {
			data['theme_default_product_description_length'] = setting_info['theme_default_product_description_length'];
		} else {
			data['theme_default_product_description_length'] = 100;
		}

		if ((this.request.post['theme_default_image_category_width'])) {
			data['theme_default_image_category_width'] = this.request.post['theme_default_image_category_width'];
		} else if ((setting_info['theme_default_image_category_width'])) {
			data['theme_default_image_category_width'] = setting_info['theme_default_image_category_width'];
		} else {
			data['theme_default_image_category_width'] = 80;
		}

		if ((this.request.post['theme_default_image_category_height'])) {
			data['theme_default_image_category_height'] = this.request.post['theme_default_image_category_height'];
		} else if ((setting_info['theme_default_image_category_height'])) {
			data['theme_default_image_category_height'] = setting_info['theme_default_image_category_height'];
		} else {
			data['theme_default_image_category_height'] = 80;
		}

		if ((this.request.post['theme_default_image_thumb_width'])) {
			data['theme_default_image_thumb_width'] = this.request.post['theme_default_image_thumb_width'];
		} else if ((setting_info['theme_default_image_thumb_width'])) {
			data['theme_default_image_thumb_width'] = setting_info['theme_default_image_thumb_width'];
		} else {
			data['theme_default_image_thumb_width'] = 228;
		}

		if ((this.request.post['theme_default_image_thumb_height'])) {
			data['theme_default_image_thumb_height'] = this.request.post['theme_default_image_thumb_height'];
		} else if ((setting_info['theme_default_image_thumb_height'])) {
			data['theme_default_image_thumb_height'] = setting_info['theme_default_image_thumb_height'];
		} else {
			data['theme_default_image_thumb_height'] = 228;
		}

		if ((this.request.post['theme_default_image_popup_width'])) {
			data['theme_default_image_popup_width'] = this.request.post['theme_default_image_popup_width'];
		} else if ((setting_info['theme_default_image_popup_width'])) {
			data['theme_default_image_popup_width'] = setting_info['theme_default_image_popup_width'];
		} else {
			data['theme_default_image_popup_width'] = 500;
		}

		if ((this.request.post['theme_default_image_popup_height'])) {
			data['theme_default_image_popup_height'] = this.request.post['theme_default_image_popup_height'];
		} else if ((setting_info['theme_default_image_popup_height'])) {
			data['theme_default_image_popup_height'] = setting_info['theme_default_image_popup_height'];
		} else {
			data['theme_default_image_popup_height'] = 500;
		}

		if ((this.request.post['theme_default_image_product_width'])) {
			data['theme_default_image_product_width'] = this.request.post['theme_default_image_product_width'];
		} else if ((setting_info['theme_default_image_product_width'])) {
			data['theme_default_image_product_width'] = setting_info['theme_default_image_product_width'];
		} else {
			data['theme_default_image_product_width'] = 228;
		}

		if ((this.request.post['theme_default_image_product_height'])) {
			data['theme_default_image_product_height'] = this.request.post['theme_default_image_product_height'];
		} else if ((setting_info['theme_default_image_product_height'])) {
			data['theme_default_image_product_height'] = setting_info['theme_default_image_product_height'];
		} else {
			data['theme_default_image_product_height'] = 228;
		}

		if ((this.request.post['theme_default_image_additional_width'])) {
			data['theme_default_image_additional_width'] = this.request.post['theme_default_image_additional_width'];
		} else if ((setting_info['theme_default_image_additional_width'])) {
			data['theme_default_image_additional_width'] = setting_info['theme_default_image_additional_width'];
		} else {
			data['theme_default_image_additional_width'] = 74;
		}

		if ((this.request.post['theme_default_image_additional_height'])) {
			data['theme_default_image_additional_height'] = this.request.post['theme_default_image_additional_height'];
		} else if ((setting_info['theme_default_image_additional_height'])) {
			data['theme_default_image_additional_height'] = setting_info['theme_default_image_additional_height'];
		} else {
			data['theme_default_image_additional_height'] = 74;
		}

		if ((this.request.post['theme_default_image_related_width'])) {
			data['theme_default_image_related_width'] = this.request.post['theme_default_image_related_width'];
		} else if ((setting_info['theme_default_image_related_width'])) {
			data['theme_default_image_related_width'] = setting_info['theme_default_image_related_width'];
		} else {
			data['theme_default_image_related_width'] = 80;
		}

		if ((this.request.post['theme_default_image_related_height'])) {
			data['theme_default_image_related_height'] = this.request.post['theme_default_image_related_height'];
		} else if ((setting_info['theme_default_image_related_height'])) {
			data['theme_default_image_related_height'] = setting_info['theme_default_image_related_height'];
		} else {
			data['theme_default_image_related_height'] = 80;
		}

		if ((this.request.post['theme_default_image_compare_width'])) {
			data['theme_default_image_compare_width'] = this.request.post['theme_default_image_compare_width'];
		} else if ((setting_info['theme_default_image_compare_width'])) {
			data['theme_default_image_compare_width'] = setting_info['theme_default_image_compare_width'];
		} else {
			data['theme_default_image_compare_width'] = 90;
		}

		if ((this.request.post['theme_default_image_compare_height'])) {
			data['theme_default_image_compare_height'] = this.request.post['theme_default_image_compare_height'];
		} else if ((setting_info['theme_default_image_compare_height'])) {
			data['theme_default_image_compare_height'] = setting_info['theme_default_image_compare_height'];
		} else {
			data['theme_default_image_compare_height'] = 90;
		}

		if ((this.request.post['theme_default_image_wishlist_width'])) {
			data['theme_default_image_wishlist_width'] = this.request.post['theme_default_image_wishlist_width'];
		} else if ((setting_info['theme_default_image_wishlist_width'])) {
			data['theme_default_image_wishlist_width'] = setting_info['theme_default_image_wishlist_width'];
		} else {
			data['theme_default_image_wishlist_width'] = 47;
		}

		if ((this.request.post['theme_default_image_wishlist_height'])) {
			data['theme_default_image_wishlist_height'] = this.request.post['theme_default_image_wishlist_height'];
		} else if ((setting_info['theme_default_image_wishlist_height'])) {
			data['theme_default_image_wishlist_height'] = setting_info['theme_default_image_wishlist_height'];
		} else {
			data['theme_default_image_wishlist_height'] = 47;
		}

		if ((this.request.post['theme_default_image_cart_width'])) {
			data['theme_default_image_cart_width'] = this.request.post['theme_default_image_cart_width'];
		} else if ((setting_info['theme_default_image_cart_width'])) {
			data['theme_default_image_cart_width'] = setting_info['theme_default_image_cart_width'];
		} else {
			data['theme_default_image_cart_width'] = 47;
		}

		if ((this.request.post['theme_default_image_cart_height'])) {
			data['theme_default_image_cart_height'] = this.request.post['theme_default_image_cart_height'];
		} else if ((setting_info['theme_default_image_cart_height'])) {
			data['theme_default_image_cart_height'] = setting_info['theme_default_image_cart_height'];
		} else {
			data['theme_default_image_cart_height'] = 47;
		}

		if ((this.request.post['theme_default_image_location_width'])) {
			data['theme_default_image_location_width'] = this.request.post['theme_default_image_location_width'];
		} else if ((setting_info['theme_default_image_location_width'])) {
			data['theme_default_image_location_width'] = setting_info['theme_default_image_location_width'];
		} else {
			data['theme_default_image_location_width'] = 268;
		}

		if ((this.request.post['theme_default_image_location_height'])) {
			data['theme_default_image_location_height'] = this.request.post['theme_default_image_location_height'];
		} else if ((setting_info['theme_default_image_location_height'])) {
			data['theme_default_image_location_height'] = setting_info['theme_default_image_location_height'];
		} else {
			data['theme_default_image_location_height'] = 50;
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/theme/default', data));
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/theme/default')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		if (!this.request.post['theme_default_product_limit']) {
			this.error['product_limit'] = this.language.get('error_limit');
		}

		if (!this.request.post['theme_default_product_description_length']) {
			this.error['product_description_length'] = this.language.get('error_limit');
		}

		if (!this.request.post['theme_default_image_category_width'] || !this.request.post['theme_default_image_category_height']) {
			this.error['image_category'] = this.language.get('error_image_category');
		}

		if (!this.request.post['theme_default_image_thumb_width'] || !this.request.post['theme_default_image_thumb_height']) {
			this.error['image_thumb'] = this.language.get('error_image_thumb');
		}

		if (!this.request.post['theme_default_image_popup_width'] || !this.request.post['theme_default_image_popup_height']) {
			this.error['image_popup'] = this.language.get('error_image_popup');
		}

		if (!this.request.post['theme_default_image_product_width'] || !this.request.post['theme_default_image_product_height']) {
			this.error['image_product'] = this.language.get('error_image_product');
		}

		if (!this.request.post['theme_default_image_additional_width'] || !this.request.post['theme_default_image_additional_height']) {
			this.error['image_additional'] = this.language.get('error_image_additional');
		}

		if (!this.request.post['theme_default_image_related_width'] || !this.request.post['theme_default_image_related_height']) {
			this.error['image_related'] = this.language.get('error_image_related');
		}

		if (!this.request.post['theme_default_image_compare_width'] || !this.request.post['theme_default_image_compare_height']) {
			this.error['image_compare'] = this.language.get('error_image_compare');
		}

		if (!this.request.post['theme_default_image_wishlist_width'] || !this.request.post['theme_default_image_wishlist_height']) {
			this.error['image_wishlist'] = this.language.get('error_image_wishlist');
		}

		if (!this.request.post['theme_default_image_cart_width'] || !this.request.post['theme_default_image_cart_height']) {
			this.error['image_cart'] = this.language.get('error_image_cart');
		}

		if (!this.request.post['theme_default_image_location_width'] || !this.request.post['theme_default_image_location_height']) {
			this.error['image_location'] = this.language.get('error_image_location');
		}

		return Object.keys(this.error).length ? false : true
	}
}
