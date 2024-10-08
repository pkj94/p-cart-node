<?php
namespace Opencart\Admin\Controller\Report;
/**
 * 
 *
 * @package Opencart\Admin\Controller\Report
 */
class StatisticsController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		await this.load.language('report/statistics');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : this.url.link('report/statistics', 'user_token=' + this.session.data['user_token'])
		});

		data['list'] = this.getList();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('report/statistics', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('report/statistics');

		this.response.setOutput(this.getList());
	}

	/**
	 * @return string
	 */
	async getList() {
		data['statistics'] = [];
		
		this.load.model('report/statistics');
		
		const results = await this.model_report_statistics.getStatistics();
		
		for (let result of results) {
			data['statistics'].push({
				'name'  : this.language.get('text_' + result['code']),
				'value' : result['value'],
				'href'  : this.url.link('report/statistics.' + str_replace('_', '', result['code']), 'user_token=' + this.session.data['user_token'])
			];
		}

		return await this.load.view('report/statistics_list', data);
	}

	/**
	 * @return void
	 */
	async orderSale() {
		await this.load.language('report/statistics');

		const json = {};

		if (!await this.user.hasPermission('modify', 'report/statistics')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('report/statistics');
			this.load.model('sale/order');

			await this.model_report_statistics.editValue('order_sale', this.model_sale_order.getTotalSales(['filter_order_status' : implode(',', array_merge(this.config.get('config_complete_status'), this.config.get('config_processing_status')))]));

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async orderProcessing() {
		await this.load.language('report/statistics');

		const json = {};

		if (!await this.user.hasPermission('modify', 'report/statistics')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('report/statistics');
			this.load.model('sale/order');

			await this.model_report_statistics.editValue('order_processing', this.model_sale_order.getTotalOrders(['filter_order_status' : implode(',', this.config.get('config_processing_status'))]));

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async orderComplete() {
		await this.load.language('report/statistics');

		const json = {};

		if (!await this.user.hasPermission('modify', 'report/statistics')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('report/statistics');
			this.load.model('sale/order');

			await this.model_report_statistics.editValue('order_complete', this.model_sale_order.getTotalOrders(['filter_order_status' : implode(',', this.config.get('config_complete_status'))]));

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async orderOther() {
		await this.load.language('report/statistics');

		const json = {};

		if (!await this.user.hasPermission('modify', 'report/statistics')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('report/statistics');
			this.load.model('localisation/order_status');

			order_status_data = [];

			const results = await this.model_localisation_order_status.getOrderStatuses();

			for (let result of results) {
				if (!in_array(result['order_status_id'], array_merge(this.config.get('config_complete_status'), this.config.get('config_processing_status')))) {
					order_status_data[] = result['order_status_id'];
				}
			}

			this.load.model('sale/order');

			await this.model_report_statistics.editValue('order_other', this.model_sale_order.getTotalOrders(['filter_order_status' : implode(',', order_status_data)]));

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async returns() {
		await this.load.language('report/statistics');

		const json = {};

		if (!await this.user.hasPermission('modify', 'report/statistics')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('report/statistics');
			this.load.model('sale/returns');

			await this.model_report_statistics.editValue('return', this.model_sale_returns.getTotalReturns(['filter_return_status_id' : this.config.get('config_return_status_id')]));

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async product() {
		await this.load.language('report/statistics');

		const json = {};

		if (!await this.user.hasPermission('modify', 'report/statistics')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('report/statistics');
			this.load.model('catalog/product');

			await this.model_report_statistics.editValue('product', this.model_catalog_product.getTotalProducts(['filter_quantity' : 0]));

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async review() {
		await this.load.language('report/statistics');

		const json = {};

		if (!await this.user.hasPermission('modify', 'report/statistics')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('report/statistics');
			this.load.model('catalog/review');

			await this.model_report_statistics.editValue('review', this.model_catalog_review.getTotalReviewsAwaitingApproval());

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}