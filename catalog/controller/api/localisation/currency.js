module.exports = class CurrencyController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('api/localisation/currency');

		const json = {};

		if ((this.request.post['currency'])) {
			currency = this.request.post['currency'];
		} else {
			currency = '';
		}

		this.load.model('localisation/currency', this);

		currency_info = await this.model_localisation_currency.getCurrencyByCode(currency);

		if (!currency_info) {
			json['error'] = this.language.get('error_currency');
		}

		if (!Object.keys(json).length) {
			this.session.data['currency'] = currency;

			json['success'] = this.language.get('text_success');
		}
		await this.session.save(this.session.data);
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
