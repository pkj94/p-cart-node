module.exports = class ControllerAccountSuccess extends Controller {
	async index() {
		const data = {};
		await this.load.language('account/success');

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
			'text': this.language.get('text_success'),
			'href': await this.url.link('account/success')
		});

		if (await this.customer.isLogged()) {
			data['text_message'] = sprintf(this.language.get('text_message'), await this.url.link('information/contact'));
		} else {
			data['text_message'] = sprintf(this.language.get('text_approval'), this.config.get('config_name'), await this.url.link('information/contact'));
		}

		if (await this.cart.hasProducts()) {
			data['continue'] = await this.url.link('checkout/cart');
		} else {
			data['continue'] = await this.url.link('account/account', '', true);
		}

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.setOutput(await this.load.view('common/success', data));
	}
}