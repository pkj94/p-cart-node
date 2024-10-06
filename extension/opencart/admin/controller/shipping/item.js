<?php
namespace Opencart\Admin\Controller\Extension\Opencart\Shipping;
/**
 * Class Item
 *
 * @package Opencart\Admin\Controller\Extension\Opencart\Shipping
 */
class Item extends \Opencart\System\Engine\Controller {
	/**
	 * @return void
	 */
	public function index(): void {
		this.load.language('extension/opencart/shipping/item');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : this.url.link('common/dashboard', 'user_token=' . this.session.data['user_token'])
		];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_extension'),
			'href' : this.url.link('marketplace/extension', 'user_token=' . this.session.data['user_token'] . '&type=shipping')
		];

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : this.url.link('extension/opencart/shipping/item', 'user_token=' . this.session.data['user_token'])
		];

		data['save'] = this.url.link('extension/opencart/shipping/item.save', 'user_token=' . this.session.data['user_token']);
		data['back'] = this.url.link('marketplace/extension', 'user_token=' . this.session.data['user_token'] . '&type=shipping');

		data['shipping_item_cost'] = this.config.get('shipping_item_cost');
		data['shipping_item_tax_class_id'] = this.config.get('shipping_item_tax_class_id');

		this.load.model('localisation/tax_class');

		data['tax_classes'] = this.model_localisation_tax_class.getTaxClasses();
		data['shipping_item_geo_zone_id'] = this.config.get('shipping_item_geo_zone_id');

		this.load.model('localisation/geo_zone');

		data['geo_zones'] = this.model_localisation_geo_zone.getGeoZones();

		data['shipping_item_status'] = this.config.get('shipping_item_status');
		data['shipping_item_sort_order'] = this.config.get('shipping_item_sort_order');

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/opencart/shipping/item', data));
	}

	/**
	 * @return void
	 */
	public function save(): void {
		this.load.language('extension/opencart/shipping/item');

		$const json = {};

		if (!this.user.hasPermission('modify', 'extension/opencart/shipping/item')) {
			$json['error'] = this.language.get('error_permission');
		}

		if (!$json) {
			this.load.model('setting/setting',this);

			this.model_setting_setting.editSetting('shipping_item', this.request.post);

			$json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}