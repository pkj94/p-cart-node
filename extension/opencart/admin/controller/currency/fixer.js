module.exports = class FixerCurrencyController extends Controller {
	constructor(registry) {
		super(registry)
	}
	async index() {
		await this.load.language('extension/opencart/currency/fixer');

		this.document.setTitle(this.language.get('heading_title'));

		const data = {
			breadcrumbs: [
				{
					text: this.language.get('text_home'),
					href: this.url.link('common/dashboard', `user_token=${this.session.data['user_token']}`)
				},
				{
					text: this.language.get('text_extension'),
					href: this.url.link('marketplace/extension', `user_token=${this.session.data['user_token']}&type=currency`)
				},
				{
					text: this.language.get('heading_title'),
					href: this.url.link('extension/opencart/currency/fixer', `user_token=${this.session.data['user_token']}`)
				}
			],
			save: this.url.link('extension/opencart/currency/fixer.save', `user_token=${this.session.data['user_token']}`),
			back: this.url.link('marketplace/extension', `user_token=${this.session.data['user_token']}&type=currency`),
			currency_fixer_api: this.config.get('currency_fixer_api'),
			currency_fixer_status: this.config.get('currency_fixer_status'),
			header: await this.load.controller('common/header'),
			column_left: await this.load.controller('common/column_left'),
			footer: await this.load.controller('common/footer')
		};

		this.response.setOutput(await this.load.view('extension/opencart/currency/fixer', data));
	}

	async save() {
		await this.load.language('extension/opencart/currency/fixer');

		const json = {};

		if (!await this.user.hasPermission('modify', 'extension/opencart/currency/fixer')) {
			json.error = { warning: this.language.get('error_permission') };
		}

		if (!this.request.post['currency_fixer_api']) {
			json.error = { ...json.error, api: this.language.get('error_api') };
		}

		if (!json.error) {
			this.load.model('setting/setting', this);

			await this.model_setting_setting.editSetting('currency_fixer', this.request.post);

			json.success = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(JSON.stringify(json));
	}

	async currencyConvert(default_ = '') {
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

