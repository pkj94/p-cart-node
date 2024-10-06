module.exports = class LowOrderFeeTotalController extends Controller {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @return void
	 */
	async index() {
		await this.load.language('extension/opencart/total/low_order_fee');

		this.document.setTitle(this.language.get('heading_title'));

		const data = {
			breadcrumbs: []
		};

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_extension'),
			'href': this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=total')
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': this.url.link('extension/opencart/total/low_order_fee', 'user_token=' + this.session.data['user_token'])
		});

		data['save'] = this.url.link('extension/opencart/total/low_order_fee.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=total');

		data['total_low_order_fee_total'] = this.config.get('total_low_order_fee_total');
		data['total_low_order_fee_fee'] = this.config.get('total_low_order_fee_fee');
		data['total_low_order_fee_tax_class_id'] = this.config.get('total_low_order_fee_tax_class_id');

		this.load.model('localisation/tax_class', this);

		data['tax_classes'] = await this.model_localisation_tax_class.getTaxClasses();

		data['total_low_order_fee_status'] = this.config.get('total_low_order_fee_status');
		data['total_low_order_fee_sort_order'] = this.config.get('total_low_order_fee_sort_order');

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/opencart/total/low_order_fee', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('extension/opencart/total/low_order_fee');

		const json = {};

		if (!this.user.hasPermission('modify', 'extension/opencart/total/low_order_fee')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!json.error) {
			this.load.model('setting/setting', this);

			await this.model_setting_setting.editSetting('total_low_order_fee', this.request.post);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}