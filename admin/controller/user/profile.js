<?php
namespace Opencart\Admin\Controller\User;
/**
 * 
 *
 * @package Opencart\Admin\Controller\User
 */
class ProfileController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		await this.load.language('user/profile');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : this.url.link('user/profile', 'user_token=' + this.session.data['user_token'])
		});

		data['save'] = this.url.link('user/profile.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token']);

		this.load.model('user/user',this);

		const user_info = await this.model_user_user.getUser(this.user.getId());

		if ((user_info)) {
			data['username'] = user_info['username'];
		} else {
			data['username'] = '';
		}

		if ((user_info)) {
			data['firstname'] = user_info['firstname'];
		} else {
			data['firstname'] = '';
		}

		if ((user_info)) {
			data['lastname'] = user_info['lastname'];
		} else {
			data['lastname'] = '';
		}

		if ((user_info)) {
			data['email'] = user_info['email'];
		} else {
			data['email'] = '';
		}

		if ((user_info)) {
			data['image'] = user_info['image'];
		} else {
			data['image'] = '';
		}

		this.load.model('tool/image',this);

		data['placeholder'] = await this.model_tool_image.resize('no_image.png', 100, 100);

		if (is_file(DIR_IMAGE + html_entity_decode(data['image']))) {
			data['thumb'] = await this.model_tool_image.resize(html_entity_decode(data['image']), 100, 100);
		} else {
			data['thumb'] = data['placeholder'];
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('user/profile', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('user/profile');

		const json = {};

		if (!await this.user.hasPermission('modify', 'user/profile')) {
			json['error']['warning'] = this.language.get('error_permission');
		}

		if ((oc_strlen(this.request.post['username']) < 3) || (oc_strlen(this.request.post['username']) > 20)) {
			json['error']['username'] = this.language.get('error_username');
		}

		this.load.model('user/user',this);

		const user_info = await this.model_user_user.getUserByUsername(this.request.post['username']);

		if (user_info && (this.user.getId() != user_info['user_id'])) {
			json['error']['warning'] = this.language.get('error_username_exists');
		}

		if ((oc_strlen(this.request.post['firstname']) < 1) || (oc_strlen(this.request.post['firstname']) > 32)) {
			json['error']['firstname'] = this.language.get('error_firstname');
		}

		if ((oc_strlen(this.request.post['lastname']) < 1) || (oc_strlen(this.request.post['lastname']) > 32)) {
			json['error']['lastname'] = this.language.get('error_lastname');
		}

		if ((oc_strlen(this.request.post['email']) > 96) || !filter_var(this.request.post['email'], FILTER_VALIDATE_EMAIL)) {
			json['error']['email'] = this.language.get('error_email');
		}

		const user_info = await this.model_user_user.getUserByEmail(this.request.post['email']);

		if (user_info && (this.user.getId() != user_info['user_id'])) {
			json['error']['warning'] = this.language.get('error_email_exists');
		}

		if (this.request.post['password']) {
			if ((oc_strlen(html_entity_decode(this.request.post['password'])) < 4) || (oc_strlen(html_entity_decode(this.request.post['password'])) > 40)) {
				json['error']['password'] = this.language.get('error_password');
			}

			if (this.request.post['password'] != this.request.post['confirm']) {
				json['error']['confirm'] = this.language.get('error_confirm');
			}
		}

		if (!Object.keys(json).length) {
			user_data = array_merge(this.request.post, [
				'user_group_id' : this.user.getGroupId(),
				'status'        : 1,
			]);

			await this.model_user_user.editUser(this.user.getId(), user_data);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}