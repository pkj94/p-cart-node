module.exports = class BankTransferPaymentController extends Controller {
	constructor(registry) {
		super(registry)
	}
	async index() {
		await this.load.language('extension/opencart/payment/bank_transfer');

		this.document.setTitle(this.language.get('heading_title'));

		const data = {};
		data.breadcrumbs = [];

		data.breadcrumbs.push({
			text: this.language.get('text_home'),
			href: this.url.link('common/dashboard', 'user_token=' + this.session.data.user_token)
		});

		data.breadcrumbs.push({
			text: this.language.get('text_extension'),
			href: this.url.link('marketplace/extension', 'user_token=' + this.session.data.user_token + '&type=payment')
		});

		data.breadcrumbs.push({
			text: this.language.get('heading_title'),
			href: this.url.link('extension/opencart/payment/bank_transfer', 'user_token=' + this.session.data.user_token)
		});

		data.save = this.url.link('extension/opencart/payment/bank_transfer.save', 'user_token=' + this.session.data.user_token);
		data.back = this.url.link('marketplace/extension', 'user_token=' + this.session.data.user_token + '&type=payment');

		this.load.model('localisation/language', this);

		data.payment_bank_transfer_bank = {};

		const languages = await this.model_localisation_language.getLanguages();

		languages.forEach(language => {
			data.payment_bank_transfer_bank[language.language_id] = this.config.get('payment_bank_transfer_bank_' + language.language_id);
		});

		data.languages = languages;

		data.payment_bank_transfer_order_status_id = this.config.get('payment_bank_transfer_order_status_id');

		this.load.model('localisation/order_status', this);

		data.order_statuses = await this.model_localisation_order_status.getOrderStatuses();

		data.payment_bank_transfer_geo_zone_id = this.config.get('payment_bank_transfer_geo_zone_id');

		this.load.model('localisation/geo_zone', this);

		data.geo_zones = await this.model_localisation_geo_zone.getGeoZones();

		data.payment_bank_transfer_status = this.config.get('payment_bank_transfer_status');
		data.payment_bank_transfer_sort_order = this.config.get('payment_bank_transfer_sort_order');

		data.header = await this.load.controller('common/header');
		data.column_left = await this.load.controller('common/column_left');
		data.footer = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/opencart/payment/bank_transfer', data));
	}

	async save() {
		await this.load.language('extension/opencart/payment/bank_transfer');

		const json = {};

		if (!this.user.hasPermission('modify', 'extension/opencart/payment/bank_transfer')) {
			json.error = { warning: this.language.get('error_permission') };
		}

		this.load.model('localisation/language', this);

		const languages = await this.model_localisation_language.getLanguages();

		languages.forEach(language => {
			if (!this.request.post['payment_bank_transfer_bank_' + language.language_id]) {
				json.error['bank_' + language.language_id] = this.language.get('error_bank');
			}
		});

		if (!json.error) {
			this.load.model('setting/setting', this);

			await this.model_setting_setting.editSetting('payment_bank_transfer', this.request.post);

			json.success = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}

