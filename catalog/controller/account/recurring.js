module.exports = class ControllerAccountRecurring extends Controller {
	async index() {
		const data = {};
		if (!await this.customer.isLogged()) {
			this.session.data['redirect'] = await this.url.link('account/recurring', '', true);
			await this.session.save(this.session.data);
			this.response.setRedirect(await this.url.link('account/login', '', true));
		}

		await this.load.language('account/recurring');

		this.document.setTitle(this.language.get('heading_title'));

		let url = '';

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

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
			'href': await this.url.link('account/recurring', url, true)
		});

		let page = 1;
		if ((this.request.get['page'])) {
			page = this.request.get['page'];
		}

		const limit = 10;

		data['recurrings'] = [];

		this.load.model('account/recurring', this);

		const recurring_total = await this.model_account_recurring.getTotalOrderRecurrings();

		const results = await this.model_account_recurring.getOrderRecurrings((Number(page) - 1) * limit, limit);

		for (let result of results) {
			let status = '';
			if (result['status']) {
				status = this.language.get('text_status_' + result['status']);
			}

			data['recurrings'].push({
				'order_recurring_id': result['order_recurring_id'],
				'product': result['product_name'],
				'status': status,
				'date_added': date(this.language.get('date_format_short'), new Date(result['date_added'])),
				'view': await this.url.link('account/recurring/info', 'order_recurring_id=' + result['order_recurring_id'], true),
			});
		}

		const pagination = new Pagination();
		pagination.total = recurring_total;
		pagination.page = page;
		pagination.limit = limit;
		pagination.url = await this.url.link('account/recurring', 'page={page}', true);

		data['pagination'] = pagination.render();

		data['continue'] = await this.url.link('account/account', '', true);

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.setOutput(await this.load.view('account/recurring_list', data));
	}

	async info() {
		const data = {};
		await this.load.language('account/recurring');
		let order_recurring_id = 0;
		if ((this.request.get['order_recurring_id'])) {
			order_recurring_id = this.request.get['order_recurring_id'];
		}

		if (!await this.customer.isLogged()) {
			this.session.data['redirect'] = await this.url.link('account/recurring/info', 'order_recurring_id=' + order_recurring_id, true);
			await this.session.save(this.session.data);
			this.response.setRedirect(await this.url.link('account/login', '', true));
		}

		this.load.model('account/recurring', this);

		const recurring_info = await this.model_account_recurring.getOrderRecurring(order_recurring_id);

		if (recurring_info.recurring_id) {
			this.document.setTitle(this.language.get('text_recurring'));

			let url = '';

			if ((this.request.get['page'])) {
				url += '&page=' + this.request.get['page'];
			}

			data['breadcrumbs'] = [];

			data['breadcrumbs'].push({
				'text': this.language.get('text_home'),
				'href': await this.url.link('common/home'),
			});

			data['breadcrumbs'].push({
				'text': this.language.get('text_account'),
				'href': await this.url.link('account/account', '', true),
			});

			data['breadcrumbs'].push({
				'text': this.language.get('heading_title'),
				'href': await this.url.link('account/recurring', url, true),
			});

			data['breadcrumbs'].push({
				'text': this.language.get('text_recurring'),
				'href': await this.url.link('account/recurring/info', 'order_recurring_id=' + this.request.get['order_recurring_id'] + url, true),
			});

			data['order_recurring_id'] = this.request.get['order_recurring_id'];
			data['date_added'] = date(this.language.get('date_format_short'), strtotime(recurring_info['date_added']));

			if (recurring_info['status']) {
				data['status'] = this.language.get('text_status_' + recurring_info['status']);
			} else {
				data['status'] = '';
			}

			data['payment_method'] = recurring_info['payment_method'];

			data['order_id'] = recurring_info['order_id'];
			data['product_name'] = recurring_info['product_name'];
			data['product_quantity'] = recurring_info['product_quantity'];
			data['recurring_description'] = recurring_info['recurring_description'];
			data['reference'] = recurring_info['reference'];

			// Transactions
			data['transactions'] = array();

			const results = await this.model_account_recurring.getOrderRecurringTransactions(this.request.get['order_recurring_id']);

			for (let result of results) {
				data['transactions'].push({
					'date_added': date(this.language.get('date_format_short'), new Date(result['date_added'])),
					'type': result['type'],
					'amount': this.currency.format(result['amount'], recurring_info['currency_code'])
				});
			}

			data['order'] = await this.url.link('account/order/info', 'order_id=' + recurring_info['order_id'], true);
			data['product'] = await this.url.link('product/product', 'product_id=' + recurring_info['product_id'], true);

			data['recurring'] = await this.load.controller('extension/recurring/' + recurring_info['payment_code']);

			data['column_left'] = await this.load.controller('common/column_left');
			data['column_right'] = await this.load.controller('common/column_right');
			data['content_top'] = await this.load.controller('common/content_top');
			data['content_bottom'] = await this.load.controller('common/content_bottom');
			data['footer'] = await this.load.controller('common/footer');
			data['header'] = await this.load.controller('common/header');

			this.response.setOutput(await this.load.view('account/recurring_info', data));
		} else {
			this.document.setTitle(this.language.get('text_recurring'));

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
				'href': await this.url.link('account/recurring', '', true)
			});

			data['breadcrumbs'].push({
				'text': this.language.get('text_recurring'),
				'href': await this.url.link('account/recurring/info', 'order_recurring_id=' + order_recurring_id, true)
			});

			data['continue'] = await this.url.link('account/recurring', '', true);

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
