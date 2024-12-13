module.exports = class ControllerAccountNewsletter extends Controller {
	async index() {
const data = {};
		if (!await this.customer.isLogged()) {
			this.session.data['redirect'] = await this.url.link('account/newsletter', '', true);
			await this.session.save(this.session.data);
			this.response.setRedirect(await this.url.link('account/login', '', true));
		}

		await this.load.language('account/newsletter');

		this.document.setTitle(this.language.get('heading_title'));

		if (this.request.server['method'] == 'POST') {
			this.load.model('account/customer',this);

			await this.model_account_customer.editNewsletter(this.request.post['newsletter']);

			this.session.data['success'] = this.language.get('text_success');

			this.response.setRedirect(await this.url.link('account/account', '', true));
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : await this.url.link('common/home')
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('text_account'),
			'href' : await this.url.link('account/account', '', true)
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('text_newsletter'),
			'href' : await this.url.link('account/newsletter', '', true)
		});

		data['action'] = await this.url.link('account/newsletter', '', true);

		data['newsletter'] = await this.customer.getNewsletter();

		data['back'] = await this.url.link('account/account', '', true);

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.setOutput(await this.load.view('account/newsletter', data));
	}
}