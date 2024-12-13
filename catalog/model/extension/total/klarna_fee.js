module.exports = class ModelExtensionTotalKlarnaFee extends Model {
	async getTotal(totals) {
		const { total } = totals;
		await this.load.language('extension/total/klarna_fee');

		let status = true;

		const klarna_fee = this.config.get('klarna_fee');
		let address;
		if ((this.session.data['payment_address_id'])) {
			this.load.model('account/address', this);

			address = await this.model_account_address.getAddress(this.session.data['payment_address_id']);
		} else if ((this.session.data['guest']['payment'])) {
			address = this.session.data['guest']['payment'];
		}

		if (!(address)) {
			status = false;
		} else if (!(this.session.data['payment_method']['code']) || this.session.data['payment_method']['code'] != 'klarna_invoice') {
			status = false;
		} else if (!(klarna_fee[address['iso_code_3']])) {
			status = false;
		} else if (!klarna_fee[address['iso_code_3']]['status']) {
			status = false;
		} else if (await this.cart.getSubTotal() >= klarna_fee[address['iso_code_3']]['total']) {
			status = false;
		}

		if (status) {
			total['totals'].push({
				'code': 'klarna_fee',
				'title': this.language.get('text_klarna_fee'),
				'value': klarna_fee[address['iso_code_3']]['fee'],
				'sort_order': klarna_fee[address['iso_code_3']]['sort_order']
			});

			const tax_rates = await this.tax.getRates(klarna_fee[address['iso_code_3']]['fee'], klarna_fee[address['iso_code_3']]['tax_class_id']);

			for (let tax_rate of tax_rates) {
				if (!(total['taxes'][tax_rate['tax_rate_id']])) {
					total['taxes'][tax_rate['tax_rate_id']] = tax_rate['amount'];
				} else {
					total['taxes'][tax_rate['tax_rate_id']] += tax_rate['amount'];
				}
			}

			total['total'] += klarna_fee[address['iso_code_3']]['fee'];
		}
		return total;
	}
}