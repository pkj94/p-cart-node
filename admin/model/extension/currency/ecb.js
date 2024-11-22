module.exports = class ModelExtensionCurrencyEcb extends Model {

	async editValueByCode(code, value) {
		await this.db.query("UPDATE `" + DB_PREFIX + "currency` SET `value` = '" + value + "', `date_modified` = NOW() WHERE `code` = '" + this.db.escape(code) + "'");
		await this.cache.delete('currency');
	}

	async refresh() {
		if (this.config.get('currency_ecb_status')) {
			if (this.config.get('config_currency_engine')=='ecb') {
				curl = curl_init();

				curl_setopt(curl, CURLOPT_URL, 'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml');
				curl_setopt(curl, CURLOPT_RETURNTRANSFER, 1);
				curl_setopt(curl, CURLOPT_HEADER, false);
				curl_setopt(curl, CURLOPT_SSL_VERIFYPEER, 0);
				curl_setopt(curl, CURLOPT_CONNECTTIMEOUT, 30);
				curl_setopt(curl, CURLOPT_TIMEOUT, 30);

				response = curl_exec(curl);

				curl_close(curl);

				if (response) {
					dom = new \DOMDocument('1.0', 'UTF-8');
					dom.loadXml(response);

					cube = dom.getElementsByTagName('Cube').item(0);

					currencies = [];

					currencies['EUR'] = 1.0000;

					for (cube.getElementsByTagName('Cube') of currency) {
						if (currency.getAttribute('currency')) {
							currencies[currency.getAttribute('currency')] = currency.getAttribute('rate');
						}
					}

					if (currencies) {
						this.load.model('localisation/currency',this);

						default = this.config.get('config_currency');

						results = await this.model_localisation_currency.getCurrencies();

						for (let result of results) {
							if ((currencies[result['code']])) {
								from = currencies['EUR'];

								to = currencies[result['code']];

								this.editValueByCode(result['code'], 1 / (currencies[default] * (from / to)));
							}
						}
					}

					this.editValueByCode(default, '1.00000');
				}
				return true;
			}
		}
		return false;
	}
}
