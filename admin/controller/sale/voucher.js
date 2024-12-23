const strtotime = require("locutus/php/datetime/strtotime");
const sprintf = require("locutus/php/strings/sprintf");

module.exports = class VoucherController extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('sale/voucher');

		this.document.setTitle(this.language.get('heading_title'));

		let url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('sale/voucher', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['add'] = await this.url.link('sale/voucher.form', 'user_token=' + this.session.data['user_token'] + url);
		data['delete'] = await this.url.link('sale/voucher.delete', 'user_token=' + this.session.data['user_token']);

		data['list'] = await this.getList();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('sale/voucher', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('sale/voucher');

		this.response.setOutput(await this.getList());
	}

	/**
	 * @return string
	 */
	async getList() {
		const data = {};
		let sort = 'v.data_added';
		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		}
		let order = 'DESC';
		if ((this.request.get['order'])) {
			order = this.request.get['order'];
		}

		let page = 1;
		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		}

		let url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['action'] = await this.url.link('sale/voucher.list', 'user_token=' + this.session.data['user_token'] + url);

		data['vouchers'] = [];

		let filter_data = {
			'sort': sort,
			'order': order,
			'start': (page - 1) * Number(this.config.get('config_pagination_admin')),
			'limit': this.config.get('config_pagination_admin')
		};

		this.load.model('sale/voucher', this);

		const voucher_total = await this.model_sale_voucher.getTotalVouchers();

		const results = await this.model_sale_voucher.getVouchers(filter_data);

		for (let result of results) {
			let order_href = '';
			if (result['order_id']) {
				order_href = await this.url.link('sale/order.info', 'user_token=' + this.session.data['user_token'] + '&order_id=' + result['order_id'] + url);
			}

			data['vouchers'].push({
				'voucher_id': result['voucher_id'],
				'code': result['code'],
				'status': result['status'],
				'from': result['from_name'],
				'to': result['to_name'],
				'theme': result['theme'],
				'amount': this.currency.format(result['amount'], this.config.get('config_currency')),
				'date_added': date(this.language.get('date_format_short'), new Date(result['date_added'])),
				'edit': await this.url.link('sale/voucher.form', 'user_token=' + this.session.data['user_token'] + '&voucher_id=' + result['voucher_id'] + url),
				'order': order_href
			});
		}

		url = '';

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		data['sort_code'] = await this.url.link('sale/voucher.list', 'user_token=' + this.session.data['user_token'] + '&sort=v.code' + url);
		data['sort_from'] = await this.url.link('sale/voucher.list', 'user_token=' + this.session.data['user_token'] + '&sort=v.from_name' + url);
		data['sort_to'] = await this.url.link('sale/voucher.list', 'user_token=' + this.session.data['user_token'] + '&sort=v.to_name' + url);
		data['sort_theme'] = await this.url.link('sale/voucher.list', 'user_token=' + this.session.data['user_token'] + '&sort=theme' + url);
		data['sort_amount'] = await this.url.link('sale/voucher.list', 'user_token=' + this.session.data['user_token'] + '&sort=v.amount' + url);
		data['sort_status'] = await this.url.link('sale/voucher.list', 'user_token=' + this.session.data['user_token'] + '&sort=v.status' + url);
		data['sort_date_added'] = await this.url.link('sale/voucher.list', 'user_token=' + this.session.data['user_token'] + '&sort=v.date_added' + url);

		url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': voucher_total,
			'page': page,
			'limit': this.config.get('config_pagination_admin'),
			'url': await this.url.link('sale/voucher.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (voucher_total) ? ((page - 1) * Number(this.config.get('config_pagination_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_pagination_admin'))) > (voucher_total - this.config.get('config_pagination_admin'))) ? voucher_total : (((page - 1) * Number(this.config.get('config_pagination_admin'))) + this.config.get('config_pagination_admin')), voucher_total, Math.ceil(voucher_total / this.config.get('config_pagination_admin')));

		data['sort'] = sort;
		data['order'] = order;

		return await this.load.view('sale/voucher_list', data);
	}

	/**
	 * @return void
	 */
	async form() {
		const data = {};
		await this.load.language('sale/voucher');

		this.document.setTitle(this.language.get('heading_title'));

		data['text_form'] = !(this.request.get['voucher_id']) ? this.language.get('text_add') : this.language.get('text_edit');

		let url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('sale/voucher', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['save'] = await this.url.link('sale/voucher.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = await this.url.link('sale/voucher', 'user_token=' + this.session.data['user_token'] + url);
		let voucher_info;
		if ((this.request.get['voucher_id'])) {
			this.load.model('sale/voucher', this);

			voucher_info = await this.model_sale_voucher.getVoucher(this.request.get['voucher_id']);
		}

		if ((this.request.get['voucher_id'])) {
			data['voucher_id'] = this.request.get['voucher_id'];
		} else {
			data['voucher_id'] = 0;
		}

		if ((voucher_info)) {
			data['code'] = voucher_info['code'];
		} else {
			data['code'] = '';
		}

		if ((voucher_info)) {
			data['from_name'] = voucher_info['from_name'];
		} else {
			data['from_name'] = '';
		}

		if ((voucher_info)) {
			data['from_email'] = voucher_info['from_email'];
		} else {
			data['from_email'] = '';
		}

		if ((voucher_info)) {
			data['to_name'] = voucher_info['to_name'];
		} else {
			data['to_name'] = '';
		}

		if ((voucher_info)) {
			data['to_email'] = voucher_info['to_email'];
		} else {
			data['to_email'] = '';
		}

		this.load.model('sale/voucher_theme', this);

		data['voucher_themes'] = await this.model_sale_voucher_theme.getVoucherThemes();

		if ((voucher_info)) {
			data['voucher_theme_id'] = voucher_info['voucher_theme_id'];
		} else {
			data['voucher_theme_id'] = '';
		}

		if ((voucher_info)) {
			data['message'] = voucher_info['message'];
		} else {
			data['message'] = '';
		}

		if ((voucher_info)) {
			data['amount'] = voucher_info['amount'];
		} else {
			data['amount'] = '';
		}

		if ((voucher_info)) {
			data['status'] = voucher_info['status'];
		} else {
			data['status'] = true;
		}

		data['history'] = await this.getHistory();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('sale/voucher_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('sale/voucher');

		const json = { error: {} };

		if (!await this.user.hasPermission('modify', 'sale/voucher')) {
			json['error']['warning'] = this.language.get('error_permission');
		}

		if ((oc_strlen(this.request.post['code']) < 3) || (oc_strlen(this.request.post['code']) > 10)) {
			json['error']['code'] = this.language.get('error_code');
		}

		this.load.model('sale/voucher', this);

		const voucher_info = await this.model_sale_voucher.getVoucherByCode(this.request.post['code']);

		if (voucher_info.voucher_id) {
			if (!(this.request.post['voucher_id'])) {
				json['error']['warning'] = this.language.get('error_exists');
			} else if (voucher_info['voucher_id'] != this.request.post['voucher_id']) {
				json['error']['warning'] = this.language.get('error_exists');
			}
		}

		if ((oc_strlen(this.request.post['to_name']) < 1) || (oc_strlen(this.request.post['to_name']) > 64)) {
			json['error']['to_name'] = this.language.get('error_to_name');
		}

		if ((oc_strlen(this.request.post['to_email']) > 96) || !isEmailValid(this.request.post['to_email'])) {
			json['error']['to_email'] = this.language.get('error_email');
		}

		if ((oc_strlen(this.request.post['from_name']) < 1) || (oc_strlen(this.request.post['from_name']) > 64)) {
			json['error']['from_name'] = this.language.get('error_from_name');
		}

		if ((oc_strlen(this.request.post['from_email']) > 96) || !isEmailValid(this.request.post['from_email'])) {
			json['error']['from_email'] = this.language.get('error_email');
		}

		if (this.request.post['amount'] < 1) {
			json['error']['amount'] = this.language.get('error_amount');
		}

		if (!Object.keys(json.error).length) {
			this.request.post['voucher_id'] = Number(this.request.post['voucher_id']);
			if (!this.request.post['voucher_id']) {
				json['voucher_id'] = await this.model_sale_voucher.addVoucher(this.request.post);
			} else {
				await this.model_sale_voucher.editVoucher(this.request.post['voucher_id'], this.request.post);
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
		await this.load.language('sale/voucher');

		const json = {};

		let selected = [];
		if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		}

		if (!await this.user.hasPermission('modify', 'sale/voucher')) {
			json['error'] = this.language.get('error_permission');
		}

		this.load.model('sale/order', this);

		for (let voucher_id of selected) {
			const order_voucher_info = await this.model_sale_order.getVoucherByVoucherId(voucher_id);

			if (order_voucher_info.order_voucher_id) {
				json['error'] = sprintf(this.language.get('error_order'), await this.url.link('sale/order.info', 'user_token=' + this.session.data['user_token'] + '&order_id=' + order_voucher_info['order_id']));

				break;
			}
		}

		if (!Object.keys(json).length) {
			this.load.model('sale/voucher', this);

			for (let voucher_id of selected) {
				await this.model_sale_voucher.deleteVoucher(voucher_id);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async history() {
		await this.load.language('sale/voucher');

		this.response.setOutput(await this.getHistory());
	}

	/**
	 * @return string
	 */
	async getHistory() {
		const data = {};
		let voucher_id = 0;
		if ((this.request.get['voucher_id'])) {
			voucher_id = this.request.get['voucher_id'];
		}
		let page = 1;
		if ((this.request.get['page']) && this.request.get['route'] == 'sale/voucher.history') {
			page = Number(this.request.get['page']);
		}

		let limit = 10;

		data['histories'] = [];

		this.load.model('sale/voucher', this);

		const results = await this.model_sale_voucher.getHistories(voucher_id, (page - 1) * limit, limit);

		for (let result of results) {
			data['histories'].push({
				'order_id': result['order_id'],
				'customer': result['customer'],
				'amount': this.currency.format(result['amount'], this.config.get('config_currency')),
				'date_added': date(this.language.get('date_format_short'), new Date(result['date_added']))
			});
		}

		const history_total = await this.model_sale_voucher.getTotalHistories(voucher_id);

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': history_total,
			'page': page,
			'limit': limit,
			'url': await this.url.link('sale/voucher.history', 'user_token=' + this.session.data['user_token'] + '&voucher_id=' + voucher_id + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (history_total) ? ((page - 1) * limit) + 1 : 0, (((page - 1) * limit) > (history_total - limit)) ? history_total : (((page - 1) * limit) + limit), history_total, Math.ceil(history_total / limit));

		return await this.load.view('sale/voucher_history', data);
	}

	/**
	 * @return void
	 */
	async send() {
		await this.load.language('mail/voucher');

		const json = {};

		if (!await this.user.hasPermission('modify', 'sale/voucher')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('sale/voucher', this);

			let vouchers = [];

			if ((this.request.post['selected'])) {
				vouchers = this.request.post['selected'];
			}

			if ((this.request.post['voucher_id'])) {
				vouchers.push(this.request.post['voucher_id']);
			}
			if (!Array.isArray(vouchers))
				vouchers = [vouchers];
			if (vouchers.length) {
				for (let voucher_id of vouchers) {
					await this.load.controller('mail/voucher', voucher_id);
				}

				json['success'] = this.language.get('text_sent');
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
