module.exports = class TotalTotalController extends Controller {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @return void
	 */
	async index() {
		await this.load.language('extension/opencart/total/total');

		this.document.setTitle(this.language.get('heading_title'));

		const data = {
			breadcrumbs: []
		};

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('text_extension'),
			'href' : this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=total')
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : this.url.link('extension/opencart/total/total', 'user_token=' + this.session.data['user_token'])
		});

		data['save'] = this.url.link('extension/opencart/total/total.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=total');

		data['total_total_status'] = this.config.get('total_total_status');
		data['total_total_sort_order'] = this.config.get('total_total_sort_order');

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/opencart/total/total', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('extension/opencart/total/total');

		const json = {};

		if (!await this.user.hasPermission('modify', 'extension/opencart/total/total')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!json.error) {
			this.load.model('setting/setting',this);

			await this.model_setting_setting.editSetting('total_total', this.request.post);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}