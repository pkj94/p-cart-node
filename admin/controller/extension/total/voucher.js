module.exports = class ControllerExtensionTotalVoucher extends Controller {
	error = {};

	async index() {
const data = {};
		await this.load.language('extension/total/voucher');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/setting',this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('total_voucher', this.request.post);

			this.session.data['success'] = this.language.get('text_success');
await this.session.save(this.session.data);

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
			'href' : await this.url.link('extension/total/voucher', 'user_token=' + this.session.data['user_token'], true)
		});

		data['action'] = await this.url.link('extension/total/voucher', 'user_token=' + this.session.data['user_token'], true);

		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=total', true);

		if ((this.request.post['total_voucher_status'])) {
			data['total_voucher_status'] = this.request.post['total_voucher_status'];
		} else {
			data['total_voucher_status'] = this.config.get('total_voucher_status');
		}

		if ((this.request.post['total_voucher_sort_order'])) {
			data['total_voucher_sort_order'] = this.request.post['total_voucher_sort_order'];
		} else {
			data['total_voucher_sort_order'] = this.config.get('total_voucher_sort_order');
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/total/voucher', data));
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/total/voucher')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length?false:true
	}

	async install() {
		// Register the event triggers
		this.load.model('setting/event',this);

		await this.model_setting_event.addEvent('voucher', 'catalog/model/checkout/order/addOrderHistory/after', 'extension/total/voucher/send');
	}

	async uninstall() {
		// delete the event triggers
		this.load.model('setting/event',this);

		await this.model_setting_event.deleteEventByCode('voucher');
	}
}
