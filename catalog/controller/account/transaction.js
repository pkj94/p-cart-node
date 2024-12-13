module.exports = class ControllerAccountTransaction extends Controller {
	async index() {
		const data = {};
		if (!await this.customer.isLogged()) {
			this.session.data['redirect'] = await this.url.link('account/transaction', '', true);
			await this.session.save(this.session.data);
			this.response.setRedirect(await this.url.link('account/login', '', true));
		}

		await this.load.language('account/transaction');

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

		data['breadcrumbs'].push({
			'text': this.language.get('text_transaction'),
			'href': await this.url.link('account/transaction', '', true)
		});

		this.load.model('account/transaction',this);

		data['column_amount'] = sprintf(this.language.get('column_amount'), this.config.get('config_currency'));

		let page = 1;
		if ((this.request.get['page'])) {
			page = this.request.get['page'];
		}

		const limit = 10;

		data['transactions'] = [];

		const filter_data = {
			'sort': 'date_added',
			'order': 'DESC',
			'start': (Number(page) - 1) * limit,
			'limit': limit
		};

		const transaction_total = await this.model_account_transaction.getTotalTransactions();

		const results = await this.model_account_transaction.getTransactions(filter_data);

		for (let result of results) {
			data['transactions'].push({
				'amount': this.currency.format(result['amount'], this.config.get('config_currency')),
				'description': result['description'],
				'date_added': date(this.language.get('date_format_short'), new Date(result['date_added']))
			});
		}

		const pagination = new Pagination();
		pagination.total = transaction_total;
		pagination.page = page;
		pagination.limit = limit;
		pagination.url = await this.url.link('account/transaction', 'page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (transaction_total) ? ((Number(page) - 1) * limit) + 1 : 0, (((Number(page) - 1) * limit) > (transaction_total - limit)) ? transaction_total : (((Number(page) - 1) * limit) + limit), transaction_total, Math.ceil(transaction_total / limit));

		data['total'] = this.currency.format(await this.customer.getBalance(), this.session.data['currency']);

		data['continue'] = await this.url.link('account/account', '', true);

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.setOutput(await this.load.view('account/transaction', data));
	}
}
