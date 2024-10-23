module.exports = class ReportController extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('report/report');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('report/report', 'user_token=' + this.session.data['user_token'])
		});

		if ((this.request.get['code'])) {
			data['code'] = this.request.get['code'];
		} else {
			data['code'] = '';
		}

		// Reports
		data['reports'] = [];

		this.load.model('setting/extension', this);

		// Get a list of installed modules
		const results = await this.model_setting_extension.getExtensionsByType('report');

		// Add all the modules which have multiple settings for each module
		for (let result of results) {
			if (this.config.get('report_' + result['code'] + '_status') && await this.user.hasPermission('access', 'extension/' + result['extension'] + '/report/' + result['code'])) {
				await this.load.language('extension/' + result['extension'] + '/report/' + result['code'], result['code']);

				data['reports'].push({
					'text': this.language.get(result['code'] + '_heading_title'),
					'code': result['code'],
					'sort_order': this.config.get('report_' + result['code'] + '_sort_order'),
					'href': await this.url.link('extension/' + result['extension'] + '/report/' + result['code'] + '.report', 'user_token=' + this.session.data['user_token'])
				});
			}
		}

		let sort_order = {};

		for (let [key, value] of Object.entries(data['reports'])) {
			sort_order[key] = value['sort_order'];
		}

		// data['extensions'] = multiSort(data['reports'], sort_order, 'ASC');
		data['extensions'] = data['reports'].sort((a, b) => a.sort_order - b.sort_order);

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('report/report', data));
	}
}
