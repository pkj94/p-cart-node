<?php
namespace Opencart\Admin\Controller\Error;
/**
 * 
 *
 * @package Opencart\Admin\Controller\Error
 */
class PermissionController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		await this.load.language('error/permission');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : this.url.link(this.request.get['route'], 'user_token=' + this.session.data['user_token'])
		});

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('error/permission', data));
	}
}
