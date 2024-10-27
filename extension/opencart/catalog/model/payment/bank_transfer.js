global['\Opencart\Catalog\Model\Extension\Opencart\Payment\BankTransfer'] = class BankTransfer extends global['\Opencart\System\Engine\Model'] {
	/**
	 * @param address
	 *
	 * @return array
	 */
	async getMethods(address = {}) {
		await this.load.language('extension/opencart/payment/bank_transfer');
		let status = false;
		if (await this.cart.hasSubscription()) {
			status = false;
		} else if (!Number(this.config.get('config_checkout_payment_address'))) {
			status = true;
		} else if (!Number(this.config.get('payment_bank_transfer_geo_zone_id'))) {
			status = true;
		} else {
			const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "zone_to_geo_zone` WHERE `geo_zone_id` = '" + Number(this.config.get('payment_bank_transfer_geo_zone_id')) + "' AND `country_id` = '" + address['country_id'] + "' AND (`zone_id` = '" + address['zone_id'] + "' OR `zone_id` = '0')");

			if (query.num_rows) {
				status = true;
			} else {
				status = false;
			}
		}

		let method_data = {};

		if (status) {
			let option_data = {
				bank_transfer: {
					'code': 'bank_transfer.bank_transfer',
					'name': this.language.get('heading_title')
				}
			};

			method_data = {
				'code': 'bank_transfer',
				'name': this.language.get('heading_title'),
				'option': option_data,
				'sort_order': this.config.get('payment_bank_transfer_sort_order')
			};
		}

		return method_data;
	}
}
