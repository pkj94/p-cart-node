const nl2br = require("locutus/php/strings/nl2br");
const trim = require("locutus/php/strings/trim");

module.exports = class ControllerAccountReturn extends Controller {
	error = {};

	async index() {
		const data = {};
		if (!await this.customer.isLogged()) {
			this.session.data['redirect'] = await this.url.link('account/return', '', true);
			await this.session.save(this.session.data);
			this.response.setRedirect(await this.url.link('account/login', '', true));
		}

		await this.load.language('account/return');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/home')
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_account'),
			'href': await this.url.link('account/account', '', true)
		});

		let url = '';

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('account/return', url, true)
		});

		this.load.model('account/return', this);
		let page = 1;
		if ((this.request.get['page'])) {
			page = this.request.get['page'];
		}

		const limit = 10;

		data['returns'] = [];

		const return_total = await this.model_account_return.getTotalReturns();

		const results = await this.model_account_return.getReturns((Number(page) - 1) * limit, limit);

		for (let result of results) {
			data['returns'].push({
				'return_id': result['return_id'],
				'order_id': result['order_id'],
				'name': result['firstname'] + ' ' + result['lastname'],
				'status': result['status'],
				'date_added': date(this.language.get('date_format_short'), new Date(result['date_added'])),
				'href': await this.url.link('account/return/info', 'return_id=' + result['return_id'] + url, true)
			});
		}

		const pagination = new Pagination();
		pagination.total = return_total;
		pagination.page = page;
		pagination.limit = limit;
		pagination.url = await this.url.link('account/return', 'page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (return_total) ? ((Number(page) - 1) * limit) + 1 : 0, (((Number(page) - 1) * limit) > (return_total - limit)) ? return_total : (((Number(page) - 1) * limit) + limit), return_total, Math.ceil(return_total / limit));

		data['continue'] = await this.url.link('account/account', '', true);

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.setOutput(await this.load.view('account/return_list', data));
	}

	async info() {
		const data = {};
		await this.load.language('account/return');
		let return_id = 0;
		if ((this.request.get['return_id'])) {
			return_id = this.request.get['return_id'];
		}

		if (!await this.customer.isLogged()) {
			this.session.data['redirect'] = await this.url.link('account/return/info', 'return_id=' + return_id, true);
			await this.session.save(this.session.data)
			this.response.setRedirect(await this.url.link('account/login', '', true));
		} else {

			this.load.model('account/return', this);

			const return_info = await this.model_account_return.getReturn(return_id);

			if (return_info.return_id) {
				this.document.setTitle(this.language.get('text_return'));

				data['breadcrumbs'] = [];

				data['breadcrumbs'].push({
					'text': this.language.get('text_home'),
					'href': await this.url.link('common/home', '', true)
				});

				data['breadcrumbs'].push({
					'text': this.language.get('text_account'),
					'href': await this.url.link('account/account', '', true)
				});

				let url = '';

				if ((this.request.get['page'])) {
					url += '&page=' + this.request.get['page'];
				}

				data['breadcrumbs'].push({
					'text': this.language.get('heading_title'),
					'href': await this.url.link('account/return', url, true)
				});

				data['breadcrumbs'].push({
					'text': this.language.get('text_return'),
					'href': await this.url.link('account/return/info', 'return_id=' + this.request.get['return_id'] + url, true)
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

				const results = await this.model_account_return.getReturnHistories(this.request.get['return_id']);

				for (let result of results) {
					data['histories'].push({
						'date_added': date(this.language.get('date_format_short'), new Date(result['date_added'])),
						'status': result['status'],
						'comment': nl2br(result['comment'])
					});
				}

				data['continue'] = await this.url.link('account/return', url, true);

				data['column_left'] = await this.load.controller('common/column_left');
				data['column_right'] = await this.load.controller('common/column_right');
				data['content_top'] = await this.load.controller('common/content_top');
				data['content_bottom'] = await this.load.controller('common/content_bottom');
				data['footer'] = await this.load.controller('common/footer');
				data['header'] = await this.load.controller('common/header');

				this.response.setOutput(await this.load.view('account/return_info', data));

			} else {
				this.document.setTitle(this.language.get('text_return'));

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
					'href': await this.url.link('account/return', '', true)
				});

				let url = '';

				if ((this.request.get['page'])) {
					url += '&page=' + this.request.get['page'];
				}

				data['breadcrumbs'].push({
					'text': this.language.get('text_return'),
					'href': await this.url.link('account/return/info', 'return_id=' + return_id + url, true)
				});

				data['continue'] = await this.url.link('account/return', '', true);

				data['column_left'] = await this.load.controller('common/column_left');
				data['column_right'] = await this.load.controller('common/column_right');
				data['content_top'] = await this.load.controller('common/content_top');
				data['content_bottom'] = await this.load.controller('common/content_bottom');
				data['footer'] = await this.load.controller('common/footer');
				data['header'] = await this.load.controller('common/header');

				this.response.setOutput(await this.load.view('error/not_found', data));
			}
		}
	}

	async add() {
		const data = {};
		await this.load.language('account/return');

		this.load.model('account/return', this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_account_return.addReturn(this.request.post);

			this.response.setRedirect(await this.url.link('account/return/success', '', true));
		}

		this.document.setTitle(this.language.get('heading_title'));
		this.document.addScript('catalog/view/javascript/jquery/datetimepicker/moment/moment.min.js');
		this.document.addScript('catalog/view/javascript/jquery/datetimepicker/moment/moment-with-locales.min.js');
		this.document.addScript('catalog/view/javascript/jquery/datetimepicker/bootstrap-datetimepicker.min.js');
		this.document.addStyle('catalog/view/javascript/jquery/datetimepicker/bootstrap-datetimepicker.min.css');

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
			'href': await this.url.link('account/return/add', '', true)
		});

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.error['order_id'])) {
			data['error_order_id'] = this.error['order_id'];
		} else {
			data['error_order_id'] = '';
		}

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

		if ((this.error['product'])) {
			data['error_product'] = this.error['product'];
		} else {
			data['error_product'] = '';
		}

		if ((this.error['model'])) {
			data['error_model'] = this.error['model'];
		} else {
			data['error_model'] = '';
		}

		if ((this.error['reason'])) {
			data['error_reason'] = this.error['reason'];
		} else {
			data['error_reason'] = '';
		}

		data['action'] = await this.url.link('account/return/add', '', true);

		this.load.model('account/order', this);
		let order_info;
		if ((this.request.get['order_id'])) {
			order_info = await this.model_account_order.getOrder(this.request.get['order_id']);
		}

		this.load.model('catalog/product', this);
		let product_info;
		if ((this.request.get['product_id'])) {
			product_info = await this.model_catalog_product.getProduct(this.request.get['product_id']);
		}

		if ((this.request.post['order_id'])) {
			data['order_id'] = this.request.post['order_id'];
		} else if ((order_info)) {
			data['order_id'] = order_info['order_id'];
		} else {
			data['order_id'] = '';
		}

		if ((this.request.post['product_id'])) {
			data['product_id'] = this.request.post['product_id'];
		} else if ((product_info)) {
			data['product_id'] = product_info['product_id'];
		} else {
			data['product_id'] = '';
		}

		if ((this.request.post['date_ordered'])) {
			data['date_ordered'] = this.request.post['date_ordered'];
		} else if ((order_info)) {
			data['date_ordered'] = date('Y-m-d', new Date(order_info['date_added']));
		} else {
			data['date_ordered'] = '';
		}

		if ((this.request.post['firstname'])) {
			data['firstname'] = this.request.post['firstname'];
		} else if ((order_info)) {
			data['firstname'] = order_info['firstname'];
		} else {
			data['firstname'] = await this.customer.getFirstName();
		}

		if ((this.request.post['lastname'])) {
			data['lastname'] = this.request.post['lastname'];
		} else if ((order_info)) {
			data['lastname'] = order_info['lastname'];
		} else {
			data['lastname'] = await this.customer.getLastName();
		}

		if ((this.request.post['email'])) {
			data['email'] = this.request.post['email'];
		} else if ((order_info)) {
			data['email'] = order_info['email'];
		} else {
			data['email'] = await this.customer.getEmail();
		}

		if ((this.request.post['telephone'])) {
			data['telephone'] = this.request.post['telephone'];
		} else if ((order_info)) {
			data['telephone'] = order_info['telephone'];
		} else {
			data['telephone'] = await this.customer.getTelephone();
		}

		if ((this.request.post['product'])) {
			data['product'] = this.request.post['product'];
		} else if ((product_info)) {
			data['product'] = product_info['name'];
		} else {
			data['product'] = '';
		}

		if ((this.request.post['model'])) {
			data['model'] = this.request.post['model'];
		} else if ((product_info)) {
			data['model'] = product_info['model'];
		} else {
			data['model'] = '';
		}

		if ((this.request.post['quantity'])) {
			data['quantity'] = this.request.post['quantity'];
		} else {
			data['quantity'] = 1;
		}

		if ((this.request.post['opened'])) {
			data['opened'] = this.request.post['opened'];
		} else {
			data['opened'] = false;
		}

		if ((this.request.post['return_reason_id'])) {
			data['return_reason_id'] = this.request.post['return_reason_id'];
		} else {
			data['return_reason_id'] = '';
		}

		this.load.model('localisation/return_reason', this);

		data['return_reasons'] = await this.model_localisation_return_reason.getReturnReasons();

		if ((this.request.post['comment'])) {
			data['comment'] = this.request.post['comment'];
		} else {
			data['comment'] = '';
		}

		// Captcha
		if (Number(this.config.get('captcha_' + this.config.get('config_captcha') + '_status')) && this.config.get('config_captcha_page').includes('return')) {
			data['captcha'] = await this.load.controller('extension/captcha/' + this.config.get('config_captcha'), this.error);
		} else {
			data['captcha'] = '';
		}

		if (this.config.get('config_return_id')) {
			this.load.model('catalog/information', this);

			const information_info = await this.model_catalog_information.getInformation(this.config.get('config_return_id'));

			if (information_info.information_id) {
				data['text_agree'] = sprintf(this.language.get('text_agree'), await this.url.link('information/information/agree', 'information_id=' + this.config.get('config_return_id'), true), information_info['title']);
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

		this.response.setOutput(await this.load.view('account/return_form', data));
	}

	async validate() {
		if (!this.request.post['order_id']) {
			this.error['order_id'] = this.language.get('error_order_id');
		}

		if ((utf8_strlen(trim(this.request.post['firstname'])) < 1) || (utf8_strlen(trim(this.request.post['firstname'])) > 32)) {
			this.error['firstname'] = this.language.get('error_firstname');
		}

		if ((utf8_strlen(trim(this.request.post['lastname'])) < 1) || (utf8_strlen(trim(this.request.post['lastname'])) > 32)) {
			this.error['lastname'] = this.language.get('error_lastname');
		}

		if ((utf8_strlen(this.request.post['email']) > 96) || !isEmailValid(this.request.post['email'])) {
			this.error['email'] = this.language.get('error_email');
		}

		if ((utf8_strlen(this.request.post['telephone']) < 3) || (utf8_strlen(this.request.post['telephone']) > 32)) {
			this.error['telephone'] = this.language.get('error_telephone');
		}

		if ((utf8_strlen(this.request.post['product']) < 1) || (utf8_strlen(this.request.post['product']) > 255)) {
			this.error['product'] = this.language.get('error_product');
		}

		if ((utf8_strlen(this.request.post['model']) < 1) || (utf8_strlen(this.request.post['model']) > 64)) {
			this.error['model'] = this.language.get('error_model');
		}

		if (!(this.request.post['return_reason_id'])) {
			this.error['reason'] = this.language.get('error_reason');
		}

		if (Number(this.config.get('captcha_' + this.config.get('config_captcha') + '_status')) && this.config.get('config_captcha_page').includes('return')) {
			const captcha = await this.load.controller('extension/captcha/' + this.config.get('config_captcha') + '/validate');

			if (captcha) {
				this.error['captcha'] = captcha;
			}
		}

		if (this.config.get('config_return_id')) {
			this.load.model('catalog/information', this);

			const information_info = await this.model_catalog_information.getInformation(this.config.get('config_return_id'));

			if (information_info.information_id && !(this.request.post['agree'])) {
				this.error['warning'] = sprintf(this.language.get('error_agree'), information_info['title']);
			}
		}

		return !Object.keys(this.error).length;
	}

	async success() {
		const data = {};
		await this.load.language('account/return');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/home')
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('account/return', '', true)
		});

		data['continue'] = await this.url.link('common/home');

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.setOutput(await this.load.view('common/success', data));
	}
}
