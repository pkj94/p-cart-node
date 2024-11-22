module.exports = class ControllerReportReport extends Controller {
	async index() {
		await this.load.language('report/report');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('report/report', 'user_token=' + this.session.data['user_token'], true)
		});

		data['user_token'] = this.session.data['user_token'];

		if ((this.request.get['code'])) {
			data['code'] = this.request.get['code'];
		} else {
			data['code'] = '';
		}

		// Reports
		data['reports'] = {};
		
		this.load.model('setting/extension',this);

		// Get a list of installed modules
		extensions = await this.model_setting_extension.getInstalled('report');
		
		// Add all the modules which have multiple settings for each module
		for (extensions of code) {
			if (this.config.get('report_' + code + '_status') && await this.user.hasPermission('access', 'extension/report/' + code)) {
				await this.load.language('extension/report/' + code, 'extension');
				
				data['reports'].push({
					'text'       : this.language.get('extension').get('heading_title'),
					'code'       : code,
					'sort_order' : this.config.get('report_' + code + '_sort_order'),
					'href'       : await this.url.link('report/report', 'user_token=' + this.session.data['user_token'] + '&code=' + code, true)
				});
			}
		}
		
		sort_order = {};

		for (data['reports'] of key : value) {
			sort_order[key] = value['sort_order'];
		}

		array_multisort(sort_order, SORT_ASC, data['reports']);	
		
		if ((this.request.get['code'])) {
			data['report'] = await this.load.controller('extension/report/' + this.request.get['code'] + '/report');
		} else if ((data['reports'][0])) {
			data['report'] = await this.load.controller('extension/report/' + data['reports'][0]['code'] + '/report');
		} else {
			data['report'] = '';
		}
		
		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('report/report', data));
	}
}