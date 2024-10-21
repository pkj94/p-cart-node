module.exports=class NewsletterController extends Controller {
	/**
	 * @return void
	 */
	async index() {
const data ={};
		await this.load.language('account/newsletter');

		if (!await this.customer.isLogged() || (!(this.request.get['customer_token']) || !(this.session.data['customer_token']) || (this.request.get['customer_token'] != this.session.data['customer_token']))) {
			this.session.data['redirect'] = await this.url.link('account/newsletter', 'language=' + this.config.get('config_language'));

			this.response.setRedirect(await this.url.link('account/login', 'language=' + this.config.get('config_language')));
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
			'text' : this.language.get('text_newsletter'),
			'href' : await this.url.link('account/newsletter', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token'])
		];

		data['save'] = await this.url.link('account/newsletter+save', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token']);

		data['newsletter'] = await this.customer.getNewsletter();

		data['back'] = await this.url.link('account/account', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token']);

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.setOutput(await this.load.view('account/newsletter', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('account/newsletter');

		const json = {};

		if (!await this.customer.isLogged() || (!(this.request.get['customer_token']) || !(this.session.data['customer_token']) || (this.request.get['customer_token'] != this.session.data['customer_token']))) {
			this.session.data['redirect'] = await this.url.link('account/newsletter', 'language=' + this.config.get('config_language'));

			json['redirect'] = await this.url.link('account/login', 'language=' + this.config.get('config_language'), true);
		}

		if (!Object.keys(json).length) {
			this.load.model('account/customer',this);

			await this.model_account_customer.editNewsletter(this.request.post['newsletter']);

			this.session.data['success'] = this.language.get('text_success');

			json['redirect'] = await this.url.link('account/account', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token'], true);
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
