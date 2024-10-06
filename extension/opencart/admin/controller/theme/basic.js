<?php
namespace Opencart\Admin\Controller\Extension\Opencart\Theme;
/**
 * Class Basic
 *
 * @package Opencart\Admin\Controller\Extension\Opencart\Theme
 */
class Basic extends \Opencart\System\Engine\Controller {
	/**
	 * @return void
	 */
	public function index(): void {
		this.load.language('extension/opencart/theme/basic');

		this.document.setTitle(this.language.get('heading_title'));

		if (isset(this.request.get['store_id'])) {
			$store_id = (int)this.request.get['store_id'];
		} else {
			$store_id = 0;
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : this.url.link('common/dashboard', 'user_token=' . this.session.data['user_token'])
		];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_extension'),
			'href' : this.url.link('marketplace/extension', 'user_token=' . this.session.data['user_token'] . '&type=theme')
		];

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : this.url.link('extension/opencart/theme/basic', 'user_token=' . this.session.data['user_token'] . '&store_id=' . $store_id)
		];

		data['save'] = this.url.link('extension/opencart/theme/basic.save', 'user_token=' . this.session.data['user_token'] . '&store_id=' . $store_id);
		data['back'] = this.url.link('marketplace/extension', 'user_token=' . this.session.data['user_token'] . '&type=theme');

		if (isset(this.request.get['store_id'])) {
			this.load.model('setting/setting',this);

			$setting_info = this.model_setting_setting.getSetting('theme_basic', this.request.get['store_id']);
		}

		if (isset($setting_info['theme_basic_status'])) {
			data['theme_basic_status'] = $setting_info['theme_basic_status'];
		} else {
			data['theme_basic_status'] = '';
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/opencart/theme/basic', data));
	}

	/**
	 * @return void
	 */
	public function save(): void {
		this.load.language('extension/opencart/theme/basic');

		if (isset(this.request.get['store_id'])) {
			$store_id = (int)this.request.get['store_id'];
		} else {
			$store_id = 0;
		}

		$const json = {};

		if (!this.user.hasPermission('modify', 'extension/opencart/theme/basic')) {
			$json['error'] = this.language.get('error_permission');
		}

		if (!$json) {
			this.load.model('setting/setting',this);

			this.model_setting_setting.editSetting('theme_basic', this.request.post, $store_id);

			$json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
