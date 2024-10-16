module.exports = class HandlingTotalController extends Controller {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @return void
	 */
	async index() {
		await this.load.language('extension/opencart/total/handling');

		this.document.setTitle(this.language.get('heading_title'));

		const data = {
			breadcrumbs: []
		};

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('text_extension'),
			'href' : await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=total')
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('extension/opencart/total/handling', 'user_token=' + this.session.data['user_token'])
		});

		data['save'] = await this.url.link('extension/opencart/total/handling.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=total');

		data['total_handling_total'] = this.config.get('total_handling_total');
		data['total_handling_fee'] = this.config.get('total_handling_fee');
		data['total_handling_tax_class_id'] = this.config.get('total_handling_tax_class_id');

		this.load.model('localisation/tax_class');

		data['tax_classes'] = await this.model_localisation_tax_class.getTaxClasses();

		data['total_handling_status'] = this.config.get('total_handling_status');
		data['total_handling_sort_order'] = this.config.get('total_handling_sort_order');

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/opencart/total/handling', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('extension/opencart/total/handling');

		const json = {};

		if (!await this.user.hasPermission('modify', 'extension/opencart/total/handling')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!json.error) {
			this.load.model('setting/setting',this);

			await this.model_setting_setting.editSetting('total_handling', this.request.post);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}