module.exports = class ProductController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		await this.load.language('catalog/product');

		this.document.setTitle(this.language.get('heading_title'));

		if ((this.request.get['filter_name'])) {
			filter_name = this.request.get['filter_name'];
		} else {
			filter_name = '';
		}

		if ((this.request.get['filter_model'])) {
			filter_model = this.request.get['filter_model'];
		} else {
			filter_model = '';
		}

		if ((this.request.get['filter_price'])) {
			filter_price = this.request.get['filter_price'];
		} else {
			filter_price = '';
		}

		if ((this.request.get['filter_quantity'])) {
			filter_quantity = this.request.get['filter_quantity'];
		} else {
			filter_quantity = '';
		}

		if ((this.request.get['filter_status'])) {
			filter_status = this.request.get['filter_status'];
		} else {
			filter_status = '';
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
			'text' : this.language.get('text_home'),
			'href' : this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : this.url.link('catalog/product', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['add'] = this.url.link('catalog/product.form', 'user_token=' + this.session.data['user_token'] + url);
		data['copy'] = this.url.link('catalog/product.copy', 'user_token=' + this.session.data['user_token']);
		data['delete'] = this.url.link('catalog/product.delete', 'user_token=' + this.session.data['user_token']);

		data['list'] = this.getList();

		data['filter_name'] = filter_name;
		data['filter_model'] = filter_model;
		data['filter_price'] = filter_price;
		data['filter_quantity'] = filter_quantity;
		data['filter_status'] = filter_status;

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('catalog/product', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('catalog/product');

		this.response.setOutput(this.getList());
	}

	/**
	 * @return string
	 */
	async getList() {
		if ((this.request.get['filter_name'])) {
			filter_name = this.request.get['filter_name'];
		} else {
			filter_name = '';
		}

		if ((this.request.get['filter_model'])) {
			filter_model = this.request.get['filter_model'];
		} else {
			filter_model = '';
		}

		if ((this.request.get['filter_price'])) {
			filter_price = this.request.get['filter_price'];
		} else {
			filter_price = '';
		}

		if ((this.request.get['filter_quantity'])) {
			filter_quantity = this.request.get['filter_quantity'];
		} else {
			filter_quantity = '';
		}

		if ((this.request.get['filter_status'])) {
			filter_status = this.request.get['filter_status'];
		} else {
			filter_status = '';
		}

		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		} else {
			sort = 'pd.name';
		}

		if ((this.request.get['order'])) {
			order = this.request.get['order'];
		} else {
			order = 'ASC';
		}

		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		} else {
			page = 1;
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

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['action'] = this.url.link('catalog/product.list', 'user_token=' + this.session.data['user_token'] + url);

		data['products'] = [];

		let filter_data = {
			'filter_name'     : filter_name,
			'filter_model'    : filter_model,
			'filter_price'    : filter_price,
			'filter_quantity' : filter_quantity,
			'filter_status'   : filter_status,
			'sort'            : sort,
			'order'           : order,
			'start'           : (page - 1) * this.config.get('config_pagination_admin'),
			'limit'           : this.config.get('config_pagination_admin')
		});

		this.load.model('catalog/product');

		this.load.model('tool/image',this);

		product_total await this.model_catalog_product.getTotalProducts(filter_data);

		const results = await this.model_catalog_product.getProducts(filter_data);

		for (let result of results) {
			if (is_file(DIR_IMAGE + html_entity_decode(result['image']))) {
				image await this.model_tool_image.resize(html_entity_decode(result['image']), 40, 40);
			} else {
				image await this.model_tool_image.resize('no_image.png', 40, 40);
			}

			special = false;

			product_specials await this.model_catalog_product.getSpecials(result['product_id']);

			for (product_specials of product_special) {
				if ((product_special['date_start'] == '0000-00-00' || strtotime(product_special['date_start']) < time()) && (product_special['date_end'] == '0000-00-00' || strtotime(product_special['date_end']) > time())) {
					special = this.currency.format(product_special['price'], this.config.get('config_currency'));

					break;
				}
			}

			data['products'].push({
				'product_id' : result['product_id'],
				'image'      : image,
				'name'       : result['name'],
				'model'      : result['model'],
				'price'      : this.currency.format(result['price'], this.config.get('config_currency')),
				'special'    : special,
				'quantity'   : result['quantity'],
				'status'     : result['status'],
				'edit'       : this.url.link('catalog/product.form', 'user_token=' + this.session.data['user_token'] + '&product_id=' + result['product_id'] + (result['master_id'] ? '&master_id=' + result['master_id'] : '') + url),
				'variant'    : (!result['master_id'] ? this.url.link('catalog/product.form', 'user_token=' + this.session.data['user_token'] + '&master_id=' + result['product_id'] + url) : '')
			];
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

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		data['sort_name'] = this.url.link('catalog/product.list', 'user_token=' + this.session.data['user_token'] + '&sort=pd.name' + url);
		data['sort_model'] = this.url.link('catalog/product.list', 'user_token=' + this.session.data['user_token'] + '&sort=p.model' + url);
		data['sort_price'] = this.url.link('catalog/product.list', 'user_token=' + this.session.data['user_token'] + '&sort=p.price' + url);
		data['sort_quantity'] = this.url.link('catalog/product.list', 'user_token=' + this.session.data['user_token'] + '&sort=p.quantity' + url);
		data['sort_order'] = this.url.link('catalog/product.list', 'user_token=' + this.session.data['user_token'] + '&sort=p.sort_order' + url);

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

		data['pagination'] = await this.load.controller('common/pagination', {
			'total' : product_total,
			'page'  : page,
			'limit' : this.config.get('config_pagination_admin'),
			'url'   : this.url.link('catalog/product.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		]);

		data['results'] = sprintf(this.language.get('text_pagination'), (product_total) ? ((page - 1) * this.config.get('config_pagination_admin')) + 1 : 0, (((page - 1) * this.config.get('config_pagination_admin')) > (product_total - this.config.get('config_pagination_admin'))) ? product_total : (((page - 1) * this.config.get('config_pagination_admin')) + this.config.get('config_pagination_admin')), product_total, Math.ceil(product_total / this.config.get('config_pagination_admin')));

		data['sort'] = sort;
		data['order'] = order;

		return await this.load.view('catalog/product_list', data);
	}

	/**
	 * @return void
	 */
	async form() {
		await this.load.language('catalog/product');

		this.document.setTitle(this.language.get('heading_title'));

		

		data['text_form'] = !(this.request.get['product_id']) ? this.language.get('text_add') : this.language.get('text_edit');

		data['error_upload_size'] = sprintf(this.language.get('error_upload_size'), this.config.get('config_file_max_size'));

		data['upload'] = this.url.link('tool/upload', 'user_token=' + this.session.data['user_token']);
		data['config_file_max_size'] = (this.config.get('config_file_max_size') * 1024 * 1024);

		if ((this.request.get['master_id'])) {
			this.load.model('catalog/product');

			url = this.url.link('catalog/product.form', 'user_token=' + this.session.data['user_token'] + '&product_id=' + this.request.get['master_id']);

			data['text_variant'] = sprintf(this.language.get('text_variant'), url, url);
		} else {
			data['text_variant'] = '';
		}

		let url = '';

		if ((this.request.get['master_id'])) {
			url += '&master_id=' + this.request.get['master_id'];
		}

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
			'text' : this.language.get('text_home'),
			'href' : this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : this.url.link('catalog/product', 'user_token=' + this.session.data['user_token'] + url)
		});

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

		data['save'] = this.url.link('catalog/product.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = this.url.link('catalog/product', 'user_token=' + this.session.data['user_token'] + url);
		data['upload'] = this.url.link('tool/upload.upload', 'user_token=' + this.session.data['user_token']);

		if ((this.request.get['product_id'])) {
			data['product_id'] = this.request.get['product_id'];
		} else {
			data['product_id'] = 0;
		}

		// If the product_id is the master_id, we need to get the variant info
		if ((this.request.get['product_id'])) {
			product_id = this.request.get['product_id'];
		} elseif ((this.request.get['master_id'])) {
			product_id = this.request.get['master_id'];
		} else {
			product_id = 0;
		}

		if (product_id) {
			this.load.model('catalog/product');

			product_info await this.model_catalog_product.getProduct(product_id);
		}

		if ((this.request.get['master_id'])) {
			data['master_id'] = this.request.get['master_id'];
		} elseif ((product_info)) {
			data['master_id'] = product_info['master_id'];
		} else {
			data['master_id'] = 0;
		}

		this.load.model('localisation/language',this);

		data['languages'] = await this.model_localisation_language.getLanguages();

		if ((product_info)) {
			data['product_description'] = await this.model_catalog_product.getDescriptions(product_id);
		} else {
			data['product_description'] = [];
		}

		if ((product_info)) {
			data['model'] = product_info['model'];
		} else {
			data['model'] = '';
		}

		if ((product_info)) {
			data['sku'] = product_info['sku'];
		} else {
			data['sku'] = '';
		}

		if ((product_info)) {
			data['upc'] = product_info['upc'];
		} else {
			data['upc'] = '';
		}

		if ((product_info)) {
			data['ean'] = product_info['ean'];
		} else {
			data['ean'] = '';
		}

		if ((product_info)) {
			data['jan'] = product_info['jan'];
		} else {
			data['jan'] = '';
		}

		if ((product_info)) {
			data['isbn'] = product_info['isbn'];
		} else {
			data['isbn'] = '';
		}

		if ((product_info)) {
			data['mpn'] = product_info['mpn'];
		} else {
			data['mpn'] = '';
		}

		if ((product_info)) {
			data['location'] = product_info['location'];
		} else {
			data['location'] = '';
		}

		if ((product_info)) {
			data['price'] = product_info['price'];
		} else {
			data['price'] = '';
		}

		this.load.model('localisation/tax_class');

		data['tax_classes'] = await this.model_localisation_tax_class.getTaxClasses();

		if ((product_info)) {
			data['tax_class_id'] = product_info['tax_class_id'];
		} else {
			data['tax_class_id'] = 0;
		}

		if ((product_info)) {
			data['quantity'] = product_info['quantity'];
		} else {
			data['quantity'] = 1;
		}

		if ((product_info)) {
			data['minimum'] = product_info['minimum'];
		} else {
			data['minimum'] = 1;
		}

		if ((product_info)) {
			data['subtract'] = product_info['subtract'];
		} else {
			data['subtract'] = 1;
		}

		this.load.model('localisation/stock_status');

		data['stock_statuses'] = await this.model_localisation_stock_status.getStockStatuses();

		if ((product_info)) {
			data['stock_status_id'] = product_info['stock_status_id'];
		} else {
			data['stock_status_id'] = 0;
		}

		if ((product_info)) {
			data['date_available'] = (product_info['date_available'] != '0000-00-00') ? product_info['date_available'] : '';
		} else {
			data['date_available'] = date('Y-m-d');
		}

		if ((product_info)) {
			data['shipping'] = product_info['shipping'];
		} else {
			data['shipping'] = 1;
		}

		if ((product_info)) {
			data['length'] = product_info['length'];
		} else {
			data['length'] = '';
		}

		if ((product_info)) {
			data['width'] = product_info['width'];
		} else {
			data['width'] = '';
		}

		if ((product_info)) {
			data['height'] = product_info['height'];
		} else {
			data['height'] = '';
		}

		this.load.model('localisation/length_class');

		data['length_classes'] = await this.model_localisation_length_class.getLengthClasses();

		if ((product_info)) {
			data['length_class_id'] = product_info['length_class_id'];
		} else {
			data['length_class_id'] = this.config.get('config_length_class_id');
		}

		if ((product_info)) {
			data['weight'] = product_info['weight'];
		} else {
			data['weight'] = '';
		}

		this.load.model('localisation/weight_class');

		data['weight_classes'] = await this.model_localisation_weight_class.getWeightClasses();

		if ((product_info)) {
			data['weight_class_id'] = product_info['weight_class_id'];
		} else {
			data['weight_class_id'] = this.config.get('config_weight_class_id');
		}

		if ((product_info)) {
			data['status'] = product_info['status'];
		} else {
			data['status'] = true;
		}

		if ((product_info)) {
			data['sort_order'] = product_info['sort_order'];
		} else {
			data['sort_order'] = 1;
		}

		this.load.model('catalog/manufacturer');

		if ((product_info)) {
			data['manufacturer_id'] = product_info['manufacturer_id'];
		} else {
			data['manufacturer_id'] = 0;
		}

		if ((product_info)) {
			manufacturer_info await this.model_catalog_manufacturer.getManufacturer(product_info['manufacturer_id']);

			if (manufacturer_info) {
				data['manufacturer'] = manufacturer_info['name'];
			} else {
				data['manufacturer'] = '';
			}
		} else {
			data['manufacturer'] = '';
		}

		// Categories
		this.load.model('catalog/category',this);

		if (product_id) {
			categories await this.model_catalog_product.getCategories(product_id);
		} else {
			categories = [];
		}

		data['product_categories'] = [];

		for (categories of category_id) {
			let category_info = await this.model_catalog_category.getCategory(category_id);

			if (category_info) {
				data['product_categories'].push({
					'category_id' : category_info['category_id'],
					'name'        : (category_info['path']) ? category_info['path'] + ' &gt; ' + category_info['name'] : category_info['name']
				];
			}
		}

		// Filters
		this.load.model('catalog/filter',this);

		if ((product_info)) {
			filters = await this.model_catalog_product.getFilters(product_id);
		} else {
			filters = [];
		}

		data['product_filters'] = [];

		for (let filter_id of filters) {
			let filter_info = await this.model_catalog_filter.getFilter(filter_id);

			if (filter_info) {
				data['product_filters'].push({
					'filter_id' : filter_info['filter_id'],
					'name'      : filter_info['group'] + ' &gt; ' + filter_info['name']
				];
			}
		}

		// Stores
		data['stores'] = [];

		data['stores'].push({
			'store_id' : 0,
			'name'     : this.language.get('text_default')
		});

		this.load.model('setting/store');

		let stores = await this.model_setting_store.getStores();

		for (let store of stores) {
			data['stores'].push({
				'store_id' : store['store_id'],
				'name'     : store['name']
			];
		}

		if (product_id) {
			data['product_store'] = await this.model_catalog_product.getStores(product_id);
		} else {
			data['product_store'] = [0];
		}

		// Downloads
		this.load.model('catalog/download');

		if (product_id) {
			product_downloads await this.model_catalog_product.getDownloads(product_id);
		} else {
			product_downloads = [];
		}

		data['product_downloads'] = [];

		for (product_downloads of download_id) {
			download_info await this.model_catalog_download.getDownload(download_id);

			if (download_info) {
				data['product_downloads'].push({
					'download_id' : download_info['download_id'],
					'name'        : download_info['name']
				];
			}
		}

		// Related
		if (product_id) {
			product_relateds await this.model_catalog_product.getRelated(product_id);
		} else {
			product_relateds = [];
		}

		data['product_relateds'] = [];

		for (product_relateds of related_id) {
			related_info await this.model_catalog_product.getProduct(related_id);

			if (related_info) {
				data['product_relateds'].push({
					'product_id' : related_info['product_id'],
					'name'       : related_info['name']
				];
			}
		}

		// Attributes
		this.load.model('catalog/attribute');

		if (product_id) {
			product_attributes await this.model_catalog_product.getAttributes(product_id);
		} else {
			product_attributes = [];
		}

		data['product_attributes'] = [];

		for (product_attributes of product_attribute) {
			attribute_info await this.model_catalog_attribute.getAttribute(product_attribute['attribute_id']);

			if (attribute_info) {
				data['product_attributes'].push({
					'attribute_id'                  : product_attribute['attribute_id'],
					'name'                          : attribute_info['name'],
					'product_attribute_description' : product_attribute['product_attribute_description']
				];
			}
		}

		this.load.model('customer/customer_group');

		data['customer_groups'] = await this.model_customer_customer_group.getCustomerGroups();

		// Options
		this.load.model('catalog/option');

		if (product_id) {
			product_options await this.model_catalog_product.getOptions(product_id);
		} else {
			product_options = [];
		}

		data['product_options'] = [];

		for (product_options of product_option) {
			product_option_value_data = [];

			if ((product_option['product_option_value'])) {
				for (product_option['product_option_value'] of product_option_value) {
					option_value_info await this.model_catalog_option.getValue(product_option_value['option_value_id']);

					if (option_value_info) {
						product_option_value_data.push({
							'product_option_value_id' : product_option_value['product_option_value_id'],
							'option_value_id'         : product_option_value['option_value_id'],
							'name'                    : option_value_info['name'],
							'quantity'                : product_option_value['quantity'],
							'subtract'                : product_option_value['subtract'],
							'price'                   : product_option_value['price'],
							'price_prefix'            : product_option_value['price_prefix'],
							'points'                  : round(product_option_value['points']),
							'points_prefix'           : product_option_value['points_prefix'],
							'weight'                  : round(product_option_value['weight']),
							'weight_prefix'           : product_option_value['weight_prefix']
						];
					}
				}
			}

			data['product_options'].push({
				'product_option_id'    : product_option['product_option_id'],
				'product_option_value' : product_option_value_data,
				'option_id'            : product_option['option_id'],
				'name'                 : product_option['name'],
				'type'                 : product_option['type'],
				'value'                : (product_option['value']) ? product_option['value'] : '',
				'required'             : product_option['required']
			];
		}

		data['option_values'] = [];

		for (data['product_options'] of product_option) {
			if (product_option['type'] == 'select' || product_option['type'] == 'radio' || product_option['type'] == 'checkbox' || product_option['type'] == 'image') {
				if (!(data['option_values'][product_option['option_id']])) {
					data['option_values'][product_option['option_id']] = await this.model_catalog_option.getValues(product_option['option_id']);
				}
			}
		}

		// Variants
		if ((product_info)) {
			data['variant'] = json_decode(product_info['variant'], true);
		} else {
			data['variant'] = [];
		}

		// Overrides
		if ((product_info)) {
			data['override'] = json_decode(product_info['override'], true);
		} else {
			data['override'] = [];
		}

		data['options'] = [];

		if ((this.request.get['master_id'])) {
			product_options await this.model_catalog_product.getOptions(this.request.get['master_id']);

			for (product_options of product_option) {
				product_option_value_data = [];

				for (product_option['product_option_value'] of product_option_value) {
					option_value_info await this.model_catalog_option.getValue(product_option_value['option_value_id']);

					if (option_value_info) {
						product_option_value_data.push({
							'product_option_value_id' : product_option_value['product_option_value_id'],
							'option_value_id'         : product_option_value['option_value_id'],
							'name'                    : option_value_info['name'],
							'price'                   : (float)product_option_value['price'] ? product_option_value['price'] : false,
							'price_prefix'            : product_option_value['price_prefix']
						];
					}
				}

				option_info await this.model_catalog_option.getOption(product_option['option_id']);

				data['options'].push({
					'product_option_id'    : product_option['product_option_id'],
					'product_option_value' : product_option_value_data,
					'option_id'            : product_option['option_id'],
					'name'                 : option_info['name'],
					'type'                 : option_info['type'],
					'value'                : (data['variant'][product_option['product_option_id']]) ? data['variant'][product_option['product_option_id']] : product_option['value'],
					'required'             : product_option['required']
				];
			}
		}

		// Subscriptions
		this.load.model('catalog/subscription_plan');

		data['subscription_plans'] = await this.model_catalog_subscription_plan.getSubscriptionPlans();

		if (product_id) {
			data['product_subscriptions'] = await this.model_catalog_product.getSubscriptions(product_id);
		} else {
			data['product_subscriptions'] = [];
		}

		// Discount
		if (product_id) {
			product_discounts await this.model_catalog_product.getDiscounts(product_id);
		} else {
			product_discounts = [];
		}

		data['product_discounts'] = [];

		for (product_discounts of product_discount) {
			data['product_discounts'].push({
				'customer_group_id' : product_discount['customer_group_id'],
				'quantity'          : product_discount['quantity'],
				'priority'          : product_discount['priority'],
				'price'             : product_discount['price'],
				'date_start'        : (product_discount['date_start'] != '0000-00-00') ? product_discount['date_start'] : '',
				'date_end'          : (product_discount['date_end'] != '0000-00-00') ? product_discount['date_end'] : ''
			];
		}

		// Special
		if (product_id) {
			product_specials await this.model_catalog_product.getSpecials(product_id);
		} else {
			product_specials = [];
		}

		data['product_specials'] = [];

		for (product_specials of product_special) {
			data['product_specials'].push({
				'customer_group_id' : product_special['customer_group_id'],
				'priority'          : product_special['priority'],
				'price'             : product_special['price'],
				'date_start'        : (product_special['date_start'] != '0000-00-00') ? product_special['date_start'] : '',
				'date_end'          : (product_special['date_end'] != '0000-00-00') ? product_special['date_end'] : ''
			];
		}

		// Image
		if ((product_info)) {
			data['image'] = product_info['image'];
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

		// Images
		if (product_id) {
			product_images await this.model_catalog_product.getImages(product_id);
		} else {
			product_images = [];
		}

		data['product_images'] = [];

		for (product_images of product_image) {
			if (is_file(DIR_IMAGE + html_entity_decode(product_image['image']))) {
				image = product_image['image'];
				thumb = product_image['image'];
			} else {
				image = '';
				thumb = 'no_image.png';
			}

			data['product_images'].push({
				'image'      : image,
				'thumb'      : this.model_tool_image.resize(html_entity_decode(thumb), 100, 100),
				'sort_order' : product_image['sort_order']
			];
		}

		// Points
		if ((product_info)) {
			data['points'] = product_info['points'];
		} else {
			data['points'] = '';
		}

		// Rewards
		if (product_id) {
			data['product_reward'] = await this.model_catalog_product.getRewards(product_id);
		} else {
			data['product_reward'] = [];
		}

		// SEO
		if (product_id) {
			data['product_seo_url'] = await this.model_catalog_product.getSeoUrls(product_id);
		} else {
			data['product_seo_url'] = [];
		}

		// Layouts
		this.load.model('design/layout',this);

		data['layouts'] = await this.model_design_layout.getLayouts();

		if (product_id) {
			data['product_layout'] = await this.model_catalog_product.getLayouts(product_id);
		} else {
			data['product_layout'] = [];
		}

		data['report'] = this.getReport();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('catalog/product_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('catalog/product');

		const json = {};

		if (!await this.user.hasPermission('modify', 'catalog/product')) {
			json['error']['warning'] = this.language.get('error_permission');
		}

		for (let [language_id , value] of this.request.post['product_description']) {
			if ((oc_strlen(trim(value['name'])) < 1) || (oc_strlen(value['name']) > 255)) {
				json['error']['name_' + language_id] = this.language.get('error_name');
			}

			if ((oc_strlen(trim(value['meta_title'])) < 1) || (oc_strlen(value['meta_title']) > 255)) {
				json['error']['meta_title_' + language_id] = this.language.get('error_meta_title');
			}
		}

		if ((oc_strlen(this.request.post['model']) < 1) || (oc_strlen(this.request.post['model']) > 64)) {
			json['error']['model'] = this.language.get('error_model');
		}

		this.load.model('catalog/product');

		if (this.request.post['master_id']) {
			product_options await this.model_catalog_product.getOptions(this.request.post['master_id']);

			for (product_options of product_option) {
				if ((this.request.post['override']['variant'][product_option['product_option_id']]) && product_option['required'] && !(this.request.post['variant'][product_option['product_option_id']])) {
					json['error']['option_' + product_option['product_option_id']] = sprintf(this.language.get('error_required'), product_option['name']);
				}
			}
		}

		if (this.request.post['product_seo_url']) {
			this.load.model('design/seo_url',this);

			for (let [store_id , language] of this.request.post['product_seo_url']) {
				for (let [language_id , keyword] of language ) {
					if ((oc_strlen(trim(keyword)) < 1) || (oc_strlen(keyword) > 64)) {
						json['error']['keyword_' + store_id + '_' + language_id] = this.language.get('error_keyword');
					}

					if (preg_match('/[^a-zA-Z0-9\/_-]|[\p{Cyrillic}]+/u', keyword)) {
						json['error']['keyword_' + store_id + '_' + language_id] = this.language.get('error_keyword_character');
					}

					let seo_url_info =  await this.model_design_seo_url.getSeoUrlByKeyword(keyword, store_id);

					if (seo_url_info && (seo_url_info['key'] != 'product_id' || !(this.request.post['product_id']) || seo_url_info['value'] != this.request.post['product_id'])) {
						json['error']['keyword_' + store_id + '_' + language_id] = this.language.get('error_keyword_exists');
					}
				}
			}
		}

		if (Object.keys(json['error']).length && !(json['error']['warning'])) {
			json['error']['warning'] = this.language.get('error_warning');
		}

		if (!Object.keys(json).length) {
			if (!this.request.post['product_id']) {
				if (!this.request.post['master_id']) {
					// Normal product add
					json['product_id'] = await this.model_catalog_product.addProduct(this.request.post);
				} else {
					// Variant product add
					json['product_id'] = await this.model_catalog_product.addVariant(this.request.post['master_id'], this.request.post);
				}
			} else {
				if (!this.request.post['master_id']) {
					// Normal product edit
					await this.model_catalog_product.editProduct(this.request.post['product_id'], this.request.post);
				} else {
					// Variant product edit
					await this.model_catalog_product.editVariant(this.request.post['master_id'], this.request.post['product_id'], this.request.post);
				}

				// Variant products edit if master product is edited
				await this.model_catalog_product.editVariants(this.request.post['product_id'], this.request.post);
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
		await this.load.language('catalog/product');

		const json = {};

		if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		} else {
			selected = [];
		}

		if (!await this.user.hasPermission('modify', 'catalog/product')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('catalog/product');

			for (selected of product_id) {
				await this.model_catalog_product.deleteProduct(product_id);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async copy() {
		await this.load.language('catalog/product');

		const json = {};

		if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		} else {
			selected = [];
		}

		if (!await this.user.hasPermission('modify', 'catalog/product')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('catalog/product');

			for (selected of product_id) {
				await this.model_catalog_product.copyProduct(product_id);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async report() {
		await this.load.language('catalog/product');

		this.response.setOutput(this.getReport());
	}

	/**
	 * @return string
	 */
	async getReport() {
		if ((this.request.get['product_id'])) {
			product_id = this.request.get['product_id'];
		} else {
			product_id = 0;
		}

		if ((this.request.get['page']) && this.request.get['route'] == 'catalog/product.report') {
			page = Number(this.request.get['page']);
		} else {
			page = 1;
		}

		limit = 10;

		data['reports'] = [];

		this.load.model('catalog/product');
		this.load.model('setting/store');

		const results = await this.model_catalog_product.getReports(product_id, (page - 1) * limit, limit);

		for (let result of results) {
			store_info await this.model_setting_store.getStore(result['store_id']);

			if (store_info) {
				store = store_info['name'];
			} elseif (!result['store_id']) {
				store = this.config.get('config_name');
			} else {
				store = '';
			}

			data['reports'].push({
				'ip'         : result['ip'],
				'store'      : store,
				'country'    : result['country'],
				'date_added' : date(this.language.get('datetime_format'), strtotime(result['date_added']))
			];
		}

		report_total await this.model_catalog_product.getTotalReports(product_id);

		data['pagination'] = await this.load.controller('common/pagination', {
			'total' : report_total,
			'page'  : page,
			'limit' : limit,
			'url'   : this.url.link('catalog/product.report', 'user_token=' + this.session.data['user_token'] + '&product_id=' + product_id + '&page={page}')
		]);

		data['results'] = sprintf(this.language.get('text_pagination'), (report_total) ? ((page - 1) * limit) + 1 : 0, (((page - 1) * limit) > (report_total - limit)) ? report_total : (((page - 1) * limit) + limit), report_total, Math.ceil(report_total / limit));

		return await this.load.view('catalog/product_report', data);
	}

	/**
	 * @return void
	 */
	async autocomplete() {
		const json = {};

		if ((this.request.get['filter_name'])) {
			filter_name = this.request.get['filter_name'];
		} else {
			filter_name = '';
		}

		if ((this.request.get['filter_model'])) {
			filter_model = this.request.get['filter_model'];
		} else {
			filter_model = '';
		}

		if ((this.request.get['limit'])) {
			limit = this.request.get['limit'];
		} else {
			limit = 5;
		}

		let filter_data = {
			'filter_name'  : filter_name,
			'filter_model' : filter_model,
			'start'        : 0,
			'limit'        : limit
		});

		this.load.model('catalog/product');
		this.load.model('catalog/option');
		this.load.model('catalog/subscription_plan');

		const results = await this.model_catalog_product.getProducts(filter_data);

		for (let result of results) {
			option_data = [];

			product_options await this.model_catalog_product.getOptions(result['product_id']);

			for (product_options of product_option) {
				option_info await this.model_catalog_option.getOption(product_option['option_id']);

				if (option_info) {
					product_option_value_data = [];

					for (product_option['product_option_value'] of product_option_value) {
						option_value_info await this.model_catalog_option.getValue(product_option_value['option_value_id']);

						if (option_value_info) {
							product_option_value_data.push({
								'product_option_value_id' : product_option_value['product_option_value_id'],
								'option_value_id'         : product_option_value['option_value_id'],
								'name'                    : option_value_info['name'],
								'price'                   : (float)product_option_value['price'] ? this.currency.format(product_option_value['price'], this.config.get('config_currency')) : false,
								'price_prefix'            : product_option_value['price_prefix']
							];
						}
					}

					option_data.push({
						'product_option_id'    : product_option['product_option_id'],
						'product_option_value' : product_option_value_data,
						'option_id'            : product_option['option_id'],
						'name'                 : option_info['name'],
						'type'                 : option_info['type'],
						'value'                : product_option['value'],
						'required'             : product_option['required']
					];
				}
			}

			subscription_data = [];

			product_subscriptions await this.model_catalog_product.getSubscriptions(result['product_id']);

			for (product_subscriptions of product_subscription) {
				subscription_plan_info await this.model_catalog_subscription_plan.getSubscriptionPlan(product_subscription['subscription_plan_id']);

				if (subscription_plan_info) {
					subscription_data.push({
						'subscription_plan_id' : subscription_plan_info['subscription_plan_id'],
						'name'                 : subscription_plan_info['name']
					];
				}
			}

			json.push({
				'product_id'   : result['product_id'],
				'name'         : strip_tags(html_entity_decode(result['name'])),
				'model'        : result['model'],
				'option'       : option_data,
				'subscription' : subscription_data,
				'price'        : result['price']
			];
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
