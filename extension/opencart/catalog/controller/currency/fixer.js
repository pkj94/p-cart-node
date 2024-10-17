const axios = require("axios");

module.exports = class FixerController extends Controller {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @param default
	 *
	 * @return void
	 */
	async currency(default_ = '') {
		if (this.config.get('currency_fixer_status')) {
			try {
				const response = await axios.get(`http://data.fixer.io/api/latest?access_key=${this.config.get('currency_fixer_api')}`, {
					timeout: 30000
				});

				const responseInfo = response.data;

				if (responseInfo && responseInfo.rates) {
					const currencies = { EUR: 1.0000, ...responseInfo.rates };

					this.load.model('localisation/currency', this);

					const results = await this.model_localisation_currency.getCurrencies();

					for (const result of results) {
						if (currencies[result.code]) {
							const from = currencies['EUR'];
							const to = currencies[result.code];

							await this.model_localisation_currency.editValueByCode(result.code, 1 / (currencies[default_] * (from / to)));
						}
					}

					await this.model_localisation_currency.editValueByCode(default_, 1);

					await this.cache.delete('currency');
				}
			} catch (error) {
				console.error('Error fetching currency data:', error);
			}
		}
	}
}