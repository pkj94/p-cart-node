module.exports = class ControllerExtensionTotalKlarnaFee extends Controller {
	error = {};

	async index() {
		await this.load.language('extension/total/klarna_fee');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/setting',this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			status = false;

			for (this.request.post['klarna_fee'] of klarna_account) {
				if (klarna_account['status']) {
					status = true;

					break;
				}
			}

			await this.model_setting_setting.editSetting('total_klarna_fee', array_merge(this.request.post, array('klarna_fee_status' : status)));

			this.session.data['success'] = this.language.get('text_success');

			this.response.setRedirect(await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=total', true));
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('text_extension'),
			'href' : await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=total', true)
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('extension/total/klarna_fee', 'user_token=' + this.session.data['user_token'], true)
		});

		data['action'] = await this.url.link('extension/total/klarna_fee', 'user_token=' + this.session.data['user_token'], true);

		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=total', true);

		data['countries'] = {};

		data['countries'].push({
			'name' : this.language.get('text_germany'),
			'code' : 'DEU'
		});

		data['countries'].push({
			'name' : this.language.get('text_netherlands'),
			'code' : 'NLD'
		});

		data['countries'].push({
			'name' : this.language.get('text_denmark'),
			'code' : 'DNK'
		});

		data['countries'].push({
			'name' : this.language.get('text_sweden'),
			'code' : 'SWE'
		});

		data['countries'].push({
			'name' : this.language.get('text_norway'),
			'code' : 'NOR'
		});

		data['countries'].push({
			'name' : this.language.get('text_finland'),
			'code' : 'FIN'
		});

		if ((this.request.post['total_klarna_fee'])) {
			data['total_klarna_fee'] = this.request.post['total_klarna_fee'];
		} else {
			data['total_klarna_fee'] = this.config.get('total_klarna_fee');
		}

		this.load.model('localisation/tax_class',this);

		data['tax_classes'] = await this.model_localisation_tax_class.getTaxClasses();

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/total/klarna_fee', data));
	}

	private function validate() {
		if (!await this.user.hasPermission('modify', 'extension/total/klarna_fee')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length?false:true
	}
}