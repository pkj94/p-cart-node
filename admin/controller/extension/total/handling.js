module.exports = class ControllerExtensionTotalHandling extends Controller {
	error = {};

	async index() {
		await this.load.language('extension/total/handling');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/setting',this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('total_handling', this.request.post);

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
			'href' : await this.url.link('extension/total/handling', 'user_token=' + this.session.data['user_token'], true)
		});

		data['action'] = await this.url.link('extension/total/handling', 'user_token=' + this.session.data['user_token'], true);

		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=total', true);

		if ((this.request.post['total_handling_total'])) {
			data['total_handling_total'] = this.request.post['total_handling_total'];
		} else {
			data['total_handling_total'] = this.config.get('total_handling_total');
		}

		if ((this.request.post['total_handling_fee'])) {
			data['total_handling_fee'] = this.request.post['total_handling_fee'];
		} else {
			data['total_handling_fee'] = this.config.get('total_handling_fee');
		}

		if ((this.request.post['total_handling_tax_class_id'])) {
			data['total_handling_tax_class_id'] = this.request.post['total_handling_tax_class_id'];
		} else {
			data['total_handling_tax_class_id'] = this.config.get('total_handling_tax_class_id');
		}

		this.load.model('localisation/tax_class',this);

		data['tax_classes'] = await this.model_localisation_tax_class.getTaxClasses();

		if ((this.request.post['total_handling_status'])) {
			data['total_handling_status'] = this.request.post['total_handling_status'];
		} else {
			data['total_handling_status'] = this.config.get('total_handling_status');
		}

		if ((this.request.post['total_handling_sort_order'])) {
			data['total_handling_sort_order'] = this.request.post['total_handling_sort_order'];
		} else {
			data['total_handling_sort_order'] = this.config.get('total_handling_sort_order');
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/total/handling', data));
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/total/handling')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length?false:true
	}
}