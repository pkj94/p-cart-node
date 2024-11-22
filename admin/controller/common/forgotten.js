module.exports = class ControllerCommonForgotten extends Controller {
	error = {};

	async index() {
		if (await this.user.isLogged() && (this.request.get['user_token']) && (this.request.get['user_token'] == this.session.data['user_token'])) {
			this.response.setRedirect(await this.url.link('common/dashboard', '', true));
		}

		if (!this.config.get('config_password')) {
			this.response.setRedirect(await this.url.link('common/login', '', true));
		}

		await this.load.language('common/forgotten');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('user/user',this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			user_info = await this.model_user_user.getUserByEmail(this.request.post['email']);

			// for better security use existing validated user email address instead of the posted one
			await this.model_user_user.editCode(user_info['email'], token(40));

			this.session.data['success'] = this.language.get('text_success');

			this.response.setRedirect(await this.url.link('common/login', '', true));
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : await this.url.link('common/dashboard', '', true)
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('common/forgotten', 'user_token=' + '', true)
		});

		data['action'] = await this.url.link('common/forgotten', '', true);

		data['cancel'] = await this.url.link('common/login', '', true);

		if ((this.request.post['email'])) {
			data['email'] = this.request.post['email'];
		} else {
			data['email'] = '';
		}

		data['header'] = await this.load.controller('common/header');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('common/forgotten', data));
	}

	async validate() {
		if (!(this.request.post['email'])) {
			this.error['warning'] = this.language.get('error_email');
		} else if (!await this.model_user_user.getTotalUsersByEmail(this.request.post['email'])) {
			this.error['warning'] = this.language.get('error_email');
		}

		return Object.keys(this.error).length?false:true
	}
}
