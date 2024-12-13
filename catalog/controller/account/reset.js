module.exports = class ControllerAccountReset extends Controller {
	error = {};

	async index() {
const data = {};
		if (await this.customer.isLogged()) {
			this.response.setRedirect(await this.url.link('account/account', '', true));
		}

		if ((this.request.get['code'])) {
			code = this.request.get['code'];
		} else {
			code = '';
		}

		this.load.model('account/customer',this);

		customer_info = await this.model_account_customer.getCustomerByCode(code);

		if (customer_info) {
			await this.load.language('account/reset');

			this.document.setTitle(this.language.get('heading_title'));

			if ((this.request.server['method'] == 'POST') && await this.validate()) {
				await this.model_account_customer.editPassword(customer_info['email'], this.request.post['password']);

				this.session.data['success'] = this.language.get('text_success');

				this.response.setRedirect(await this.url.link('account/login', '', true));
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
				'href' : await this.url.link('account/reset', '', true)
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

			data['action'] = await this.url.link('account/reset', 'code=' + code, true);

			data['back'] = await this.url.link('account/login', '', true);

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

			data['column_left'] = await this.load.controller('common/column_left');
			data['column_right'] = await this.load.controller('common/column_right');
			data['content_top'] = await this.load.controller('common/content_top');
			data['content_bottom'] = await this.load.controller('common/content_bottom');
			data['footer'] = await this.load.controller('common/footer');
			data['header'] = await this.load.controller('common/header');

			this.response.setOutput(await this.load.view('account/reset', data));
		} else {
			await this.load.language('account/reset');

			this.session.data['error'] = this.language.get('error_code');

			return new Action('account/login');
		}
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
