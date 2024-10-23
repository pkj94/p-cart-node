const sprintf = require("locutus/php/strings/sprintf");

global['\Opencart\Catalog\Model\Extension\Opencart\Total\Voucher'] = class Voucher extends global['\Opencart\System\Engine\Model'] {
	/**
	 * @param totals
	 * @param taxes
	 * @param float total
	 *
	 * @return void
	 */
	async getTotal(totals, taxes, total) {
		if (this.session.data['voucher']) {
			await this.load.language('extension/opencart/total/voucher', 'voucher');

			this.load.model('checkout/voucher', this);

			let voucher_info = await this.registry.get('model_checkout_voucher').getVoucher(this.session.data['voucher']);

			if (voucher_info.voucher_id) {
				let amount = Math.min(voucher_info['amount'], total);

				if (amount > 0) {
					totals.push({
						'extension': 'opencart',
						'code': 'voucher',
						'title': sprintf(this.language.get('voucher_text_voucher'), this.session.data['voucher']),
						'value': -amount,
						'sort_order': this.config.get('total_voucher_sort_order')
					});

					total -= amount;
				} else {
					delete this.session.data['voucher'];
				}
			} else {
				delete this.session.data['voucher'];
			}
		}
		await this.session.save(this.session.data);
		return { totals, taxes, total }
	}

	/**
	 * @param order_info
	 * @param order_total
	 *
	 * @return int
	 */
	async confirm(order_info, order_total) {
		let code = '';

		let start = order_total['title'].indexOf('(') + 1;
		let end = order_total['title'].indexOf(')');

		if (start && end) {
			code = order_total['title'].substring(start, end - start);
		}

		if (code) {
			this.load.model('checkout/voucher', this);

			const voucher_info = await this.registry.get('model_checkout_voucher').getVoucher(code);

			if (voucher_info.voucher_id) {
				this.db.query("INSERT INTO `" + DB_PREFIX + "voucher_history` SET `voucher_id` = '" + voucher_info['voucher_id'] + "', `order_id` = '" + order_info['order_id'] + "', `amount` = '" + order_total['value'] + "', `date_added` = NOW()");
			} else {
				return this.config.get('config_fraud_status_id');
			}
		}

		return 0;
	}

	/**
	 * @param int order_id
	 *
	 * @return void
	 */
	async unconfirm(order_id) {
		this.db.query("DELETE FROM `" + DB_PREFIX + "voucher_history` WHERE `order_id` = '" + order_id + "'");
	}
}
