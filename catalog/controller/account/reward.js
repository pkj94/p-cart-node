module.exports=class RewardController extends Controller {
	/**
	 * @return void
	 */
	public function index() {
		await this.load.language('account/reward');

		if (!await this.customer.isLogged() || (!(this.request.get['customer_token']) || !(this.session.data['customer_token']) || (this.request.get['customer_token'] != this.session.data['customer_token']))) {
			this.session.data['redirect'] = await this.url.link('account/reward', 'language=' + this.config.get('config_language'));

			this.response.redirect(await this.url.link('account/login', 'language=' + this.config.get('config_language')));
		}

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : await this.url.link('common/home', 'language=' + this.config.get('config_language'))
		];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_account'),
			'href' : await this.url.link('account/account', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token'])
		];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_reward'),
			'href' : await this.url.link('account/reward', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token'])
		];

		this.load.model('account/reward');

		let page = 1;
if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		} 

		let limit = 10;

		data['rewards'] = [];

		filter_data = [
			'sort'  : 'date_added',
			'order' : 'DESC',
			'start' : (page - 1) * limit,
			'limit' : limit
		];

		reward_total = await this.model_account_reward.getTotalRewards();

		const results = await this.model_account_reward.getRewards(filter_data);

		for (let result of results) {
			data['rewards'].push({
				'order_id'    : result['order_id'],
				'points'      : result['points'],
				'description' : result['description'],
				'date_added'  : date(this.language.get('date_format_short'), new Date(result['date_added'])),
				'href'        : await this.url.link('account/order+info', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token'] + '&order_id=' + result['order_id'])
			];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total' : reward_total,
			'page'  : page,
			'limit' : limit,
			'url'   : await this.url.link('account/reward', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token'] + '&page={page}')
		]);

		data['results'] = sprintf(this.language.get('text_pagination'), (reward_total) ? ((page - 1) * limit) + 1 : 0, (((page - 1) * limit) > (reward_total - limit)) ? reward_total : (((page - 1) * limit) + limit), reward_total, ceil(reward_total / limit));

		data['total'] = await this.customer.getRewardPoints();

		data['continue'] = await this.url.link('account/account', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token']);

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.setOutput(await this.load.view('account/reward', data));
	}
}