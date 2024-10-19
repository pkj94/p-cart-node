module.exports = class SuccessController extends Controller {
	/**
	 * @return void
	 */
	async index() {
const data ={};
		await this.load.language('checkout/success');

		if ((this.session.data['order_id'])) {
			await this.cart.clear();

			delete (this.session.data['order_id']);
			delete (this.session.data['payment_method']);
			delete (this.session.data['payment_methods']);
			delete (this.session.data['shipping_method']);
			delete (this.session.data['shipping_methods']);
			delete (this.session.data['comment']);
			delete (this.session.data['agree']);
			delete (this.session.data['coupon']);
			delete (this.session.data['reward']);
			delete (this.session.data['voucher']);
			delete (this.session.data['vouchers']);
		}

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : await this.url.link('common/home', 'language=' + this.config.get('config_language'))
		];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_basket'),
			'href' : await this.url.link('checkout/cart', 'language=' + this.config.get('config_language'))
		];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_checkout'),
			'href' : await this.url.link('checkout/checkout', 'language=' + this.config.get('config_language'))
		];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_success'),
			'href' : await this.url.link('checkout/success', 'language=' + this.config.get('config_language'))
		];

		if (await this.customer.isLogged()) {
			data['text_message'] = sprintf(this.language.get('text_customer'), await this.url.link('account/account', 'language=' + this.config.get('config_language') +  '&customer_token=' + this.session.data['customer_token']), await this.url.link('account/order', 'language=' + this.config.get('config_language') +  '&customer_token=' + this.session.data['customer_token']), await this.url.link('account/download', 'language=' + this.config.get('config_language') +  '&customer_token=' + this.session.data['customer_token']), await this.url.link('information/contact', 'language=' + this.config.get('config_language')));
		} else {
			data['text_message'] = sprintf(this.language.get('text_guest'), await this.url.link('information/contact', 'language=' + this.config.get('config_language')));
		}

		data['continue'] = await this.url.link('common/home', 'language=' + this.config.get('config_language'));

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.setOutput(await this.load.view('common/success', data));
	}
}