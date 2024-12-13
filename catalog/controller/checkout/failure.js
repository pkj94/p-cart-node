module.exports = class ControllerCheckoutFailure extends Controller {
	async index() {
const data = {};
		await this.load.language('checkout/failure');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : await this.url.link('common/home')
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('text_basket'),
			'href' : await this.url.link('checkout/cart')
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('text_checkout'),
			'href' : await this.url.link('checkout/checkout', '', true)
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('text_failure'),
			'href' : await this.url.link('checkout/failure')
		});

		data['text_message'] = sprintf(this.language.get('text_message'), await this.url.link('information/contact'));

		data['continue'] = await this.url.link('common/home');

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.setOutput(await this.load.view('common/success', data));
	}
}