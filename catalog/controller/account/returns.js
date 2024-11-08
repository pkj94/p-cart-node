const sprintf = require("locutus/php/strings/sprintf");

module.exports = class Returns extends Controller {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('account/returns');

		if (!await this.customer.isLogged() || (!(this.request.get['customer_token']) || !(this.session.data['customer_token']) || (this.request.get['customer_token'] != this.session.data['customer_token']))) {
			this.session.data['redirect'] = await this.url.link('account/returns', 'language=' + this.config.get('config_language'));

			this.response.setRedirect(await this.url.link('account/login', 'language=' + this.config.get('config_language')));
		}

		let page = 1;
		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		}

		let limit = 10;

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/home', 'language=' + this.config.get('config_language'))
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_account'),
			'href': await this.url.link('account/account', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token'])
		});

		let url = '';

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('account/returns', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token'] + url)
		});

		data['returns'] = [];

		this.load.model('account/returns', this);

		const return_total = await this.model_account_returns.getTotalReturns();

		const results = await this.model_account_returns.getReturns((page - 1) * limit, limit);

		for (let result of results) {
			data['returns'].push({
				'return_id': result['return_id'],
				'order_id': result['order_id'],
				'name': result['firstname'] + ' ' + result['lastname'],
				'status': result['status'],
				'date_added': date(this.language.get('date_format_short'), new Date(result['date_added'])),
				'href': await this.url.link('account/returns.info', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token'] + '&return_id=' + result['return_id'] + url)
			});
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': return_total,
			'page': page,
			'limit': limit,
			'url': await this.url.link('account/returns', 'language=' + this.config.get('config_language') + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (return_total) ? ((page - 1) * limit) + 1 : 0, (((page - 1) * limit) > (return_total - limit)) ? return_total : (((page - 1) * limit) + limit), return_total, Math.ceil(return_total / limit));

		data['continue'] = await this.url.link('account/account', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token']);

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.setOutput(await this.load.view('account/returns_list', data));
	}

	/**
	 * @return void
	 */
	async info() {
		const data = {};
		await this.load.language('account/returns');

		if (!await this.customer.isLogged() || (!(this.request.get['customer_token']) || !(this.session.data['customer_token']) || (this.request.get['customer_token'] != this.session.data['customer_token']))) {
			this.session.data['redirect'] = await this.url.link('account/returns.info', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token']);

			this.response.setRedirect(await this.url.link('account/login', 'language=' + this.config.get('config_language')));
		}
		let return_id = 0;
		if ((this.request.get['return_id'])) {
			return_id = this.request.get['return_id'];
		}
		this.load.model('account/returns', this);

		const return_info = await this.model_account_returns.getReturn(return_id);

		if (return_info.return_id) {
			this.document.setTitle(this.language.get('text_return'));

			data['breadcrumbs'] = [];

			data['breadcrumbs'].push({
				'text': this.language.get('text_home'),
				'href': await this.url.link('common/home', 'language=' + this.config.get('config_language'))
			});

			data['breadcrumbs'].push({
				'text': this.language.get('text_account'),
				'href': await this.url.link('account/account', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token'])
			});

			let url = '';

			if ((this.request.get['page'])) {
				url += '&page=' + this.request.get['page'];
			}

			data['breadcrumbs'].push({
				'text': this.language.get('heading_title'),
				'href': await this.url.link('account/returns', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token'] + url)
			});

			data['breadcrumbs'].push({
				'text': this.language.get('text_return'),
				'href': await this.url.link('account/returns.info', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token'] + '&return_id=' + this.request.get['return_id'] + url)
			});

			data['return_id'] = return_info['return_id'];
			data['order_id'] = return_info['order_id'];
			data['date_ordered'] = date(this.language.get('date_format_short'), new Date(return_info['date_ordered']));
			data['date_added'] = date(this.language.get('date_format_short'), new Date(return_info['date_added']));
			data['firstname'] = return_info['firstname'];
			data['lastname'] = return_info['lastname'];
			data['email'] = return_info['email'];
			data['telephone'] = return_info['telephone'];
			data['product'] = return_info['product'];
			data['model'] = return_info['model'];
			data['quantity'] = return_info['quantity'];
			data['reason'] = return_info['reason'];
			data['opened'] = return_info['opened'] ? this.language.get('text_yes') : this.language.get('text_no');
			data['comment'] = nl2br(return_info['comment']);
			data['action'] = return_info['action'];

			data['histories'] = [];

			const results = await this.model_account_returns.getHistories(this.request.get['return_id']);

			for (let result of results) {
				data['histories'].push({
					'date_added': date(this.language.get('date_format_short'), new Date(result['date_added'])),
					'status': result['status'],
					'comment': nl2br(result['comment'])
				});
			}

			data['continue'] = await this.url.link('account/returns', 'language=' + this.config.get('config_language') + url);

			data['column_left'] = await this.load.controller('common/column_left');
			data['column_right'] = await this.load.controller('common/column_right');
			data['content_top'] = await this.load.controller('common/content_top');
			data['content_bottom'] = await this.load.controller('common/content_bottom');
			data['footer'] = await this.load.controller('common/footer');
			data['header'] = await this.load.controller('common/header');

			this.response.setOutput(await this.load.view('account/returns_info', data));
		} else {
			return new global['\Opencart\System\Engine\Action']('error/not_found');
		}

		return null;
	}

	/**
	 * @return void
	 */
	async add() {
		const data = {};
		await this.load.language('account/returns');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/home', 'language=' + this.config.get('config_language'))
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_account'),
			'href': await this.url.link('account/account', 'language=' + this.config.get('config_language'))
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('account/returns.add', 'language=' + this.config.get('config_language'))
		});

		this.session.data['return_token'] = bin2hex(26);

		data['save'] = await this.url.link('account/returns.save', 'language=' + this.config.get('config_language') + '&return_token=' + this.session.data['return_token']);

		this.load.model('account/order', this);

		if ((this.request.get['order_id'])) {
			const order_info = await this.model_account_order.getOrder(this.request.get['order_id']);
		}

		this.load.model('catalog/product', this);

		if ((this.request.get['product_id'])) {
			const product_info = await this.model_catalog_product.getProduct(this.request.get['product_id']);
		}

		if ((order_info.order_id)) {
			data['order_id'] = order_info['order_id'];
		} else {
			data['order_id'] = '';
		}

		if ((product_info.product_id)) {
			data['product_id'] = product_info['product_id'];
		} else {
			data['product_id'] = '';
		}

		if ((order_info.order_id)) {
			data['date_ordered'] = date('Y-m-d', new Date(order_info['date_added']));
		} else {
			data['date_ordered'] = '';
		}

		if ((order_info.order_id)) {
			data['firstname'] = order_info['firstname'];
		} else {
			data['firstname'] = await this.customer.getFirstName();
		}

		if ((order_info.order_id)) {
			data['lastname'] = order_info['lastname'];
		} else {
			data['lastname'] = await this.customer.getLastName();
		}

		if ((order_info.order_id)) {
			data['email'] = order_info['email'];
		} else {
			data['email'] = await this.customer.getEmail();
		}

		if ((order_info.order_id)) {
			data['telephone'] = order_info['telephone'];
		} else {
			data['telephone'] = await this.customer.getTelephone();
		}

		if ((product_info.order_id)) {
			data['product'] = product_info['name'];
		} else {
			data['product'] = '';
		}

		if ((product_info.order_id)) {
			data['model'] = product_info['model'];
		} else {
			data['model'] = '';
		}

		this.load.model('localisation/return_reason', this);

		data['return_reasons'] = await this.model_localisation_return_reason.getReturnReasons();

		// Captcha
		this.load.model('setting/extension', this);

		const extension_info = await this.model_setting_extension.getExtensionByCode('captcha', this.config.get('config_captcha'));

		if (extension_info.extension_id && Number(this.config.get('captcha_' + this.config.get('config_captcha') + '_status')) && in_array('returns', this.config.get('config_captcha_page'))) {
			data['captcha'] = await this.load.controller('extension/' + extension_info['extension'] + '/captcha/' + extension_info['code']);
		} else {
			data['captcha'] = '';
		}

		this.load.model('catalog/information', this);

		const information_info = await this.model_catalog_information.getInformation(this.config.get('config_return_id'));

		if (information_info.information_id) {
			data['agree_text'] = sprintf(this.language.get('text_agree'), await this.url.link('information/information.info', 'language=' + this.config.get('config_language') + '&information_id=' + this.config.get('config_return_id')), information_info['title']);
		} else {
			data['agree_text'] = '';
		}

		data['back'] = await this.url.link('account/account', 'language=' + this.config.get('config_language'));

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.setOutput(await this.load.view('account/returns_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('account/returns');

		const json = { error: {} };

		if (!(this.request.get['return_token']) || !(this.session.data['return_token']) || (this.request.get['return_token'] != this.session.data['return_token'])) {
			json['redirect'] = await this.url.link('account/returns.add', 'language=' + this.config.get('config_language'), true);
		}

		if (!json.redirect) {
			let keys = [
				'order_id',
				'firstname',
				'lastname',
				'email',
				'telephone',
				'product',
				'model',
				'reason',
				'agree'
			];

			for (let key of keys) {
				if (!(this.request.post[key])) {
					this.request.post[key] = '';
				}
			}

			if (!this.request.post['order_id']) {
				json['error']['order_id'] = this.language.get('error_order_id');
			}

			if ((oc_strlen(this.request.post['firstname']) < 1) || (oc_strlen(this.request.post['firstname']) > 32)) {
				json['error']['firstname'] = this.language.get('error_firstname');
			}

			if ((oc_strlen(this.request.post['lastname']) < 1) || (oc_strlen(this.request.post['lastname']) > 32)) {
				json['error']['lastname'] = this.language.get('error_lastname');
			}

			if ((oc_strlen(this.request.post['email']) > 96) || !isEmailValid(this.request.post['email'])) {
				json['error']['email'] = this.language.get('error_email');
			}

			if ((oc_strlen(this.request.post['telephone']) < 3) || (oc_strlen(this.request.post['telephone']) > 32)) {
				json['error']['telephone'] = this.language.get('error_telephone');
			}

			if ((oc_strlen(this.request.post['product']) < 1) || (oc_strlen(this.request.post['product']) > 255)) {
				json['error']['product'] = this.language.get('error_product');
			}

			if ((oc_strlen(this.request.post['model']) < 1) || (oc_strlen(this.request.post['model']) > 64)) {
				json['error']['model'] = this.language.get('error_model');
			}

			if (empty(this.request.post['return_reason_id'])) {
				json['error']['reason'] = this.language.get('error_reason');
			}

			// Captcha
			this.load.model('setting/extension', this);

			const extension_info = await this.model_setting_extension.getExtensionByCode('captcha', this.config.get('config_captcha'));

			if (extension_info.extension_id && Number(this.config.get('captcha_' + this.config.get('config_captcha') + '_status')) && this.config.get('config_captcha_page').includes('return')) {
				const captcha = await this.load.controller('extension/' + extension_info['extension'] + '/captcha/' + extension_info['code'] + '.validate');

				if (captcha) {
					json['error']['captcha'] = captcha;
				}
			}

			if (this.config.get('config_return_id')) {
				this.load.model('catalog/information', this);

				const information_info = await this.model_catalog_information.getInformation(this.config.get('config_return_id'));

				if (information_info.information_id && !(this.request.post['agree'])) {
					json['error']['warning'] = sprintf(this.language.get('error_agree'), information_info['title']);
				}
			}
		}

		if (!Object.keys(json.error).length) {
			this.load.model('account/returns', this);

			await this.model_account_returns.addReturn(this.request.post);

			json['redirect'] = await this.url.link('account/returns.success', 'language=' + this.config.get('config_language'), true);
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async success() {
		const data = {};
		await this.load.language('account/returns');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/home', 'language=' + this.config.get('config_language'))
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('account/returns.add', 'language=' + this.config.get('config_language'))
		});

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
