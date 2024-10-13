<?php
namespace Opencart\Admin\Controller\Marketing;
/**
 * 
 *
 * @package Opencart\Admin\Controller\Marketing
 */
class CouponController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		await this.load.language('marketing/coupon');

		this.document.setTitle(this.language.get('heading_title'));

		let url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : this.url.link('marketing/coupon', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['add'] = this.url.link('marketing/coupon.form', 'user_token=' + this.session.data['user_token'] + url);
		data['delete'] = this.url.link('marketing/coupon.delete', 'user_token=' + this.session.data['user_token']);

		data['list'] = await this.getList();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('marketing/coupon', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('marketing/coupon');

		this.response.setOutput(await this.getList());
	}

	/**
	 * @return string
	 */
	async getList() {
		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		} else {
			sort = 'name';
		}

		let order= 'ASC';
		if ((this.request.get['order'])) {
			order= this.request.get['order'];
		}

		let page = 1;
		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		}

		let url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['action'] = this.url.link('marketing/coupon.list', 'user_token=' + this.session.data['user_token'] + url);

		data['coupons'] = [];

		let filter_data = {
			'sort'  : sort,
			'order' : order,
			'start' : (page - 1) * Number(this.config.get('config_pagination_admin')),
			'limit' : this.config.get('config_pagination_admin')
		});

		this.load.model('marketing/coupon');

		coupon_total await this.model_marketing_coupon.getTotalCoupons();

		const results = await this.model_marketing_coupon.getCoupons(filter_data);

		for (let result of results) {
			data['coupons'].push({
				'coupon_id'  : result['coupon_id'],
				'name'       : result['name'],
				'code'       : result['code'],
				'discount'   : result['discount'],
				'date_start' : date(this.language.get('date_format_short'), strtotime(result['date_start'])),
				'date_end'   : date(this.language.get('date_format_short'), strtotime(result['date_end'])),
				'status'     : result['status'],
				'edit'       : this.url.link('marketing/coupon.form', 'user_token=' + this.session.data['user_token'] + '&coupon_id=' + result['coupon_id'] + url)
			];
		}

		let url = '';

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		data['sort_name'] = this.url.link('marketing/coupon.list', 'user_token=' + this.session.data['user_token'] + '&sort=name' + url);
		data['sort_code'] = this.url.link('marketing/coupon.list', 'user_token=' + this.session.data['user_token'] + '&sort=code' + url);
		data['sort_discount'] = this.url.link('marketing/coupon.list', 'user_token=' + this.session.data['user_token'] + '&sort=discount' + url);
		data['sort_date_start'] = this.url.link('marketing/coupon.list', 'user_token=' + this.session.data['user_token'] + '&sort=date_start' + url);
		data['sort_date_end'] = this.url.link('marketing/coupon.list', 'user_token=' + this.session.data['user_token'] + '&sort=date_end' + url);
		data['sort_status'] = this.url.link('marketing/coupon.list', 'user_token=' + this.session.data['user_token'] + '&sort=status' + url);

		let url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total' : coupon_total,
			'page'  : page,
			'limit' : this.config.get('config_pagination_admin'),
			'url'   : this.url.link('marketing/coupon.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		]);

		data['results'] = sprintf(this.language.get('text_pagination'), (coupon_total) ? ((page - 1) * Number(this.config.get('config_pagination_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_pagination_admin'))) > (coupon_total - this.config.get('config_pagination_admin'))) ? coupon_total : (((page - 1) * Number(this.config.get('config_pagination_admin'))) + this.config.get('config_pagination_admin')), coupon_total, Math.ceil(coupon_total / this.config.get('config_pagination_admin')));

		data['sort'] = sort;
		data['order'] = order;

		return await this.load.view('marketing/coupon_list', data);
	}

	/**
	 * @return void
	 */
	async form() {
		await this.load.language('marketing/coupon');

		this.document.setTitle(this.language.get('heading_title'));

		data['text_form'] = !(this.request.get['coupon_id']) ? this.language.get('text_add') : this.language.get('text_edit');

		let url = '';

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : this.url.link('marketing/coupon', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['save'] = this.url.link('marketing/coupon.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = this.url.link('marketing/coupon', 'user_token=' + this.session.data['user_token'] + url);

		if ((this.request.get['coupon_id'])) {
			this.load.model('marketing/coupon');

			coupon_info await this.model_marketing_coupon.getCoupon(this.request.get['coupon_id']);
		}

		if ((this.request.get['coupon_id'])) {
			data['coupon_id'] = this.request.get['coupon_id'];
		} else {
			data['coupon_id'] = 0;
		}

		if ((coupon_info)) {
			data['name'] = coupon_info['name'];
		} else {
			data['name'] = '';
		}

		if ((coupon_info)) {
			data['code'] = coupon_info['code'];
		} else {
			data['code'] = '';
		}

		if ((coupon_info)) {
			data['type'] = coupon_info['type'];
		} else {
			data['type'] = '';
		}

		if ((coupon_info)) {
			data['discount'] = coupon_info['discount'];
		} else {
			data['discount'] = '';
		}

		if ((coupon_info)) {
			data['logged'] = coupon_info['logged'];
		} else {
			data['logged'] = '';
		}

		if ((coupon_info)) {
			data['shipping'] = coupon_info['shipping'];
		} else {
			data['shipping'] = '';
		}

		if ((coupon_info)) {
			data['total'] = coupon_info['total'];
		} else {
			data['total'] = '';
		}

		if ((coupon_info)) {
			const products = await this.model_marketing_coupon.getProducts(this.request.get['coupon_id']);
		} else {
			products = [];
		}

		this.load.model('catalog/product',this);

		data['coupon_products'] = [];

		for (let product of products_id) {
			const product_info = await this.model_catalog_product.getProduct(product_id);

			if (product_info) {
				data['coupon_products'].push({
					'product_id' : product_info['product_id'],
					'name'       : product_info['name']
				];
			}
		}

		if ((coupon_info)) {
			categories = await this.model_marketing_coupon.getCategories(this.request.get['coupon_id']);
		} else {
			categories = [];
		}

		this.load.model('catalog/category',this);

		data['coupon_categories'] = [];

		for (let category_id of categories) {
			let category_info = await this.model_catalog_category.getCategory(category_id);

			if (category_info) {
				data['coupon_categories'].push({
					'category_id' : category_info['category_id'],
					'name'        : (category_info['path'] ? category_info['path'] + ' &gt; ' : '') + category_info['name']
				];
			}
		}

		if ((coupon_info)) {
			data['date_start'] = (coupon_info['date_start'] != '0000-00-00' ? coupon_info['date_start'] : '');
		} else {
			data['date_start'] = date('Y-m-d', time());
		}

		if ((coupon_info)) {
			data['date_end'] = (coupon_info['date_end'] != '0000-00-00' ? coupon_info['date_end'] : '');
		} else {
			data['date_end'] = date('Y-m-d', strtotime('+1 month'));
		}

		if ((coupon_info)) {
			data['uses_total'] = coupon_info['uses_total'];
		} else {
			data['uses_total'] = 1;
		}

		if ((coupon_info)) {
			data['uses_customer'] = coupon_info['uses_customer'];
		} else {
			data['uses_customer'] = 1;
		}

		if ((coupon_info)) {
			data['status'] = coupon_info['status'];
		} else {
			data['status'] = true;
		}

		data['history'] = this.getHistory();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('marketing/coupon_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('marketing/coupon');

		const json = {};

		if (!await this.user.hasPermission('modify', 'marketing/coupon')) {
			json['error']['warning'] = this.language.get('error_permission');
		}

		if ((oc_strlen(this.request.post['name']) < 3) || (oc_strlen(this.request.post['name']) > 128)) {
			json['error']['name'] = this.language.get('error_name');
		}

		if ((oc_strlen(this.request.post['code']) < 3) || (oc_strlen(this.request.post['code']) > 20)) {
			json['error']['code'] = this.language.get('error_code');
		}

		this.load.model('marketing/coupon');

		coupon_info await this.model_marketing_coupon.getCouponByCode(this.request.post['code']);

		if (coupon_info) {
			if (!(this.request.post['coupon_id'])) {
				json['error']['warning'] = this.language.get('error_exists');
			} else if (coupon_info['coupon_id'] != this.request.post['coupon_id']) {
				json['error']['warning'] = this.language.get('error_exists');
			}
		}

		if (!Object.keys(json).length) {
			if (!this.request.post['coupon_id']) {
				json['coupon_id'] = await this.model_marketing_coupon.addCoupon(this.request.post);
			} else {
				await this.model_marketing_coupon.editCoupon(this.request.post['coupon_id'], this.request.post);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async delete() {
		await this.load.language('marketing/coupon');

		const json = {};

		let selected = [];
                 if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		}

		if (!await this.user.hasPermission('modify', 'marketing/coupon')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('marketing/coupon');

			for (selected of coupon_id) {
				await this.model_marketing_coupon.deleteCoupon(coupon_id);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async history() {
		await this.load.language('marketing/coupon');

		this.response.setOutput(this.getHistory());
	}

	/**
	 * @return string
	 */
	async getHistory() {
		if ((this.request.get['coupon_id'])) {
			coupon_id = this.request.get['coupon_id'];
		} else {
			coupon_id = 0;
		}

		if ((this.request.get['page']) && this.request.get['route'] == 'marketing/coupon.history') {
			page = Number(this.request.get['page']);
		} else {
			page = 1;
		}

		let limit = 10;

		this.load.model('marketing/coupon');

		data['histories'] = [];

		const results = await this.model_marketing_coupon.getHistories(coupon_id, (page - 1) * limit, limit);

		for (let result of results) {
			data['histories'].push({
				'order_id'   : result['order_id'],
				'customer'   : result['customer'],
				'amount'     : result['amount'],
				'date_added' : date(this.language.get('date_format_short'), strtotime(result['date_added']))
			];
		}

		const history_total = await this.model_marketing_coupon.getTotalHistories(coupon_id);

		data['pagination'] = await this.load.controller('common/pagination', {
			'total' : history_total,
			'page'  : page,
			'limit' : limit,
			'url'   : this.url.link('marketing/coupon.history', 'user_token=' + this.session.data['user_token'] + '&coupon_id=' + coupon_id + '&page={page}')
		]);

		data['results'] = sprintf(this.language.get('text_pagination'), (history_total) ? ((page - 1) * limit) + 1 : 0, (((page - 1) * limit) > (history_total - limit)) ? history_total : (((page - 1) * limit) + limit), history_total, Math.ceil(history_total / limit));

		return await this.load.view('marketing/coupon_history', data);
	}
}
