module.exports = class ControllerAccountReward extends Controller {
	async index() {
		const data = {};
		if (!await this.customer.isLogged()) {
			this.session.data['redirect'] = await this.url.link('account/reward', '', true);
			await this.session.save(this.session.data);
			this.response.setRedirect(await this.url.link('account/login', '', true));
		}

		await this.load.language('account/reward');

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
			'text': this.language.get('text_reward'),
			'href': await this.url.link('account/reward', '', true)
		});

		this.load.model('account/reward', this);

		let page = 1;
		if ((this.request.get['page'])) {
			page = this.request.get['page'];
		}

		const limit = 10;

		data['rewards'] = [];

		const filter_data = {
			'sort': 'date_added',
			'order': 'DESC',
			'start': (Number(page) - 1) * limit,
			'limit': limit
		};

		const reward_total = await this.model_account_reward.getTotalRewards();

		const results = await this.model_account_reward.getRewards(filter_data);

		for (let result of results) {
			data['rewards'].push({
				'order_id': result['order_id'],
				'points': result['points'],
				'description': result['description'],
				'date_added': date(this.language.get('date_format_short'), new Date(result['date_added'])),
				'href': await this.url.link('account/order/info', 'order_id=' + result['order_id'], true)
			});
		}

		const pagination = new Pagination();
		pagination.total = reward_total;
		pagination.page = page;
		pagination.limit = limit;
		pagination.url = await this.url.link('account/reward', 'page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (reward_total) ? ((Number(page) - 1) * limit) + 1 : 0, (((Number(page) - 1) * limit) > (reward_total - limit)) ? reward_total : (((Number(page) - 1) * limit) + limit), reward_total, Math.ceil(reward_total / limit));

		data['total'] = await this.customer.getRewardPoints();

		data['continue'] = await this.url.link('account/account', '', true);

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.setOutput(await this.load.view('account/reward', data));
	}
}
