const sprintf = require("locutus/php/strings/sprintf");

module.exports = class CartCommonController extends Controller {
	/**
	 * @return string
	 */
	async index() {
		const data = {};
		await this.load.language('common/cart');
		let totals = [];
		let taxes = await this.cart.getTaxes();
		let total = 0;
		this.load.model('checkout/cart', this);

		if (await this.customer.isLogged() || !Number(this.config.get('config_customer_price'))) {

			let dataTotals = await this.model_checkout_cart.getTotals(totals, taxes, total);
			// console.log('dataTotals---', dataTotals)
			totals = dataTotals.totals || [];
			taxes = dataTotals.taxes || {};
			total = dataTotals.total || 0;
		}

		data['text_items'] = sprintf(this.language.get('text_items'), await this.cart.countProducts() + ((this.session.data['vouchers']) ? this.session.data['vouchers'].length : 0), this.currency.format(total, this.session.data['currency']));

		// Products
		data['products'] = [];

		let products = await this.model_checkout_cart.getProducts();

		for (let product of products) {
			if (product['option']) {
				for (let [key, option] of Object.entries(product['option'])) {
					product['option'][key]['value'] = (oc_strlen(option['value']) > 20 ? oc_substr(option['value'], 0, 20) + '..' : option['value']);
				}
			}

			// Display prices
			let price = false;
			let total = false;
			if (await this.customer.isLogged() || !Number(this.config.get('config_customer_price'))) {
				let unit_price = this.tax.calculate(product['price'], product['tax_class_id'], Number(this.config.get('config_tax')));
				price = this.currency.format(unit_price, this.session.data['currency']);
				total = this.currency.format(unit_price * product['quantity'], this.session.data['currency']);
			}

			let description = '';

			if (product['subscription']) {
				if (product['subscription']['trial_status']) {
					let trial_price = this.currency.format(this.tax.calculate(product['subscription']['trial_price'], product['tax_class_id'], Number(this.config.get('config_tax'))), this.session.data['currency']);
					let trial_cycle = product['subscription']['trial_cycle'];
					let trial_frequency = this.language.get('text_' + product['subscription']['trial_frequency']);
					let trial_duration = product['subscription']['trial_duration'];

					description += sprintf(this.language.get('text_subscription_trial'), trial_price, trial_cycle, trial_frequency, trial_duration);
				}

				if (await this.customer.isLogged() || !Number(this.config.get('config_customer_price'))) {
					price = this.currency.format(this.tax.calculate(product['subscription']['price'], product['tax_class_id'], Number(this.config.get('config_tax'))), this.session.data['currency']);
				}

				let cycle = product['subscription']['cycle'];
				let frequency = this.language.get('text_' + product['subscription']['frequency']);
				let duration = product['subscription']['duration'];

				if (duration) {
					description += sprintf(this.language.get('text_subscription_duration'), price, cycle, frequency, duration);
				} else {
					description += sprintf(this.language.get('text_subscription_cancel'), price, cycle, frequency);
				}
			}

			data['products'].push({
				'cart_id': product['cart_id'],
				'thumb': product['image'],
				'name': product['name'],
				'model': product['model'],
				'option': product['option'],
				'subscription': description,
				'quantity': product['quantity'],
				'price': price,
				'total': total,
				'reward': product['reward'],
				'href': await this.url.link('product/product', 'language=' + this.config.get('config_language') + '&product_id=' + product['product_id'])
			});
		}

		// Gift Voucher
		data['vouchers'] = [];

		const vouchers = await this.model_checkout_cart.getVouchers();

		for (let [key, voucher] of Object.entries(vouchers)) {
			data['vouchers'].push({
				'key': key,
				'description': voucher['description'],
				'amount': this.currency.format(voucher['amount'], this.session.data['currency'])
			});
		}

		// Totals
		data['totals'] = [];
		// console.log('totals',totals)
		for (let total of totals) {
			data['totals'].push({
				'title': total['title'],
				'text': this.currency.format(total['value'], this.session.data['currency'])
			});
		}

		data['list'] = await this.url.link('common/cart.info', 'language=' + this.config.get('config_language'));
		data['product_remove'] = await this.url.link('common/cart.removeProduct', 'language=' + this.config.get('config_language'));
		data['voucher_remove'] = await this.url.link('common/cart.removeVoucher', 'language=' + this.config.get('config_language'));

		data['cart'] = await this.url.link('checkout/cart', 'language=' + this.config.get('config_language'));
		data['checkout'] = await this.url.link('checkout/checkout', 'language=' + this.config.get('config_language'));

		return await this.load.view('common/cart', data);
	}

	/**
	 * @return void
	 */
	async info() {
		this.response.setOutput(await this.index());
	}

	/**
	 * @return void
	 */
	async removeProduct() {
		await this.load.language('checkout/cart');

		const json = {};
		let key = 0;
		if ((this.request.post['key'])) {
			key = this.request.post['key'];
		}

		if (!await this.cart.has(key)) {
			json['error'] = this.language.get('error_product');
		}

		if (!Object.keys(json).length) {
			await this.cart.remove(key);

			json['success'] = this.language.get('text_remove');

			delete this.session.data['shipping_method'];
			delete this.session.data['shipping_methods'];
			delete this.session.data['payment_method'];
			delete this.session.data['payment_methods'];
			delete this.session.data['reward'];
		}
		await this.session.save(this.session.data);
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async removeVoucher() {
		await this.load.language('checkout/cart');

		const json = {};
		let key = '';
		if ((this.request.get['key'])) {
			key = this.request.get['key'];
		}

		if (!(this.session.data['vouchers'][key])) {
			json['error'] = this.language.get('error_voucher');
		}

		if (!Object.keys(json).length) {
			json['success'] = this.language.get('text_remove');

			delete this.session.data['vouchers'][key];
			delete this.session.data['shipping_method'];
			delete this.session.data['shipping_methods'];
			delete this.session.data['payment_method'];
			delete this.session.data['payment_methods'];
			delete this.session.data['reward'];
		}
		await this.session.save(this.session.data);
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
