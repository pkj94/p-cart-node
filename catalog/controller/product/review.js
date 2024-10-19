const nl2br = require("locutus/php/strings/nl2br");
const sprintf = require("locutus/php/strings/sprintf");

module.exports = class ReviewController extends Controller {
	/**
	 * @return string
	 */
	async index() {
		const data = {};
		await this.load.language('product/review');

		data['text_login'] = sprintf(this.language.get('text_login'), await this.url.link('account/login', 'language=' + this.config.get('config_language')), await this.url.link('account/register', 'language=' + this.config.get('config_language')));

		data['list'] = this.getList();

		if ((this.request.get['product_id'])) {
			data['product_id'] = this.request.get['product_id'];
		} else {
			data['product_id'] = 0;
		}

		if (await this.customer.isLogged() || this.config.get('config_review_guest')) {
			data['review_guest'] = true;
		} else {
			data['review_guest'] = false;
		}

		if (await this.customer.isLogged()) {
			data['customer_name'] = await this.customer.getFirstName() + ' ' + await this.customer.getLastName();
		} else {
			data['customer_name'] = '';
		}

		// Create a login token to prevent brute force attacks
		this.session.data['review_token'] = oc_token(32);

		data['review_token'] = this.session.data['review_token'];

		// Captcha
		this.load.model('setting/extension', this);

		const extension_info = await this.model_setting_extension.getExtensionByCode('captcha', this.config.get('config_captcha'));

		if (extension_info.extension_id && Number(this.config.get('captcha_' + this.config.get('config_captcha') + '_status')) && this.config.get('config_captcha_page').includes('review')) {
			data['captcha'] = await this.load.controller('extension/' + extension_info['extension'] + '/captcha/' + extension_info['code']);
		} else {
			data['captcha'] = '';
		}

		data['language'] = this.config.get('config_language');

		return await this.load.view('product/review', data);
	}

	/**
	 * @return void
	 */
	async write() {
		await this.load.language('product/review');

		const json = {};

		let product_id = 0;
		if ((this.request.get['product_id'])) {
			product_id = this.request.get['product_id'];
		}

		if (!(this.request.get['review_token']) || !(this.session.data['review_token']) || this.request.get['review_token'] != this.session.data['review_token']) {
			json['error']['warning'] = this.language.get('error_token');
		}

		let keys = [
			'name',
			'text',
			'rating'
		];

		for (let key of keys) {
			if (!(this.request.post[key])) {
				this.request.post[key] = '';
			}
		}

		this.load.model('product/product', this);

		const product_info = await this.model_product_product.getProduct(product_id);

		if (!product_info.product_id) {
			json['error']['warning'] = this.language.get('error_product');
		}

		if ((oc_strlen(this.request.post['name']) < 3) || (oc_strlen(this.request.post['name']) > 25)) {
			json['error']['name'] = this.language.get('error_name');
		}

		if ((oc_strlen(this.request.post['text']) < 25) || (oc_strlen(this.request.post['text']) > 1000)) {
			json['error']['text'] = this.language.get('error_text');
		}

		if (this.request.post['rating'] < 1 || this.request.post['rating'] > 5) {
			json['error']['rating'] = this.language.get('error_rating');
		}

		if (!await this.customer.isLogged() && !this.config.get('config_review_guest')) {
			json['error']['warning'] = this.language.get('error_guest');
		}

		if (await this.customer.isLogged() && this.config.get('config_review_purchased')) {
			this.load.model('account/order', this);

			if (!await this.model_account_order.getTotalOrdersByProductId(product_id)) {
				json['error']['purchased'] = this.language.get('error_purchased');
			}
		}

		// Captcha
		this.load.model('setting/extension', this);

		const extension_info = await this.model_setting_extension.getExtensionByCode('captcha', this.config.get('config_captcha'));

		if (extension_info.extension_id && Number(this.config.get('captcha_' + this.config.get('config_captcha') + '_status')) && this.config.get('config_captcha_page').includes('review')) {
			const captcha = await this.load.controller('extension/' + extension_info['extension'] + '/captcha/' + extension_info['code'] + '+validate');

			if (captcha) {
				json['error']['captcha'] = captcha;
			}
		}

		if (!Object.keys(json).length) {
			this.load.model('catalog/review', this);

			await this.model_catalog_review.addReview(product_id, this.request.post);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('product/review');

		this.response.setOutput(await this.getList());
	}

	/**
	 * @return string
	 */
	async getList() {
		const data = {};
		let product_id = 0;
		if ((this.request.get['product_id'])) {
			product_id = this.request.get['product_id'];
		}

		let page = 1;
		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		}

		data['reviews'] = [];

		this.load.model('catalog/review', this);

		const review_total = await this.model_catalog_review.getTotalReviewsByProductId(product_id);

		const results = await this.model_catalog_review.getReviewsByProductId(product_id, (page - 1) * 5, 5);

		for (let result of results) {
			data['reviews'].push({
				'author': result['author'],
				'text': nl2br(result['text']),
				'rating': result['rating'],
				'date_added': date(this.language.get('date_format_short'), new Date(result['date_added']))
			});
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': review_total,
			'page': page,
			'limit': 5,
			'url': await this.url.link('product/review+list', 'language=' + this.config.get('config_language') + '&product_id=' + product_id + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (review_total) ? ((page - 1) * 5) + 1 : 0, (((page - 1) * 5) > (review_total - 5)) ? review_total : (((page - 1) * 5) + 5), review_total, Math.ceil(review_total / 5));

		return await this.load.view('product/review_list', data);
	}
}
