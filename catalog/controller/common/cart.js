module.exports = class ControllerCommonCart extends Controller {
	async index() {
		const data = {};
		await this.load.language('common/cart');

		// Totals
		this.load.model('setting/extension', this);

		let totals = [];
		let taxes = await this.cart.getTaxes();
		let total = 0;

		// Because __call can not keep var references so we put them into an array.
		let total_data = {
			'totals': totals,
			'taxes': taxes,
			'total': total
		};

		// Display prices
		if (await this.customer.isLogged() || !Number(this.config.get('config_customer_price'))) {

			let results = await this.model_setting_extension.getExtensions('total');
			results = results.sort((a, b) => Number(this.config.get('total_' + a['code'] + '_sort_order')) - Number(this.config.get('total_' + b['code'] + '_sort_order')))

			for (let result of results) {
				if (Number(this.config.get('total_' + result['code'] + '_status'))) {
					this.load.model('extension/total/' + result['code'], this);

					// We have to put the totals in an array so that they pass by reference.
					total_data = await this['model_extension_total_' + result['code']].getTotal(total_data);
					totals = total_data.totals;
					taxes = total_data.taxes;
					total = total_data.total;
				}
			}

			totals = totals.sort((a, b) => a.sort_order - b.sort_order);
		}

		data['text_items'] = sprintf(this.language.get('text_items'), await this.cart.countProducts() + ((this.session.data['vouchers']) ? this.session.data['vouchers'].length : 0), this.currency.format(total, this.session.data['currency']));

		this.load.model('tool/image', this);
		this.load.model('tool/upload', this);

		data['products'] = [];

		for (let product of await this.cart.getProducts()) {
			let image = await this.model_tool_image.resize('placeholder.png', this.config.get('theme_' + this.config.get('config_theme') + '_image_cart_width'), this.config.get('theme_' + this.config.get('config_theme') + '_image_cart_height'));
			if (product['image']) {
				image = await this.model_tool_image.resize(product['image'], this.config.get('theme_' + this.config.get('config_theme') + '_image_cart_width'), this.config.get('theme_' + this.config.get('config_theme') + '_image_cart_height'));
			}
			const option_data = [];

			for (let option of product['option']) {
				let value = '';
				if (option['type'] != 'file') {
					value = option['value'];
				} else {
					const upload_info = await this.model_tool_upload.getUploadByCode(option['value']);

					if (upload_info.upload_id) {
						value = upload_info['name'];
					} else {
						value = '';
					}
				}

				option_data.push({
					'name': option['name'],
					'value': (utf8_strlen(value) > 20 ? utf8_substr(value, 0, 20) + '..' : value),
					'type': option['type']
				});
			}

			// Display prices
			let price = false;
			let total = false;
			if (await this.customer.isLogged() || !Number(this.config.get('config_customer_price'))) {
				let unit_price = this.tax.calculate(product['price'], product['tax_class_id'], this.config.get('config_tax'));

				price = this.currency.format(unit_price, this.session.data['currency']);
				total = this.currency.format(unit_price * product['quantity'], this.session.data['currency']);
			}

			data['products'].push({
				'cart_id': product['cart_id'],
				'thumb': image,
				'name': product['name'],
				'model': product['model'],
				'option': option_data,
				'recurring': (product['recurring'] ? product['recurring']['name'] : ''),
				'quantity': product['quantity'],
				'price': price,
				'total': total,
				'href': await this.url.link('product/product', 'product_id=' + product['product_id'])
			});
		}

		// Gift Voucher
		data['vouchers'] = [];

		if ((this.session.data['vouchers'])) {
			for (let [key, voucher] of Object.entries(this.session.data['vouchers'])) {
				data['vouchers'].push({
					'key': key,
					'description': voucher['description'],
					'amount': this.currency.format(voucher['amount'], this.session.data['currency'])
				});
			}
		}

		data['totals'] = [];

		for (let total of totals) {
			data['totals'].push({
				'title': total['title'],
				'text': this.currency.format(total['value'], this.session.data['currency']),
			});
		}

		data['cart'] = await this.url.link('checkout/cart');
		data['checkout'] = await this.url.link('checkout/checkout', '', true);

		return await this.load.view('common/cart', data);
	}

	async info() {
		this.response.setOutput(await this.index());
	}
}