const { parseStringPromise } = require('xml2js');

module.exports = class ModelExtensionCurrencyEcb extends Model {

	async editValueByCode(code, value) {
		await this.db.query("UPDATE `" + DB_PREFIX + "currency` SET `value` = '" + value + "', `date_modified` = NOW() WHERE `code` = '" + this.db.escape(code) + "'");
		this.cache.delete('currency');
	}


	async refresh() {
		try {
			// Fetch the XML data
			const response = await axios.get('https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml', {
				timeout: 30000,
				responseType: 'text'
			});

			const xmlData = response.data;

			// Parse the XML data
			const parsedData = await parseStringPromise(xmlData);
			const cubeData = parsedData['gesmes:Envelope'].Cube[0].Cube[0].Cube;

			let currencies = {};
			currencies['EUR'] = 1.0000;

			// Extract currency rates
			cubeData.forEach(currency => {
				if (currency.$.currency) {
					currencies[currency.$.currency] = parseFloat(currency.$.rate);
				}
			});

			// Simulate model and config loading
			let configCurrency = 'EUR';  // Replace with actual config loading if available

			// Simulate getting currencies from a model
			let results = [
				{ code: 'USD' },
				{ code: 'JPY' }
				// Add more currencies as needed
			];

			// Update currency values
			results.forEach(async result => {
				if (currencies[result.code]) {
					let from = currencies['EUR'];
					let to = currencies[result.code];
					let defaultRate = currencies[configCurrency];
					await this.editValueByCode(result.code, 1 / (defaultRate * (from / to)));
				}
			});

			// Set the default currency rate
			await this.editValueByCode(configCurrency, 1.00000);

			// Simulate cache deletion
			this.cache.delete('currency');
		} catch (error) {
			console.error('Error refreshing currency data:', error);
		}
	}
}
