

global['OpencartCatalogControllerExtensionOpencartCurrencyEcb'] = class ECB extends global['OpencartSystemEngineController'] {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @param default
	 *
	 * @return void
	 */
	async currency(default_ = '') {
		if (this.config.get('currency_ecb_status')) {
			try {
				const response = await require("axios").get('https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml', {
					timeout: 30000
				});
				if (response.status === 200) {
					const cube = [...String(response.data).matchAll(/currency=['"]([A-Z]{3})['"]\s+rate=['"]([\d.]+)['"]/g)].map(m => ({ currency: m[1], rate: m[2] }));

					const currencies = {
						EUR: 1.0000
					};

					for (const currency of cube) {
						if (currency.currency) {
							currencies[currency.currency] = parseFloat(currency.rate);
						}
					}

					const value = currencies[default_] || currencies.EUR;

					if (Object.keys(currencies).length) {
						this.load.model('localisation/currency', this);
						const results = await this.model_localisation_currency.getCurrencies();

						for (const [code, result] of Object.entries(results)) {
							if (currencies[result.code]) {
								await this.model_localisation_currency.editValueByCode(result.code, 1 / (value * (value / currencies[result.code])));
							}
						}

						await this.model_localisation_currency.editValueByCode(default_, '1.00000');
					}
				}
			} catch (error) {
				console.error(error)
				console.error('Error fetching currency data:', error);
			}
		}

		await this.cache.delete('currency');
	}
}