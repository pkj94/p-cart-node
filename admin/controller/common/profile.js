module.exports = class ControllerCommonProfile extends Controller {
	error = {};

	async index() {
		await this.load.language('common/profile');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('user/user');

		if ((this.request.server['method'] == 'POST') && this.validateForm()) {
			user_data = array_merge(this.request.post, array(
				'user_group_id' : await this.user.getGroupId(),
				'status'        : 1,
			));

			await this.model_user_user.editUser(await this.user.getId(), user_data);

			this.session.data['success'] = this.language.get('text_success');

			this.response.setRedirect(await this.url.link('common/profile', 'user_token=' + this.session.data['user_token'], true));
		}

		if ((this.session.data['success'])) {
			data['success'] = this.session.data['success'];

			delete this.session.data['success']);
		} else {
			data['success'] = '';
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.error['username'])) {
			data['error_username'] = this.error['username'];
		} else {
			data['error_username'] = '';
		}

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

		if ((this.error['firstname'])) {
			data['error_firstname'] = this.error['firstname'];
		} else {
			data['error_firstname'] = '';
		}

		if ((this.error['lastname'])) {
			data['error_lastname'] = this.error['lastname'];
		} else {
			data['error_lastname'] = '';
		}

		if ((this.error['email'])) {
			data['error_email'] = this.error['email'];
		} else {
			data['error_email'] = '';
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		);

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('common/profile', 'user_token=' + this.session.data['user_token'], true)
		);

		data['action'] = await this.url.link('common/profile', 'user_token=' + this.session.data['user_token'], true);

		data['cancel'] = await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true);

		if (this.request.server['method'] != 'POST') {
			user_info = await this.model_user_user.getUser(await this.user.getId());
		}

		if ((this.request.post['username'])) {
			data['username'] = this.request.post['username'];
		} else if ((user_info)) {
			data['username'] = user_info['username'];
		} else {
			data['username'] = '';
		}

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

		if ((this.request.post['firstname'])) {
			data['firstname'] = this.request.post['firstname'];
		} else if ((user_info)) {
			data['firstname'] = user_info['firstname'];
		} else {
			data['firstname'] = '';
		}

		if ((this.request.post['lastname'])) {
			data['lastname'] = this.request.post['lastname'];
		} else if ((user_info)) {
			data['lastname'] = user_info['lastname'];
		} else {
			data['lastname'] = '';
		}

		if ((this.request.post['email'])) {
			data['email'] = this.request.post['email'];
		} else if ((user_info)) {
			data['email'] = user_info['email'];
		} else {
			data['email'] = '';
		}

		if ((this.request.post['image'])) {
			data['image'] = this.request.post['image'];
		} else if ((user_info)) {
			data['image'] = user_info['image'];
		} else {
			data['image'] = '';
		}

		this.load.model('tool/image',this);

		if ((this.request.post['image']) && is_file(DIR_IMAGE + this.request.post['image'])) {
			data['thumb'] = await this.model_tool_image.resize(this.request.post['image'], 100, 100);
		} else if ((user_info) && user_info['image'] && is_file(DIR_IMAGE + user_info['image'])) {
			data['thumb'] = await this.model_tool_image.resize(user_info['image'], 100, 100);
		} else {
			data['thumb'] = await this.model_tool_image.resize('no_image.png', 100, 100);
		}

		data['placeholder'] = await this.model_tool_image.resize('no_image.png', 100, 100);

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('common/profile', data));
	}

	async validateForm() {
		if (!await this.user.hasPermission('modify', 'common/profile')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		if ((oc_strlen(this.request.post['username']) < 3) || (oc_strlen(this.request.post['username']) > 20)) {
			this.error['username'] = this.language.get('error_username');
		}

		user_info = await this.model_user_user.getUserByUsername(this.request.post['username']);

		if (user_info && (await this.user.getId() != user_info['user_id'])) {
			this.error['warning'] = this.language.get('error_exists_username');
		}

		if ((oc_strlen(trim(this.request.post['firstname'])) < 1) || (oc_strlen(trim(this.request.post['firstname'])) > 32)) {
			this.error['firstname'] = this.language.get('error_firstname');
		}

		if ((oc_strlen(trim(this.request.post['lastname'])) < 1) || (oc_strlen(trim(this.request.post['lastname'])) > 32)) {
			this.error['lastname'] = this.language.get('error_lastname');
		}

		if ((oc_strlen(this.request.post['email']) > 96) || !filter_var(this.request.post['email'], FILTER_VALIDATE_EMAIL)) {
			this.error['email'] = this.language.get('error_email');
		}

		user_info = await this.model_user_user.getUserByEmail(this.request.post['email']);

		if (user_info && (await this.user.getId() != user_info['user_id'])) {
			this.error['warning'] = this.language.get('error_exists_email');
		}

		if (this.request.post['password']) {
			if ((oc_strlen(html_entity_decode(this.request.post['password'])) < 4) || (oc_strlen(html_entity_decode(this.request.post['password'])) > 40)) {
				this.error['password'] = this.language.get('error_password');
			}

			if (this.request.post['password'] != this.request.post['confirm']) {
				this.error['confirm'] = this.language.get('error_confirm');
			}
		}

		return Object.keys(this.error).length?false:true
	}
}
