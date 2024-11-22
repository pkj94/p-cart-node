module.exports = class Cart extends Model {

	async getProducts() {
		this.load.model('tool/image', this);
		this.load.model('tool/upload', this);

		// Products
		let product_data = [];

		let products = await this.cart.getProducts();
		for (let [cart_id, product] of Object.entries(products)) {
			let image = await this.model_tool_image.resize('placeholder.png', this.config.get('config_image_cart_width'), this.config.get('config_image_cart_height'));
			if (product['image']) {
				image = await this.model_tool_image.resize(html_entity_decode(product['image']), this.config.get('config_image_cart_width'), this.config.get('config_image_cart_height'));
			}

			let option_data = [];

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
					'product_option_id': option['product_option_id'],
					'product_option_value_id': option['product_option_value_id'],
					'option_id': option['option_id'],
					'option_value_id': option['option_value_id'],
					'name': option['name'],
					'value': value,
					'type': option['type']
				});
			}

			let product_total = 0;

			for (let [cart_id, product_2] of Object.entries(products)) {
				if (product_2['product_id'] == product['product_id']) {
					product_total += product_2['quantity'];
				}
			}
			let minimum = true;
			if (product['minimum'] > product_total) {
				minimum = false;
			} else {
				minimum = true;
			}

			product_data.push({
				'cart_id': product['cart_id'],
				'product_id': product['product_id'],
				'master_id': product['master_id'],
				'image': image,
				'name': product['name'],
				'model': product['model'],
				'option': option_data,
				'subscription': product['subscription'],
				'download': product['download'],
				'quantity': product['quantity'],
				'stock': product['stock'],
				'minimum': minimum,
				'shipping': product['shipping'],
				'subtract': product['subtract'],
				'reward': product['reward'],
				'tax_class_id': product['tax_class_id'],
				'price': product['price'],
				'total': product['total']
			});
		}

		return product_data;
	}

	async getVouchers() {
		let voucher_data = [];

		if (this.session.data['vouchers'] && this.session.data['vouchers'].length) {
			for (let voucher of this.session.data['vouchers']) {
				voucher_data.push({
					'code': voucher['code'],
					'description': voucher['description'],
					'from_name': voucher['from_name'],
					'from_email': voucher['from_email'],
					'to_name': voucher['to_name'],
					'to_email': voucher['to_email'],
					'voucher_theme_id': voucher['voucher_theme_id'],
					'message': voucher['message'],
					'amount': voucher['amount']
				});
			}
		}

		return voucher_data;
	}

	async getTotals(totals, taxes, total) {
		this.load.model('setting/extension', this);
		let results = await this.model_setting_extension.getExtensionsByType('total');
		results = results.map(a=>{
			a['total_' + a['code'] + '_sort_order'] = this.config.get('total_' + a['code'] + '_sort_order')
			return a;
		});
		results = results.sort((a, b) => a['total_' + a['code'] + '_sort_order'] - b['total_' + b['code'] + '_sort_order']);
		for (let result of results) {
			if (this.config.get('total_' + result['code'] + '_status')) {
				this.load.model('extension/' + result['extension'] + '/total/' + result['code'], this);

				// __call magic method cannot pass-by-reference so we get PHP to call it as an anonymous function.
				let data = await this['model_extension_' + result['extension'] + '_total_' + result['code']].getTotal(totals, taxes, total);
				// console.log('data---',total, data)

				total = data.total;
				totals = data.totals;
				taxes = data.taxes;
			}
		}

		totals.sort((a, b) => a.sort_order - b.sort_order);
		return { totals, taxes, total };
	}
}
