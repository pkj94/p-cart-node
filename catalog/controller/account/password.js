module.exports = class ControllerAccountPassword extends Controller {
	error = {};

	async index() {
const data = {};
		if (!await this.customer.isLogged()) {
			this.session.data['redirect'] = await this.url.link('account/password', '', true);
			await this.session.save(this.session.data);
			this.response.setRedirect(await this.url.link('account/login', '', true));
		}

		await this.load.language('account/password');

		this.document.setTitle(this.language.get('heading_title'));

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			this.load.model('account/customer',this);

			await this.model_account_customer.editPassword(await this.customer.getEmail(), this.request.post['password']);

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
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('account/password', '', true)
		});

		if ((this.error['password'])) {
			data['error_password'] = this.error['password'];
		} else {
			data['error_password'] = '';
		}

		if ((this.error['confirm'])) {
			data['error_confirm'] = this.error['confirm'];
		} else {
			data['error_confirm'] = '';
		}

		data['action'] = await this.url.link('account/password', '', true);

		if ((this.request.post['password'])) {
			data['password'] = this.request.post['password'];
		} else {
			data['password'] = '';
		}

		if ((this.request.post['confirm'])) {
			data['confirm'] = this.request.post['confirm'];
		} else {
			data['confirm'] = '';
		}

		data['back'] = await this.url.link('account/account', '', true);

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.setOutput(await this.load.view('account/password', data));
	}

	async validate() {
		if ((utf8_strlen(html_entity_decode(this.request.post['password'])) < 4) || (utf8_strlen(html_entity_decode(this.request.post['password'])) > 40)) {
			this.error['password'] = this.language.get('error_password');
		}

		if (this.request.post['confirm'] != this.request.post['password']) {
			this.error['confirm'] = this.language.get('error_confirm');
		}

		return !Object.keys(this.error).length;
	}
}