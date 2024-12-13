module.exports = class ControllerAccountForgotten extends Controller {
	error = {};

	async index() {
const data = {};
		if (await this.customer.isLogged()) {
			this.response.setRedirect(await this.url.link('account/account', '', true));
		}

		await this.load.language('account/forgotten');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('account/customer',this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			customer_info = await this.model_account_customer.getCustomerByEmail(this.request.post['email']);

			// for better security use existing validated customer email address instead of the posted one
			await this.model_account_customer.editCode(customer_info['email'], token(40));

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
			'text' : this.language.get('text_forgotten'),
			'href' : await this.url.link('account/forgotten', '', true)
		});

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		data['action'] = await this.url.link('account/forgotten', '', true);

		data['back'] = await this.url.link('account/login', '', true);

		if ((this.request.post['email'])) {
			data['email'] = this.request.post['email'];
		} else {
			data['email'] = '';
		}

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.setOutput(await this.load.view('account/forgotten', data));
	}

	async validate() {
		if (!(this.request.post['email'])) {
			this.error['warning'] = this.language.get('error_email');
		} else if (!await this.model_account_customer.getTotalCustomersByEmail(this.request.post['email'])) {
			this.error['warning'] = this.language.get('error_email');
		}
		
		// Check if customer has been approved+
		customer_info = await this.model_account_customer.getCustomerByEmail(this.request.post['email']);

		if (customer_info && !customer_info['status']) {
			this.error['warning'] = this.language.get('error_approved');
		}

		return !Object.keys(this.error).length;
	}
}
