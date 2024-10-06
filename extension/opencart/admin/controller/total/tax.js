<?php
namespace Opencart\Admin\Controller\Extension\Opencart\Total;
/**
 * Class Tax
 *
 * @package Opencart\Admin\Controller\Extension\Opencart\Total
 */
class Tax extends \Opencart\System\Engine\Controller {
	/**
	 * @var array
	 */
	private array $error = [];

	/**
	 * @return void
	 */
	public function index(): void {
		this.load.language('extension/opencart/total/tax');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : this.url.link('common/dashboard', 'user_token=' . this.session.data['user_token'])
		];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_extension'),
			'href' : this.url.link('marketplace/extension', 'user_token=' . this.session.data['user_token'] . '&type=total')
		];

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : this.url.link('extension/opencart/total/tax', 'user_token=' . this.session.data['user_token'])
		];

		data['save'] = this.url.link('extension/opencart/total/tax.save', 'user_token=' . this.session.data['user_token']);
		data['back'] = this.url.link('marketplace/extension', 'user_token=' . this.session.data['user_token'] . '&type=total');

		data['total_tax_status'] = this.config.get('total_tax_status');
		data['total_tax_sort_order'] = this.config.get('total_tax_sort_order');

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/opencart/total/tax', data));
	}

	/**
	 * @return void
	 */
	public function save(): void {
		this.load.language('extension/opencart/total/tax');

		$const json = {};

		if (!this.user.hasPermission('modify', 'extension/opencart/total/tax')) {
			$json['error'] = this.language.get('error_permission');
		}

		if (!$json) {
			this.load.model('setting/setting',this);

			this.model_setting_setting.editSetting('total_tax', this.request.post);

			$json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}