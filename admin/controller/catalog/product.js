const strip_tags = require("locutus/php/strings/strip_tags");

module.exports = class ControllerCatalogProduct extends Controller {
	error = {};

	async index() {
const data = {};
		await this.load.language('catalog/product');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/product', this);

		await this.getList();
	}

	async add() {
		await this.load.language('catalog/product');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/product', this);

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_catalog_product.addProduct(this.request.post);

			this.session.data['success'] = this.language.get('text_success');
await this.session.save(this.session.data);

			let url = '';

			if ((this.request.get['filter_name'])) {
				url += '&filter_name=' + encodeURIComponent(html_entity_decode(this.request.get['filter_name']));
			}

			if ((this.request.get['filter_model'])) {
				url += '&filter_model=' + encodeURIComponent(html_entity_decode(this.request.get['filter_model']));
			}

			if ((this.request.get['filter_price'])) {
				url += '&filter_price=' + this.request.get['filter_price'];
			}

			if ((this.request.get['filter_quantity'])) {
				url += '&filter_quantity=' + this.request.get['filter_quantity'];
			}

			if ((this.request.get['filter_status'])) {
				url += '&filter_status=' + this.request.get['filter_status'];
			}

			if ((this.request.get['sort'])) {
				url += '&sort=' + this.request.get['sort'];
			}

			if ((this.request.get['order'])) {
				url += '&order=' + this.request.get['order'];
			}

			if ((this.request.get['page'])) {
				url += '&page=' + this.request.get['page'];
			}
			await this.session.save(this.session.data);
			this.response.setRedirect(await this.url.link('catalog/product', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async edit() {
		await this.load.language('catalog/product');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/product', this);

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_catalog_product.editProduct(this.request.get['product_id'], this.request.post);

			this.session.data['success'] = this.language.get('text_success');
await this.session.save(this.session.data);

			let url = '';

			if ((this.request.get['filter_name'])) {
				url += '&filter_name=' + encodeURIComponent(html_entity_decode(this.request.get['filter_name']));
			}

			if ((this.request.get['filter_model'])) {
				url += '&filter_model=' + encodeURIComponent(html_entity_decode(this.request.get['filter_model']));
			}

			if ((this.request.get['filter_price'])) {
				url += '&filter_price=' + this.request.get['filter_price'];
			}

			if ((this.request.get['filter_quantity'])) {
				url += '&filter_quantity=' + this.request.get['filter_quantity'];
			}

			if ((this.request.get['filter_status'])) {
				url += '&filter_status=' + this.request.get['filter_status'];
			}

			if ((this.request.get['sort'])) {
				url += '&sort=' + this.request.get['sort'];
			}

			if ((this.request.get['order'])) {
				url += '&order=' + this.request.get['order'];
			}

			if ((this.request.get['page'])) {
				url += '&page=' + this.request.get['page'];
			}
			await this.session.save(this.session.data);
			this.response.setRedirect(await this.url.link('catalog/product', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async delete() {
		await this.load.language('catalog/product');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/product', this);

		if ((this.request.post['selected']) && await this.validateDelete()) {
			this.request.post['selected'] = Array.isArray(this.request.post['selected']) ? this.request.post['selected'] : [this.request.post['selected']];
			for (let product_id of this.request.post['selected']) {
				await this.model_catalog_product.deleteProduct(product_id);
			}

			this.session.data['success'] = this.language.get('text_success');
await this.session.save(this.session.data);

			let url = '';

			if ((this.request.get['filter_name'])) {
				url += '&filter_name=' + encodeURIComponent(html_entity_decode(this.request.get['filter_name']));
			}

			if ((this.request.get['filter_model'])) {
				url += '&filter_model=' + encodeURIComponent(html_entity_decode(this.request.get['filter_model']));
			}

			if ((this.request.get['filter_price'])) {
				url += '&filter_price=' + this.request.get['filter_price'];
			}

			if ((this.request.get['filter_quantity'])) {
				url += '&filter_quantity=' + this.request.get['filter_quantity'];
			}

			if ((this.request.get['filter_status'])) {
				url += '&filter_status=' + this.request.get['filter_status'];
			}

			if ((this.request.get['sort'])) {
				url += '&sort=' + this.request.get['sort'];
			}

			if ((this.request.get['order'])) {
				url += '&order=' + this.request.get['order'];
			}

			if ((this.request.get['page'])) {
				url += '&page=' + this.request.get['page'];
			}
			await this.session.save(this.session.data);
			this.response.setRedirect(await this.url.link('catalog/product', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getList();
	}

	async copy() {
		await this.load.language('catalog/product');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/product', this);

		if ((this.request.post['selected']) && await this.validateCopy()) {
			this.request.post['selected'] = Array.isArray(this.request.post['selected']) ? this.request.post['selected'] : [this.request.post['selected']];
			// console.log(this.request.post)
			for (let product_id of this.request.post['selected']) {
				await this.model_catalog_product.copyProduct(product_id);
			}

			this.session.data['success'] = this.language.get('text_success');
await this.session.save(this.session.data);

			let url = '';

			if ((this.request.get['filter_name'])) {
				url += '&filter_name=' + encodeURIComponent(html_entity_decode(this.request.get['filter_name']));
			}

			if ((this.request.get['filter_model'])) {
				url += '&filter_model=' + encodeURIComponent(html_entity_decode(this.request.get['filter_model']));
			}

			if ((this.request.get['filter_price'])) {
				url += '&filter_price=' + this.request.get['filter_price'];
			}

			if ((this.request.get['filter_quantity'])) {
				url += '&filter_quantity=' + this.request.get['filter_quantity'];
			}

			if ((this.request.get['filter_status'])) {
				url += '&filter_status=' + this.request.get['filter_status'];
			}

			if ((this.request.get['sort'])) {
				url += '&sort=' + this.request.get['sort'];
			}

			if ((this.request.get['order'])) {
				url += '&order=' + this.request.get['order'];
			}

			if ((this.request.get['page'])) {
				url += '&page=' + this.request.get['page'];
			}
			await this.session.save(this.session.data);
			this.response.setRedirect(await this.url.link('catalog/product', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getList();
	}

	async getList() {
				const data = {};
		let filter_name = '';
		if ((this.request.get['filter_name'])) {
			filter_name = this.request.get['filter_name'];
		}
		let filter_model = '';
		if ((this.request.get['filter_model'])) {
			filter_model = this.request.get['filter_model'];
		}
		let filter_price = '';
		if ((this.request.get['filter_price'])) {
			filter_price = this.request.get['filter_price'];
		}
		let filter_quantity = '';
		if ((this.request.get['filter_quantity'])) {
			filter_quantity = this.request.get['filter_quantity'];
		}
		let filter_status = '';
		if ((this.request.get['filter_status'])) {
			filter_status = this.request.get['filter_status'];
		}
		let sort = 'pd.name';
		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		}
		let order = 'ASC';
		let order = 'ASC';
if ((this.request.get['order'])) {
			order = this.request.get['order'];
		} 
		let page = 1;page = 1;
if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		}

		let url = '';

		if ((this.request.get['filter_name'])) {
			url += '&filter_name=' + encodeURIComponent(html_entity_decode(this.request.get['filter_name']));
		}

		if ((this.request.get['filter_model'])) {
			url += '&filter_model=' + encodeURIComponent(html_entity_decode(this.request.get['filter_model']));
		}

		if ((this.request.get['filter_price'])) {
			url += '&filter_price=' + this.request.get['filter_price'];
		}

		if ((this.request.get['filter_quantity'])) {
			url += '&filter_quantity=' + this.request.get['filter_quantity'];
		}

		if ((this.request.get['filter_status'])) {
			url += '&filter_status=' + this.request.get['filter_status'];
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
			'href': await this.url.link('catalog/product', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		data['add'] = await this.url.link('catalog/product/add', 'user_token=' + this.session.data['user_token'] + url, true);
		data['copy'] = await this.url.link('catalog/product/copy', 'user_token=' + this.session.data['user_token'] + url, true);
		data['delete'] = await this.url.link('catalog/product/delete', 'user_token=' + this.session.data['user_token'] + url, true);

		data['products'] = [];

		let filter_data = {
			'filter_name': filter_name,
			'filter_model': filter_model,
			'filter_price': filter_price,
			'filter_quantity': filter_quantity,
			'filter_status': filter_status,
			'sort': sort,
			'order': order,
			'start': (page - 1) * Number(this.config.get('config_limit_admin')),
			'limit': Number(this.config.get('config_limit_admin'))
		};

		this.load.model('tool/image', this);

		const product_total = await this.model_catalog_product.getTotalProducts(filter_data);

		const results = await this.model_catalog_product.getProducts(filter_data);

		for (let result of results) {
			let image = await this.model_tool_image.resize('no_image.png', 40, 40);
			if (is_file(DIR_IMAGE + result['image'])) {
				image = await this.model_tool_image.resize(result['image'], 40, 40);
			}

			let special = false;

			const product_specials = await this.model_catalog_product.getProductSpecials(result['product_id']);

			for (let product_special of product_specials) {
				if ((product_special['date_start'] == '0000-00-00' || strtotime(product_special['date_start']) < time()) && (product_special['date_end'] == '0000-00-00' || strtotime(product_special['date_end']) > time())) {
					special = this.currency.format(product_special['price'], this.config.get('config_currency'));

					break;
				}
			}

			data['products'].push({
				'product_id': result['product_id'],
				'image': image,
				'name': result['name'],
				'model': result['model'],
				'price': this.currency.format(result['price'], this.config.get('config_currency')),
				'special': special,
				'quantity': result['quantity'],
				'status': result['status'] ? this.language.get('text_enabled') : this.language.get('text_disabled'),
				'edit': await this.url.link('catalog/product/edit', 'user_token=' + this.session.data['user_token'] + '&product_id=' + result['product_id'] + url, true)
			});
		}

		data['user_token'] = this.session.data['user_token'];

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

		if ((this.request.get['filter_name'])) {
			url += '&filter_name=' + encodeURIComponent(html_entity_decode(this.request.get['filter_name']));
		}

		if ((this.request.get['filter_model'])) {
			url += '&filter_model=' + encodeURIComponent(html_entity_decode(this.request.get['filter_model']));
		}

		if ((this.request.get['filter_price'])) {
			url += '&filter_price=' + this.request.get['filter_price'];
		}

		if ((this.request.get['filter_quantity'])) {
			url += '&filter_quantity=' + this.request.get['filter_quantity'];
		}

		if ((this.request.get['filter_status'])) {
			url += '&filter_status=' + this.request.get['filter_status'];
		}

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['sort_name'] = await this.url.link('catalog/product', 'user_token=' + this.session.data['user_token'] + '&sort=pd.name' + url, true);
		data['sort_model'] = await this.url.link('catalog/product', 'user_token=' + this.session.data['user_token'] + '&sort=p.model' + url, true);
		data['sort_price'] = await this.url.link('catalog/product', 'user_token=' + this.session.data['user_token'] + '&sort=p.price' + url, true);
		data['sort_quantity'] = await this.url.link('catalog/product', 'user_token=' + this.session.data['user_token'] + '&sort=p.quantity' + url, true);
		data['sort_status'] = await this.url.link('catalog/product', 'user_token=' + this.session.data['user_token'] + '&sort=p.status' + url, true);
		data['sort_order'] = await this.url.link('catalog/product', 'user_token=' + this.session.data['user_token'] + '&sort=p.sort_order' + url, true);

		url = '';

		if ((this.request.get['filter_name'])) {
			url += '&filter_name=' + encodeURIComponent(html_entity_decode(this.request.get['filter_name']));
		}

		if ((this.request.get['filter_model'])) {
			url += '&filter_model=' + encodeURIComponent(html_entity_decode(this.request.get['filter_model']));
		}

		if ((this.request.get['filter_price'])) {
			url += '&filter_price=' + this.request.get['filter_price'];
		}

		if ((this.request.get['filter_quantity'])) {
			url += '&filter_quantity=' + this.request.get['filter_quantity'];
		}

		if ((this.request.get['filter_status'])) {
			url += '&filter_status=' + this.request.get['filter_status'];
		}

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		const pagination = new Pagination();
		pagination.total = product_total;
		pagination.page = page;
		pagination.limit = Number(this.config.get('config_limit_admin'));
		pagination.url = await this.url.link('catalog/product', 'user_token=' + this.session.data['user_token'] + url + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (product_total) ? ((page - 1) * Number(this.config.get('config_limit_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_limit_admin'))) > (product_total - Number(this.config.get('config_limit_admin')))) ? product_total : (((page - 1) * Number(this.config.get('config_limit_admin'))) + Number(this.config.get('config_limit_admin'))), product_total, Math.ceil(product_total / Number(this.config.get('config_limit_admin'))));

		data['filter_name'] = filter_name;
		data['filter_model'] = filter_model;
		data['filter_price'] = filter_price;
		data['filter_quantity'] = filter_quantity;
		data['filter_status'] = filter_status;

		data['sort'] = sort;
		data['order'] = order;

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');
		await this.session.save(this.session.data);
		this.response.setOutput(await this.load.view('catalog/product_list', data));
	}

	async getForm() {
		const data = {};
		data['text_form'] = !(this.request.get['product_id']) ? this.language.get('text_add') : this.language.get('text_edit');

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.error['name'])) {
			data['error_name'] = this.error['name'];
		} else {
			data['error_name'] = {};
		}

		if ((this.error['meta_title'])) {
			data['error_meta_title'] = this.error['meta_title'];
		} else {
			data['error_meta_title'] = {};
		}

		if ((this.error['model'])) {
			data['error_model'] = this.error['model'];
		} else {
			data['error_model'] = '';
		}

		if ((this.error['keyword'])) {
			data['error_keyword'] = this.error['keyword'];
		} else {
			data['error_keyword'] = '';
		}

		let url = '';

		if ((this.request.get['filter_name'])) {
			url += '&filter_name=' + encodeURIComponent(html_entity_decode(this.request.get['filter_name']));
		}

		if ((this.request.get['filter_model'])) {
			url += '&filter_model=' + encodeURIComponent(html_entity_decode(this.request.get['filter_model']));
		}

		if ((this.request.get['filter_price'])) {
			url += '&filter_price=' + this.request.get['filter_price'];
		}

		if ((this.request.get['filter_quantity'])) {
			url += '&filter_quantity=' + this.request.get['filter_quantity'];
		}

		if ((this.request.get['filter_status'])) {
			url += '&filter_status=' + this.request.get['filter_status'];
		}

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
			'href': await this.url.link('catalog/product', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		if (!(this.request.get['product_id'])) {
			data['action'] = await this.url.link('catalog/product/add', 'user_token=' + this.session.data['user_token'] + url, true);
		} else {
			data['action'] = await this.url.link('catalog/product/edit', 'user_token=' + this.session.data['user_token'] + '&product_id=' + this.request.get['product_id'] + url, true);
		}

		data['cancel'] = await this.url.link('catalog/product', 'user_token=' + this.session.data['user_token'] + url, true);
		let product_info = {};
		if ((this.request.get['product_id']) && (this.request.server['method'] != 'POST')) {
			product_info = await this.model_catalog_product.getProduct(this.request.get['product_id']);
		}

		data['user_token'] = this.session.data['user_token'];

		this.load.model('localisation/language', this);

		data['languages'] = await this.model_localisation_language.getLanguages();

		if ((this.request.post['product_description'])) {
			data['product_description'] = this.request.post['product_description'];
		} else if ((this.request.get['product_id'])) {
			data['product_description'] = (await this.model_catalog_product.getProductDescriptions(this.request.get['product_id']));
		} else {
			data['product_description'] = {};
		}

		if ((this.request.post['model'])) {
			data['model'] = this.request.post['model'];
		} else if ((product_info)) {
			data['model'] = product_info['model'];
		} else {
			data['model'] = '';
		}

		if ((this.request.post['sku'])) {
			data['sku'] = this.request.post['sku'];
		} else if ((product_info)) {
			data['sku'] = product_info['sku'];
		} else {
			data['sku'] = '';
		}

		if ((this.request.post['upc'])) {
			data['upc'] = this.request.post['upc'];
		} else if ((product_info)) {
			data['upc'] = product_info['upc'];
		} else {
			data['upc'] = '';
		}

		if ((this.request.post['ean'])) {
			data['ean'] = this.request.post['ean'];
		} else if ((product_info)) {
			data['ean'] = product_info['ean'];
		} else {
			data['ean'] = '';
		}

		if ((this.request.post['jan'])) {
			data['jan'] = this.request.post['jan'];
		} else if ((product_info)) {
			data['jan'] = product_info['jan'];
		} else {
			data['jan'] = '';
		}

		if ((this.request.post['isbn'])) {
			data['isbn'] = this.request.post['isbn'];
		} else if ((product_info)) {
			data['isbn'] = product_info['isbn'];
		} else {
			data['isbn'] = '';
		}

		if ((this.request.post['mpn'])) {
			data['mpn'] = this.request.post['mpn'];
		} else if ((product_info)) {
			data['mpn'] = product_info['mpn'];
		} else {
			data['mpn'] = '';
		}

		if ((this.request.post['location'])) {
			data['location'] = this.request.post['location'];
		} else if ((product_info)) {
			data['location'] = product_info['location'];
		} else {
			data['location'] = '';
		}

		this.load.model('setting/store', this);

		data['stores'] = [];

		data['stores'].push({
			'store_id': 0,
			'name': this.language.get('text_default')
		});

		const stores = await this.model_setting_store.getStores();

		for (let store of stores) {
			data['stores'].push({
				'store_id': store['store_id'],
				'name': store['name']
			});
		}

		if ((this.request.post['product_store'])) {
			data['product_store'] = this.request.post['product_store'];
		} else if ((this.request.get['product_id'])) {
			data['product_store'] = await this.model_catalog_product.getProductStores(this.request.get['product_id']);
		} else {
			data['product_store'] = [0];
		}

		if ((this.request.post['shipping'])) {
			data['shipping'] = this.request.post['shipping'];
		} else if ((product_info)) {
			data['shipping'] = product_info['shipping'];
		} else {
			data['shipping'] = 1;
		}

		if ((this.request.post['price'])) {
			data['price'] = this.request.post['price'];
		} else if ((product_info)) {
			data['price'] = product_info['price'];
		} else {
			data['price'] = '';
		}

		this.load.model('catalog/recurring', this);

		data['recurrings'] = await this.model_catalog_recurring.getRecurrings();

		if ((this.request.post['product_recurrings'])) {
			data['product_recurrings'] = this.request.post['product_recurrings'];
		} else if ((product_info)) {
			data['product_recurrings'] = await this.model_catalog_product.getRecurrings(product_info['product_id']);
		} else {
			data['product_recurrings'] = {};
		}

		this.load.model('localisation/tax_class', this);

		data['tax_classes'] = await this.model_localisation_tax_class.getTaxClasses();

		if ((this.request.post['tax_class_id'])) {
			data['tax_class_id'] = this.request.post['tax_class_id'];
		} else if ((product_info)) {
			data['tax_class_id'] = product_info['tax_class_id'];
		} else {
			data['tax_class_id'] = 0;
		}

		if ((this.request.post['date_available'])) {
			data['date_available'] = this.request.post['date_available'];
		} else if ((product_info)) {
			data['date_available'] = (product_info['date_available'] != '0000-00-00') ? product_info['date_available'] : '';
		} else {
			data['date_available'] = date('Y-m-d');
		}

		if ((this.request.post['quantity'])) {
			data['quantity'] = this.request.post['quantity'];
		} else if ((product_info)) {
			data['quantity'] = product_info['quantity'];
		} else {
			data['quantity'] = 1;
		}

		if ((this.request.post['minimum'])) {
			data['minimum'] = this.request.post['minimum'];
		} else if ((product_info)) {
			data['minimum'] = product_info['minimum'];
		} else {
			data['minimum'] = 1;
		}

		if ((this.request.post['subtract'])) {
			data['subtract'] = this.request.post['subtract'];
		} else if ((product_info)) {
			data['subtract'] = product_info['subtract'];
		} else {
			data['subtract'] = 1;
		}

		if ((this.request.post['sort_order'])) {
			data['sort_order'] = this.request.post['sort_order'];
		} else if ((product_info)) {
			data['sort_order'] = product_info['sort_order'];
		} else {
			data['sort_order'] = 1;
		}

		this.load.model('localisation/stock_status', this);

		data['stock_statuses'] = await this.model_localisation_stock_status.getStockStatuses();

		if ((this.request.post['stock_status_id'])) {
			data['stock_status_id'] = this.request.post['stock_status_id'];
		} else if ((product_info)) {
			data['stock_status_id'] = product_info['stock_status_id'];
		} else {
			data['stock_status_id'] = 0;
		}

		if ((this.request.post['status'])) {
			data['status'] = this.request.post['status'];
		} else if ((product_info)) {
			data['status'] = product_info['status'];
		} else {
			data['status'] = true;
		}

		if ((this.request.post['weight'])) {
			data['weight'] = this.request.post['weight'];
		} else if ((product_info)) {
			data['weight'] = product_info['weight'];
		} else {
			data['weight'] = '';
		}

		this.load.model('localisation/weight_class', this);

		data['weight_classes'] = await this.model_localisation_weight_class.getWeightClasses();

		if ((this.request.post['weight_class_id'])) {
			data['weight_class_id'] = this.request.post['weight_class_id'];
		} else if ((product_info)) {
			data['weight_class_id'] = product_info['weight_class_id'];
		} else {
			data['weight_class_id'] = this.config.get('config_weight_class_id');
		}

		if ((this.request.post['length'])) {
			data['length'] = this.request.post['length'];
		} else if ((product_info)) {
			data['length'] = product_info['length'];
		} else {
			data['length'] = '';
		}

		if ((this.request.post['width'])) {
			data['width'] = this.request.post['width'];
		} else if ((product_info)) {
			data['width'] = product_info['width'];
		} else {
			data['width'] = '';
		}

		if ((this.request.post['height'])) {
			data['height'] = this.request.post['height'];
		} else if ((product_info)) {
			data['height'] = product_info['height'];
		} else {
			data['height'] = '';
		}

		this.load.model('localisation/length_class', this);

		data['length_classes'] = await this.model_localisation_length_class.getLengthClasses();

		if ((this.request.post['length_class_id'])) {
			data['length_class_id'] = this.request.post['length_class_id'];
		} else if ((product_info)) {
			data['length_class_id'] = product_info['length_class_id'];
		} else {
			data['length_class_id'] = this.config.get('config_length_class_id');
		}

		this.load.model('catalog/manufacturer', this);

		if ((this.request.post['manufacturer_id'])) {
			data['manufacturer_id'] = this.request.post['manufacturer_id'];
		} else if ((product_info)) {
			data['manufacturer_id'] = product_info['manufacturer_id'];
		} else {
			data['manufacturer_id'] = 0;
		}

		if ((this.request.post['manufacturer'])) {
			data['manufacturer'] = this.request.post['manufacturer'];
		} else if ((product_info.product_id)) {
			const manufacturer_info = await this.model_catalog_manufacturer.getManufacturer(product_info['manufacturer_id']);

			if (manufacturer_info.manufacturer_id) {
				data['manufacturer'] = manufacturer_info['name'];
			} else {
				data['manufacturer'] = '';
			}
		} else {
			data['manufacturer'] = '';
		}

		// Categories
		this.load.model('catalog/category', this);
		let categories = [];
		if ((this.request.post['product_category'])) {
			categories = this.request.post['product_category'];
		} else if ((this.request.get['product_id'])) {
			categories = await this.model_catalog_product.getProductCategories(this.request.get['product_id']);
		} else {
			categories = [];
		}

		data['product_categories'] = [];

		for (let category_id of categories) {
			const category_info = await this.model_catalog_category.getCategory(category_id);

			if (category_info.category_id) {
				data['product_categories'].push({
					'category_id': category_info['category_id'],
					'name': (category_info['path']) ? category_info['path'] + ' &gt; ' + category_info['name'] : category_info['name']
				});
			}
		}

		// Filters
		this.load.model('catalog/filter', this);
		let filters = [];
		if ((this.request.post['product_filter'])) {
			filters = this.request.post['product_filter'];
		} else if ((this.request.get['product_id'])) {
			filters = await this.model_catalog_product.getProductFilters(this.request.get['product_id']);
		} else {
			filters = [];
		}

		data['product_filters'] = [];

		for (let filter_id of filters) {
			const filter_info = await this.model_catalog_filter.getFilter(filter_id);

			if (filter_info.filter_id) {
				data['product_filters'].push({
					'filter_id': filter_info['filter_id'],
					'name': filter_info['group'] + ' &gt; ' + filter_info['name']
				});
			}
		}

		// Attributes
		this.load.model('catalog/attribute', this);
		let product_attributes = [];
		if ((this.request.post['product_attribute'])) {
			this.request.post['product_attribute'] = Object.values(this.request.post['product_attribute']);
			product_attributes = this.request.post['product_attribute'];
		} else if ((this.request.get['product_id'])) {
			product_attributes = await this.model_catalog_product.getProductAttributes(this.request.get['product_id']);
		} else {
			product_attributes = [];
		}
		data['product_attributes'] = [];

		for (let product_attribute of product_attributes) {
			const attribute_info = await this.model_catalog_attribute.getAttribute(product_attribute['attribute_id']);

			if (attribute_info.attribute_id) {
				data['product_attributes'].push({
					'attribute_id': product_attribute['attribute_id'],
					'name': attribute_info['name'],
					'product_attribute_description': product_attribute['product_attribute_description']
				});
			}
		}

		// Options
		this.load.model('catalog/option', this);
		let product_options = [];
		if ((this.request.post['product_option'])) {
			this.request.post['product_option'] = Object.values(this.request.post['product_option']);
			product_options = this.request.post['product_option'];
		} else if ((this.request.get['product_id'])) {
			product_options = await this.model_catalog_product.getProductOptions(this.request.get['product_id']);
		} else {
			product_options = [];
		}

		data['product_options'] = [];
		for (let product_option of product_options) {
			let product_option_value_data = [];

			if ((product_option['product_option_value'])) {
				product_option['product_option_value'] = Array.isArray(product_option['product_option_value']) ? product_option['product_option_value'] : Object.values(product_option['product_option_value']);
				for (let product_option_value of product_option['product_option_value']) {
					product_option_value_data.push({
						'product_option_value_id': product_option_value['product_option_value_id'],
						'option_value_id': product_option_value['option_value_id'],
						'quantity': product_option_value['quantity'],
						'subtract': product_option_value['subtract'],
						'price': product_option_value['price'],
						'price_prefix': product_option_value['price_prefix'],
						'points': product_option_value['points'],
						'points_prefix': product_option_value['points_prefix'],
						'weight': product_option_value['weight'],
						'weight_prefix': product_option_value['weight_prefix']
					});
				}
			}

			data['product_options'].push({
				'product_option_id': product_option['product_option_id'],
				'product_option_value': product_option_value_data,
				'option_id': product_option['option_id'],
				'name': product_option['name'],
				'type': product_option['type'],
				'value': (product_option['value']) ? product_option['value'] : '',
				'required': product_option['required']
			});
		}

		data['option_values'] = [];

		for (let product_option of data['product_options']) {
			if (product_option['type'] == 'select' || product_option['type'] == 'radio' || product_option['type'] == 'checkbox' || product_option['type'] == 'image') {
				if (!(data['option_values'][product_option['option_id']])) {
					data['option_values'][product_option['option_id']] = await this.model_catalog_option.getOptionValues(product_option['option_id']);
				}
			}
		}

		this.load.model('customer/customer_group', this);

		data['customer_groups'] = await this.model_customer_customer_group.getCustomerGroups();
		let product_discounts = [];
		if ((this.request.post['product_discount'])) {
			this.request.post['product_discount'] = Object.values(this.request.post['product_discount']);
			product_discounts = this.request.post['product_discount'];
		} else if ((this.request.get['product_id'])) {
			product_discounts = await this.model_catalog_product.getProductDiscounts(this.request.get['product_id']);
		} else {
			product_discounts = [];
		}

		data['product_discounts'] = [];

		for (let product_discount of product_discounts) {
			data['product_discounts'].push({
				'customer_group_id': product_discount['customer_group_id'],
				'quantity': product_discount['quantity'],
				'priority': product_discount['priority'],
				'price': product_discount['price'],
				'date_start': (product_discount['date_start'] != '0000-00-00') ? product_discount['date_start'] : '',
				'date_end': (product_discount['date_end'] != '0000-00-00') ? product_discount['date_end'] : ''
			});
		}
		let product_specials = [];
		if ((this.request.post['product_special'])) {
			this.request.post['product_special'] = Object.values(this.request.post['product_special']);
			product_specials = this.request.post['product_special'];
		} else if ((this.request.get['product_id'])) {
			product_specials = await this.model_catalog_product.getProductSpecials(this.request.get['product_id']);
		} else {
			product_specials = [];
		}

		data['product_specials'] = [];

		for (let product_special of product_specials) {
			data['product_specials'].push({
				'customer_group_id': product_special['customer_group_id'],
				'priority': product_special['priority'],
				'price': product_special['price'],
				'date_start': (product_special['date_start'] != '0000-00-00') ? product_special['date_start'] : '',
				'date_end': (product_special['date_end'] != '0000-00-00') ? product_special['date_end'] : ''
			});
		}

		// Image
		if ((this.request.post['image'])) {
			data['image'] = this.request.post['image'];
		} else if ((product_info)) {
			data['image'] = product_info['image'];
		} else {
			data['image'] = '';
		}

		this.load.model('tool/image', this);

		if ((this.request.post['image']) && is_file(DIR_IMAGE + this.request.post['image'])) {
			data['thumb'] = await this.model_tool_image.resize(this.request.post['image'], 100, 100);
		} else if ((product_info) && is_file(DIR_IMAGE + product_info['image'])) {
			data['thumb'] = await this.model_tool_image.resize(product_info['image'], 100, 100);
		} else {
			data['thumb'] = await this.model_tool_image.resize('no_image.png', 100, 100);
		}

		data['placeholder'] = await this.model_tool_image.resize('no_image.png', 100, 100);

		// Images
		let product_images = [];
		if ((this.request.post['product_image'])) {
			this.request.post['product_image'] = Object.values(this.request.post['product_image']);
			product_images = this.request.post['product_image'];
		} else if ((this.request.get['product_id'])) {
			product_images = await this.model_catalog_product.getProductImages(this.request.get['product_id']);
		} else {
			product_images = [];
		}

		data['product_images'] = [];

		for (let product_image of product_images) {
			let image = '';
			let thumb = 'no_image.png';
			if (is_file(DIR_IMAGE + product_image['image'])) {
				image = product_image['image'];
				thumb = product_image['image'];
			} else {
				image = '';
				thumb = 'no_image.png';
			}

			data['product_images'].push({
				'image': image,
				'thumb': await this.model_tool_image.resize(thumb, 100, 100),
				'sort_order': product_image['sort_order']
			});
		}

		// Downloads
		this.load.model('catalog/download', this);
		let product_downloads = [];
		if ((this.request.post['product_download'])) {
			this.request.post['product_download'] = Object.values(this.request.post['product_download']);
			product_downloads = this.request.post['product_download'];
		} else if ((this.request.get['product_id'])) {
			product_downloads = await this.model_catalog_product.getProductDownloads(this.request.get['product_id']);
		} else {
			product_downloads = [];
		}

		data['product_downloads'] = [];

		for (let download_id of product_downloads) {
			const download_info = await this.model_catalog_download.getDownload(download_id);

			if (download_info.download_id) {
				data['product_downloads'].push({
					'download_id': download_info['download_id'],
					'name': download_info['name']
				});
			}
		}
		let products = [];
		if ((this.request.post['product_related'])) {
			this.request.post['product_related'] = Object.values(this.request.post['product_related']);
			products = this.request.post['product_related'];
		} else if ((this.request.get['product_id'])) {
			products = await this.model_catalog_product.getProductRelated(this.request.get['product_id']);
		} else {
			products = [];
		}

		data['product_relateds'] = [];

		for (let product_id of products) {
			const related_info = await this.model_catalog_product.getProduct(product_id);

			if (related_info.product_id) {
				data['product_relateds'].push({
					'product_id': related_info['product_id'],
					'name': related_info['name']
				});
			}
		}

		if ((this.request.post['points'])) {
			data['points'] = this.request.post['points'];
		} else if ((product_info)) {
			data['points'] = product_info['points'];
		} else {
			data['points'] = '';
		}

		if ((this.request.post['product_reward'])) {
			data['product_reward'] = this.request.post['product_reward'];
		} else if ((this.request.get['product_id'])) {
			data['product_reward'] = await this.model_catalog_product.getProductRewards(this.request.get['product_id']);
		} else {
			data['product_reward'] = {};
		}

		if ((this.request.post['product_seo_url'])) {
			data['product_seo_url'] = this.request.post['product_seo_url'];
		} else if ((this.request.get['product_id'])) {
			data['product_seo_url'] = await this.model_catalog_product.getProductSeoUrls(this.request.get['product_id']);
		} else {
			data['product_seo_url'] = {};
		}

		if ((this.request.post['product_layout'])) {
			data['product_layout'] = this.request.post['product_layout'];
		} else if ((this.request.get['product_id'])) {
			data['product_layout'] = await this.model_catalog_product.getProductLayouts(this.request.get['product_id']);
		} else {
			data['product_layout'] = {};
		}

		this.load.model('design/layout', this);

		data['layouts'] = await this.model_design_layout.getLayouts();

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('catalog/product_form', data));
	}

	async validateForm() {
		if (!await this.user.hasPermission('modify', 'catalog/product')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		for (let [language_id, value] of Object.entries(this.request.post['product_description'])) {
			if ((oc_strlen(value['name']) < 1) || (oc_strlen(value['name']) > 255)) {
				this.error['name'] = this.error['name'] || {}
				this.error['name'][language_id] = this.language.get('error_name');
			}

			if ((oc_strlen(value['meta_title']) < 1) || (oc_strlen(value['meta_title']) > 255)) {
				this.error['meta_title'] = this.error['meta_title'] || {};
				this.error['meta_title'][language_id] = this.language.get('error_meta_title');
			}
		}

		if ((oc_strlen(this.request.post['model']) < 1) || (oc_strlen(this.request.post['model']) > 64)) {
			this.error['model'] = this.language.get('error_model');
		}

		if (this.request.post['product_seo_url']) {
			this.load.model('design/seo_url', this);

			for (let [store_id, language] of Object.entries(this.request.post['product_seo_url'])) {
				for (let [language_id, keyword] of Object.entries(language)) {
					if ((keyword)) {
						if (Object.keys(language).filter(key => language[key] === keyword).length > 1) {
							this.error.keyword = this.error.keyword || {};
							this.error.keyword[store_id] = this.error.keyword[store_id] || {};
							this.error['keyword'][store_id][language_id] = this.language.get('error_unique');
						}

						const seo_urls = await this.model_design_seo_url.getSeoUrlsByKeyword(keyword);

						for (let seo_url of seo_urls) {
							if ((seo_url['store_id'] == store_id) && (!(this.request.get['product_id']) || ((seo_url['query'] != 'product_id=' + this.request.get['product_id'])))) {
								this.error['keyword'] = this.error['keyword'] || {};
								this.error['keyword'][store_id] = this.error['keyword'][store_id] || {};
								this.error['keyword'][store_id][language_id] = this.language.get('error_keyword');

								break;
							}
						}
					}
				}
			}
		}

		if (Object.keys(this.error).length && !(this.error['warning'])) {
			this.error['warning'] = this.language.get('error_warning');
		}

		return Object.keys(this.error).length ? false : true
	}

	async validateDelete() {
		if (!await this.user.hasPermission('modify', 'catalog/product')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length ? false : true
	}

	async validateCopy() {
		if (!await this.user.hasPermission('modify', 'catalog/product')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length ? false : true
	}

	async autocomplete() {
		let json = [];

		if ((this.request.get['filter_name']) || (this.request.get['filter_model'])) {
			this.load.model('catalog/product', this);
			this.load.model('catalog/option', this);
			let filter_name = '';
			if ((this.request.get['filter_name'])) {
				filter_name = this.request.get['filter_name'];
			} else {
				filter_name = '';
			}
			let filter_model = '';
			if ((this.request.get['filter_model'])) {
				filter_model = this.request.get['filter_model'];
			} else {
				filter_model = '';
			}
			let limit = 5;
			if ((this.request.get['limit'])) {
				limit = this.request.get['limit'];
			} else {
				limit = 5;
			}

			let filter_data = {
				'filter_name': filter_name,
				'filter_model': filter_model,
				'start': 0,
				'limit': limit
			};

			const results = await this.model_catalog_product.getProducts(filter_data);

			for (let result of results) {
				let option_data = [];

				const product_options = await this.model_catalog_product.getProductOptions(result['product_id']);

				for (let product_option of product_options) {
					const option_info = await this.model_catalog_option.getOption(product_option['option_id']);

					if (option_info.option_id) {
						let product_option_value_data = [];

						for (let product_option_value of product_option['product_option_value']) {
							const option_value_info = await this.model_catalog_option.getOptionValue(product_option_value['option_value_id']);

							if (option_value_info.option_value_id) {
								product_option_value_data.push({
									'product_option_value_id': product_option_value['product_option_value_id'],
									'option_value_id': product_option_value['option_value_id'],
									'name': option_value_info['name'],
									'price': product_option_value['price'] ? this.currency.format(product_option_value['price'], this.config.get('config_currency')) : false,
									'price_prefix': product_option_value['price_prefix']
								});
							}
						}

						option_data.push({
							'product_option_id': product_option['product_option_id'],
							'product_option_value': product_option_value_data,
							'option_id': product_option['option_id'],
							'name': option_info['name'],
							'type': option_info['type'],
							'value': product_option['value'],
							'required': product_option['required']
						});
					}
				}

				json.push({
					'product_id': result['product_id'],
					'name': strip_tags(html_entity_decode(result['name'])),
					'model': result['model'],
					'option': option_data,
					'price': result['price']
				});
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
