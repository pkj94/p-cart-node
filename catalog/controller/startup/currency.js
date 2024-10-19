module.exports = class CurrencyController extends Controller {
	/**
	 * @return void
	 */
	async index() {

		let code = '';

		this.load.model('localisation/currency', this);

		const currencies = await this.model_localisation_currency.getCurrencies();

		if ((this.session.data['currency'])) {
			code = this.session.data['currency'];
		}

		if ((this.request.cookie['currency']) && !currencies.hasOwnProperty(code)) {
			code = this.request.cookie['currency'];
		}

		if (!currencies.hasOwnProperty(code)) {
			code = this.config.get('config_currency');
		}

		if (!(this.session.data['currency']) || this.session.data['currency'] != code) {
			this.session.data['currency'] = code;
		}

		// Set a new currency cookie if the code does not match the current one
		if (!(this.request.cookie['currency']) || this.request.cookie['currency'] != code) {
			let option = {
				'expires': new Date(Date.now() + 60 * 60 * 24 * 30 * 1000),
				'path': '/',
				'SameSite': 'Lax'
			};

			this.response.response.cookie('currency', code, option);
		}

		await this.session.save(this.session.data);
		this.registry.set('currency', new (require(DIR_SYSTEM + 'library/cart/currency'))(this.registry));
	}
}