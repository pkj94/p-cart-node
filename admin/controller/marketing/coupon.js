module.exports = class ControllerMarketingCoupon extends Controller {
	error = {};

	async index() {
		const data = {};
		await this.load.language('marketing/coupon');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('marketing/coupon');

		await this.getList();
	}

	async add() {
		await this.load.language('marketing/coupon');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('marketing/coupon');

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_marketing_coupon.addCoupon(this.request.post);

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);

			url = '';

			if ((this.request.get['sort'])) {
				url += '&sort=' + this.request.get['sort'];
			}

			if ((this.request.get['order'])) {
				url += '&order=' + this.request.get['order'];
			}

			if ((this.request.get['page'])) {
				url += '&page=' + this.request.get['page'];
			}

			this.response.setRedirect(await this.url.link('marketing/coupon', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async edit() {
		await this.load.language('marketing/coupon');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('marketing/coupon');

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_marketing_coupon.editCoupon(this.request.get['coupon_id'], this.request.post);

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);

			url = '';

			if ((this.request.get['sort'])) {
				url += '&sort=' + this.request.get['sort'];
			}

			if ((this.request.get['order'])) {
				url += '&order=' + this.request.get['order'];
			}

			if ((this.request.get['page'])) {
				url += '&page=' + this.request.get['page'];
			}

			this.response.setRedirect(await this.url.link('marketing/coupon', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async delete() {
		await this.load.language('marketing/coupon');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('marketing/coupon');

		if ((this.request.post['selected']) && await this.validateDelete()) {
			this.request.post['selected'] = Array.isArray(this.request.post['selected']) ? this.request.post['selected'] : [this.request.post['selected']]
			for (let coupon_id of this.request.post['selected']) {
				await this.model_marketing_coupon.deleteCoupon(coupon_id);
			}

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);

			url = '';

			if ((this.request.get['sort'])) {
				url += '&sort=' + this.request.get['sort'];
			}

			if ((this.request.get['order'])) {
				url += '&order=' + this.request.get['order'];
			}

			if ((this.request.get['page'])) {
				url += '&page=' + this.request.get['page'];
			}

			this.response.setRedirect(await this.url.link('marketing/coupon', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getList();
	}

	async getList() {
		const data = {};
		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		} else {
			sort = 'name';
		}

		if ((this.request.get['order'])) {
			order = this.request.get['order'];
		} else {
			order = 'ASC';
		}
		page = 1;
		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		}

		url = '';

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
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('marketing/coupon', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		data['add'] = await this.url.link('marketing/coupon/add', 'user_token=' + this.session.data['user_token'] + url, true);
		data['delete'] = await this.url.link('marketing/coupon/delete', 'user_token=' + this.session.data['user_token'] + url, true);

		data['coupons'] = {};

		const filter_data = {
			'sort': sort,
			'order': order,
			'start': (page - 1) * Number(this.config.get('config_limit_admin')),
			'limit': Number(this.config.get('config_limit_admin'))
		});

		coupon_total = await this.model_marketing_coupon.getTotalCoupons();

		results = await this.model_marketing_coupon.getCoupons(filter_data);

		for (let result of results) {
			data['coupons'].push({
				'coupon_id': result['coupon_id'],
				'name': result['name'],
				'code': result['code'],
				'discount': result['discount'],
				'date_start': date(this.language.get('date_format_short'), strtotime(result['date_start'])),
				'date_end': date(this.language.get('date_format_short'), strtotime(result['date_end'])),
				'status': (result['status'] ? this.language.get('text_enabled') : this.language.get('text_disabled')),
				'edit': await this.url.link('marketing/coupon/edit', 'user_token=' + this.session.data['user_token'] + '&coupon_id=' + result['coupon_id'] + url, true)
			});
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.session.data['success'])) {
			data['success'] = this.session.data['success'];

			delete this.session.data['success'];
		} else {
			data['success'] = '';
		}

		if ((this.request.post['selected'])) {
			data['selected'] = this.request.post['selected'];
		} else {
			data['selected'] = [];
		}

		url = '';

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['sort_name'] = await this.url.link('marketing/coupon', 'user_token=' + this.session.data['user_token'] + '&sort=name' + url, true);
		data['sort_code'] = await this.url.link('marketing/coupon', 'user_token=' + this.session.data['user_token'] + '&sort=code' + url, true);
		data['sort_discount'] = await this.url.link('marketing/coupon', 'user_token=' + this.session.data['user_token'] + '&sort=discount' + url, true);
		data['sort_date_start'] = await this.url.link('marketing/coupon', 'user_token=' + this.session.data['user_token'] + '&sort=date_start' + url, true);
		data['sort_date_end'] = await this.url.link('marketing/coupon', 'user_token=' + this.session.data['user_token'] + '&sort=date_end' + url, true);
		data['sort_status'] = await this.url.link('marketing/coupon', 'user_token=' + this.session.data['user_token'] + '&sort=status' + url, true);

		url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		const pagination = new Pagination();
		pagination.total = coupon_total;
		pagination.page = page;
		pagination.limit = Number(this.config.get('config_limit_admin'));
		pagination.url = await this.url.link('marketing/coupon', 'user_token=' + this.session.data['user_token'] + url + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (coupon_total) ? ((page - 1) * Number(this.config.get('config_limit_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_limit_admin'))) > (coupon_total - Number(this.config.get('config_limit_admin')))) ? coupon_total : (((page - 1) * Number(this.config.get('config_limit_admin'))) + Number(this.config.get('config_limit_admin'))), coupon_total, Math.ceil(coupon_total / Number(this.config.get('config_limit_admin'))));

		data['sort'] = sort;
		data['order'] = order;

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('marketing/coupon_list', data));
	}

	async getForm() {
		data['text_form'] = !(this.request.get['coupon_id']) ? this.language.get('text_add') : this.language.get('text_edit');

		data['user_token'] = this.session.data['user_token'];

		if ((this.request.get['coupon_id'])) {
			data['coupon_id'] = this.request.get['coupon_id'];
		} else {
			data['coupon_id'] = 0;
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.error['name'])) {
			data['error_name'] = this.error['name'];
		} else {
			data['error_name'] = '';
		}

		if ((this.error['code'])) {
			data['error_code'] = this.error['code'];
		} else {
			data['error_code'] = '';
		}

		if ((this.error['date_start'])) {
			data['error_date_start'] = this.error['date_start'];
		} else {
			data['error_date_start'] = '';
		}

		if ((this.error['date_end'])) {
			data['error_date_end'] = this.error['date_end'];
		} else {
			data['error_date_end'] = '';
		}

		url = '';

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
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('marketing/coupon', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		if (!(this.request.get['coupon_id'])) {
			data['action'] = await this.url.link('marketing/coupon/add', 'user_token=' + this.session.data['user_token'] + url, true);
		} else {
			data['action'] = await this.url.link('marketing/coupon/edit', 'user_token=' + this.session.data['user_token'] + '&coupon_id=' + this.request.get['coupon_id'] + url, true);
		}

		data['cancel'] = await this.url.link('marketing/coupon', 'user_token=' + this.session.data['user_token'] + url, true);

		if ((this.request.get['coupon_id']) && (!this.request.server['method'] != 'POST')) {
			coupon_info = await this.model_marketing_coupon.getCoupon(this.request.get['coupon_id']);
		}

		if ((this.request.post['name'])) {
			data['name'] = this.request.post['name'];
		} else if ((coupon_info)) {
			data['name'] = coupon_info['name'];
		} else {
			data['name'] = '';
		}

		if ((this.request.post['code'])) {
			data['code'] = this.request.post['code'];
		} else if ((coupon_info)) {
			data['code'] = coupon_info['code'];
		} else {
			data['code'] = '';
		}

		if ((this.request.post['type'])) {
			data['type'] = this.request.post['type'];
		} else if ((coupon_info)) {
			data['type'] = coupon_info['type'];
		} else {
			data['type'] = '';
		}

		if ((this.request.post['discount'])) {
			data['discount'] = this.request.post['discount'];
		} else if ((coupon_info)) {
			data['discount'] = coupon_info['discount'];
		} else {
			data['discount'] = '';
		}

		if ((this.request.post['logged'])) {
			data['logged'] = this.request.post['logged'];
		} else if ((coupon_info)) {
			data['logged'] = coupon_info['logged'];
		} else {
			data['logged'] = '';
		}

		if ((this.request.post['shipping'])) {
			data['shipping'] = this.request.post['shipping'];
		} else if ((coupon_info)) {
			data['shipping'] = coupon_info['shipping'];
		} else {
			data['shipping'] = '';
		}

		if ((this.request.post['total'])) {
			data['total'] = this.request.post['total'];
		} else if ((coupon_info)) {
			data['total'] = coupon_info['total'];
		} else {
			data['total'] = '';
		}

		if ((this.request.post['coupon_product'])) {
			products = this.request.post['coupon_product'];
		} else if ((this.request.get['coupon_id'])) {
			products = await this.model_marketing_coupon.getCouponProducts(this.request.get['coupon_id']);
		} else {
			products = {};
		}

		this.load.model('catalog/product', this);

		data['coupon_product'] = {};

		for (let product_id of products) {
			product_info = await this.model_catalog_product.getProduct(product_id);

			if (product_info) {
				data['coupon_product'].push({
					'product_id': product_info['product_id'],
					'name': product_info['name']
				});
			}
		}

		if ((this.request.post['coupon_category'])) {
			categories = this.request.post['coupon_category'];
		} else if ((this.request.get['coupon_id'])) {
			categories = await this.model_marketing_coupon.getCouponCategories(this.request.get['coupon_id']);
		} else {
			categories = {};
		}

		this.load.model('catalog/category', this);

		data['coupon_category'] = {};

		for (categories of category_id) {
			category_info = await this.model_catalog_category.getCategory(category_id);

			if (category_info) {
				data['coupon_category'].push({
					'category_id': category_info['category_id'],
					'name': (category_info['path'] ? category_info['path'] + ' &gt; ' : '') + category_info['name']
				});
			}
		}

		if ((this.request.post['date_start'])) {
			data['date_start'] = this.request.post['date_start'];
		} else if ((coupon_info)) {
			data['date_start'] = (coupon_info['date_start'] != '0000-00-00' ? coupon_info['date_start'] : '');
		} else {
			data['date_start'] = date('Y-m-d', time());
		}

		if ((this.request.post['date_end'])) {
			data['date_end'] = this.request.post['date_end'];
		} else if ((coupon_info)) {
			data['date_end'] = (coupon_info['date_end'] != '0000-00-00' ? coupon_info['date_end'] : '');
		} else {
			data['date_end'] = date('Y-m-d', strtotime('+1 month'));
		}

		if ((this.request.post['uses_total'])) {
			data['uses_total'] = this.request.post['uses_total'];
		} else if ((coupon_info)) {
			data['uses_total'] = coupon_info['uses_total'];
		} else {
			data['uses_total'] = 1;
		}

		if ((this.request.post['uses_customer'])) {
			data['uses_customer'] = this.request.post['uses_customer'];
		} else if ((coupon_info)) {
			data['uses_customer'] = coupon_info['uses_customer'];
		} else {
			data['uses_customer'] = 1;
		}

		if ((this.request.post['status'])) {
			data['status'] = this.request.post['status'];
		} else if ((coupon_info)) {
			data['status'] = coupon_info['status'];
		} else {
			data['status'] = true;
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('marketing/coupon_form', data));
	}

	async validateForm() {
		if (!await this.user.hasPermission('modify', 'marketing/coupon')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		if ((oc_strlen(this.request.post['name']) < 3) || (oc_strlen(this.request.post['name']) > 128)) {
			this.error['name'] = this.language.get('error_name');
		}

		if ((oc_strlen(this.request.post['code']) < 3) || (oc_strlen(this.request.post['code']) > 20)) {
			this.error['code'] = this.language.get('error_code');
		}

		coupon_info = await this.model_marketing_coupon.getCouponByCode(this.request.post['code']);

		if (coupon_info) {
			if (!(this.request.get['coupon_id'])) {
				this.error['warning'] = this.language.get('error_exists');
			} else if (coupon_info['coupon_id'] != this.request.get['coupon_id']) {
				this.error['warning'] = this.language.get('error_exists');
			}
		}

		return Object.keys(this.error).length ? false : true
	}

	async validateDelete() {
		if (!await this.user.hasPermission('modify', 'marketing/coupon')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length ? false : true
	}

	async history() {
		await this.load.language('marketing/coupon');

		this.load.model('marketing/coupon');
		page = 1;
		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		}

		data['histories'] = {};

		results = await this.model_marketing_coupon.getCouponHistories(this.request.get['coupon_id'], (page - 1) * 10, 10);

		for (let result of results) {
			data['histories'].push({
				'order_id': result['order_id'],
				'customer': result['customer'],
				'amount': result['amount'],
				'date_added': date(this.language.get('date_format_short'), strtotime(result['date_added']))
			});
		}

		history_total = await this.model_marketing_coupon.getTotalCouponHistories(this.request.get['coupon_id']);

		const pagination = new Pagination();
		pagination.total = history_total;
		pagination.page = page;
		pagination.limit = 10;
		pagination.url = await this.url.link('marketing/coupon/history', 'user_token=' + this.session.data['user_token'] + '&coupon_id=' + this.request.get['coupon_id'] + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (history_total) ? ((page - 1) * 10) + 1 : 0, (((page - 1) * 10) > (history_total - 10)) ? history_total : (((page - 1) * 10) + 10), history_total, Math.ceil(history_total / 10));

		this.response.setOutput(await this.load.view('marketing/coupon_history', data));
	}
}