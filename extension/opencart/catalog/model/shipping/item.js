global['\Opencart\Catalog\Model\Extension\Opencart\Shipping\Item'] = class Item extends global['\Opencart\System\Engine\Model'] {
	/**
	 * @param address
	 *
	 * @return array
	 */
	async getQuote(address) {
		await this.load.language('extension/opencart/shipping/item');

		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "zone_to_geo_zone` WHERE `geo_zone_id` = '" + Number(this.config.get('shipping_item_geo_zone_id')) + "' AND `country_id` = '" + address['country_id'] + "' AND (`zone_id` = '" + address['zone_id'] + "' OR `zone_id` = '0')");
		let status = false;
		if (!Number(this.config.get('shipping_item_geo_zone_id'))) {
			status = true;
		} else if (query.num_rows) {
			status = true;
		} else {
			status = false;
		}

		let method_data = {};

		if (status) {
			let items = 0;

			for (let [cart_id,product] of Object.entries(await this.cart.getProducts())) {
				if (product['shipping']) {
					items += product['quantity'];
				}
			}

			let cost = this.config.get('shipping_item_cost');
			let tax_class_id = this.config.get('shipping_item_tax_class_id');

			let quote_data = {
				item: {
					'code': 'item.item',
					'name': this.language.get('text_description'),
					'cost': cost * items,
					'tax_class_id': tax_class_id,
					'text': this.currency.format(this.tax.calculate(cost * items, tax_class_id, Number(this.config.get('config_tax'))), this.session.data['currency'])
				}
			};

			method_data = {
				'code': 'item',
				'name': this.language.get('heading_title'),
				'quote': quote_data,
				'sort_order': this.config.get('shipping_item_sort_order'),
				'error': false
			};
		}

		return method_data;
	}
}
