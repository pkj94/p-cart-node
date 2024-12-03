module.exports = class ControllerCommonReset extends Controller {
	error = {};

	async index() {
const data = {};
		if (await this.user.isLogged() && (this.request.get['user_token']) && (this.request.get['user_token'] == this.session.data['user_token'])) {
			this.response.setRedirect(await this.url.link('common/dashboard', '', true));
		}

		if (!this.config.get('config_password')) {
			this.response.setRedirect(await this.url.link('common/login', '', true));
		}

		if ((this.request.get['code'])) {
			code = this.request.get['code'];
		} else {
			code = '';
		}

		this.load.model('user/user',this);

		user_info = await this.model_user_user.getUserByCode(code);

		if (user_info) {
			await this.load.language('common/reset');

			this.document.setTitle(this.language.get('heading_title'));

			if ((this.request.server['method'] == 'POST') && await this.validate()) {
				await this.model_user_user.editPassword(user_info['user_id'], this.request.post['password']);

				await this.model_user_user.deleteLoginAttempts(user_info['username']);

				this.session.data['success'] = this.language.get('text_success');
await this.session.save(this.session.data);

				this.response.setRedirect(await this.url.link('common/login', '', true));
			}

			data['breadcrumbs'] = [];

			data['breadcrumbs'].push({
				'text' : this.language.get('text_home'),
				'href' : await this.url.link('common/dashboard', '', true)
			});

			data['breadcrumbs'].push({
				'text' : this.language.get('heading_title'),
				'href' : await this.url.link('common/reset', '', true)
			});

			if ((this.error['password'])) {
				data['error_password'] = this.error['password'];
			} else {
				data['error_password'] = '';
			}

			if ((this.error['confirm'])) {
				data['error_confirm'] = this.error['confirm'];
			} else {
				data['error_confirm'] = '';
			}

			data['action'] = await this.url.link('common/reset', 'code=' + code, true);

			data['cancel'] = await this.url.link('common/login', '', true);

			if ((this.request.post['password'])) {
				data['password'] = this.request.post['password'];
			} else {
				data['password'] = '';
			}

			if ((this.request.post['confirm'])) {
				data['confirm'] = this.request.post['confirm'];
			} else {
				data['confirm'] = '';
			}

			data['header'] = await this.load.controller('common/header');
			data['footer'] = await this.load.controller('common/footer');

			this.response.setOutput(await this.load.view('common/reset', data));
		} else {
			this.load.model('setting/setting',this);

			await this.model_setting_setting.editSettingValue('config', 'config_password', '0');

			return new Action('common/login');
		}
	}

	async validate() {
		if ((oc_strlen(html_entity_decode(this.request.post['password'])) < 4) || (oc_strlen(html_entity_decode(this.request.post['password'])) > 40)) {
			this.error['password'] = this.language.get('error_password');
		}

		if (this.request.post['confirm'] != this.request.post['password']) {
			this.error['confirm'] = this.language.get('error_confirm');
		}

		return Object.keys(this.error).length?false:true
	}
}