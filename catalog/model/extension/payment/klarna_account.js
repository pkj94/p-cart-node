const array_multisort = require("locutus/php/array/array_multisort");

module.exports = class ModelExtensionPaymentKlarnaAccount extends Model {
	async getMethod(address, total) {
		await this.load.language('extension/payment/klarna_account');

		let status = true;

		const klarna_account = this.config.get('payment_klarna_account');

		if (!(klarna_account[address['iso_code_3']])) {
			status = false;
		} else if (!klarna_account[address['iso_code_3']]['status']) {
			status = false;
		}

		if (status) {
			const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "zone_to_geo_zone WHERE geo_zone_id = '" + klarna_account[address['iso_code_3']]['geo_zone_id'] + "' AND country_id = '" + address['country_id'] + "' AND (zone_id = '" + address['zone_id'] + "' OR zone_id = '0')");

			if (klarna_account[address['iso_code_3']]['total'] > 0 && klarna_account[address['iso_code_3']]['total'] > total) {
				status = false;
			} else if (!klarna_account[address['iso_code_3']]['geo_zone_id']) {
				status = true;
			} else if (query.num_rows) {
				status = true;
			} else {
				status = false;
			}

			// Maps countries to currencies
			const country_to_currency = {
				'NOR': 'NOK',
				'SWE': 'SEK',
				'FIN': 'EUR',
				'DNK': 'DKK',
				'DEU': 'EUR',
				'NLD': 'EUR'
			};

			if (!(country_to_currency[address['iso_code_3']]) || !this.currency.has(country_to_currency[address['iso_code_3']])) {
				status = false;
			}

			if (address['iso_code_3'] == 'NLD' && this.currency.has('EUR') && this.currency.format(total, 'EUR', '', false) > 250.00) {
				status = false;
			}
		}

		const payment_option = {};

		if (status) {
			total = this.currency.format(total, country_to_currency[address['iso_code_3']], '', false);

			const pclasses = this.config.get('klarna_account_pclasses');

			if ((pclasses[address['iso_code_3']])) {
				pclasses = pclasses[address['iso_code_3']];
			} else {
				pclasses = {};
			}
			let monthly_cost = '', monthly_fee = '';
			for (let pclass of pclasses) {
				// 0 - Campaign
				// 1 - Account
				// 2 - Special
				// 3 - Fixed
				if (![0, 1, 3].includes(pclass['type'])) {
					continue;
				}

				if (pclass['type'] == 2) {
					monthly_cost = -1;
				} else {
					if (total < pclass['minamount']) {
						continue;
					}

					if (pclass['type'] == 3) {
						continue;
					} else {
						let sum = total;

						let lowest_payment = await this.getLowestPaymentAccount(address['iso_code_3']);
						monthly_cost = 0;

						monthly_fee = pclass['invoicefee'];
						let start_fee = pclass['startfee'];

						sum += start_fee;

						let base = (pclass['type'] == 1);

						let minimum_payment = (pclass['type'] === 1) ? await this.getLowestPaymentAccount(address['iso_code_3']) : 0;
						let payment = 0;
						if (pclass['months'] == 0) {
							payment = sum;
						} else if (pclass['interestrate'] == 0) {
							payment = sum / pclass['months'];
						} else {
							interest_rate = pclass['interestrate'] / (100.0 * 12);

							payment = sum * interest_rate / (1 - pow((1 + interest_rate), -pclass['months']));
						}

						payment += monthly_fee;

						let balance = sum;
						const pay_data = [];

						let months = pclass['months'];

						while ((months != 0) && (balance > 0.01)) {
							let interest = balance * pclass['interestrate'] / (100.0 * 12);
							let new_balance = balance + interest + monthly_fee;

							if (minimum_payment >= new_balance || payment >= new_balance) {
								pay_data.push(new_balance);
								break;
							}

							let new_payment = Math.max(payment, minimum_payment);

							if (base) {
								new_payment = Math.max(new_payment, balance / 24.0 + monthly_fee + interest);
							}

							balance = new_balance - new_payment;

							pay_data.push(new_payment);

							months -= 1;
						}

						monthly_cost = Math.round((pay_data[0]) ? (pay_data[0]) : 0, 2);

						if (monthly_cost < 0.01) {
							continue;
						}

						if (pclass['type'] == 1 && monthly_cost < lowest_payment) {
							monthly_cost = lowest_payment;
						}

						if (pclass['type'] == 0 && monthly_cost < lowest_payment) {
							continue;
						}
					}
				}

				payment_option[pclass['id']]['monthly_cost'] = monthly_cost;
				payment_option[pclass['id']]['pclass_id'] = pclass['id'];
				payment_option[pclass['id']]['months'] = pclass['months'];
			}
		}

		if (!payment_option) {
			status = false;
		}

		const sort_order = {};

		for (let [key, value] of Object.entries(payment_option)) {
			sort_order[key] = value['monthly_cost'];
		}

		payment_option = array_multisort(sort_order, SORT_ASC, payment_option);

		if (address['company']) {
			status = false;
		}

		let method = {};

		if (status) {
			method = {
				'code': 'klarna_account',
				'title': sprintf(this.language.get('text_title'), this.currency.format(this.currency.convert(payment_option[0]['monthly_cost'], country_to_currency[address['iso_code_3']], this.session.data['currency']), 1, 1)),
				'terms': sprintf(this.language.get('text_terms'), klarna_account[address['iso_code_3']]['merchant'], strtolower(address['iso_code_2'])),
				'sort_order': klarna_account[address['iso_code_3']]['sort_order'],
			};
		}

		return method;
	}

	async getLowestPaymentAccount(country) {
		let amount = null;
		switch (country) {
			case 'SWE':
				amount = 50.0;
				break;
			case 'NOR':
				amount = 95.0;
				break;
			case 'FIN':
				amount = 8.95;
				break;
			case 'DNK':
				amount = 89.0;
				break;
			case 'DEU':
			case 'NLD':
				amount = 6.95;
				break;
			default:
				log = new Log('klarna_account.log');
				log.write('Unknown country ' + country);

				amount = null;
				break;
		}

		return amount;
	}
}