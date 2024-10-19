module.exports=class WishListController extends Controller {
	/**
	 * @return void
	 */
	public function index() {
		await this.load.language('account/wishlist');

		if (!await this.customer.isLogged() || (!(this.request.get['customer_token']) || !(this.session.data['customer_token']) || (this.request.get['customer_token'] != this.session.data['customer_token']))) {
			this.session.data['redirect'] = await this.url.link('account/wishlist', 'language=' + this.config.get('config_language'));

			this.response.setRedirect(await this.url.link('account/login', 'language=' + this.config.get('config_language')));
		}

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : await this.url.link('common/home', 'language=' + this.config.get('config_language'))
		];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_account'),
			'href' : await this.url.link('account/account', 'language=' + this.config.get('config_language') + ((this.session.data['customer_token']) ? '&customer_token=' + this.session.data['customer_token'] : ''))
		];

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('account/wishlist', 'language=' + this.config.get('config_language') + ((this.session.data['customer_token']) ? '&customer_token=' + this.session.data['customer_token'] : ''))
		];

		if ((this.session.data['success'])) {
			data['success'] = this.session.data['success'];

			delete (this.session.data['success']);
		} else {
			data['success'] = '';
		}

		data['list'] = await this.load.controller('account/wishlist.getList');

		data['continue'] = await this.url.link('account/account', 'language=' + this.config.get('config_language') + ((this.session.data['customer_token']) ? '&customer_token=' + this.session.data['customer_token'] : ''));

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.setOutput(await this.load.view('account/wishlist', data));
	}

	/**
	 * @return void
	 */
	public function list() {
		await this.load.language('account/wishlist');

		this.response.setOutput(await this.getList());
	}

	/**
	 * @return string
	 */
	public function getList() {
		data['wishlist'] = await this.url.link('account/wishlist.list', 'language=' + this.config.get('config_language') + ((this.session.data['customer_token']) ? '&customer_token=' + this.session.data['customer_token'] : ''));
		data['add_to_cart'] = await this.url.link('checkout/cart.add', 'language=' + this.config.get('config_language'));
		data['remove'] = await this.url.link('account/wishlist.remove', 'language=' + this.config.get('config_language') + ((this.session.data['customer_token']) ? '&customer_token=' + this.session.data['customer_token'] : ''));

		data['products'] = [];

		this.load.model('account/wishlist',this);
		this.load.model('catalog/product',this);
		this.load.model('tool/image',this);

		const results = await this.model_account_wishlist.getWishlist();

		for (let result of results) {
			const product_info = await this.model_catalog_product.getProduct(result['product_id']);

			if (product_info.product_id) {
				if (product_info['image']) {
					image = await this.model_tool_image.resize(html_entity_decode(product_info['image']), this.config.get('config_image_wishlist_width'), this.config.get('config_image_wishlist_height'));
				} else {
					image = false;
				}

				if (product_info['quantity'] <= 0) {
					stock = product_info['stock_status'];
				} else if (this.config.get('config_stock_display')) {
					stock = product_info['quantity'];
				} else {
					stock = this.language.get('text_instock');
				}

				if (await this.customer.isLogged() || !Number(this.config.get('config_customer_price'))) {
					price = this.currency.format(this.tax.calculate(product_info['price'], product_info['tax_class_id'], Number(Number(this.config.get('config_tax')))), this.session.data['currency']);
				} else {
					price = false;
				}

				if (product_info['special']) {
					special = this.currency.format(this.tax.calculate(product_info['special'], product_info['tax_class_id'], Number(Number(this.config.get('config_tax')))), this.session.data['currency']);
				} else {
					special = false;
				}

				data['products'].push({
					'product_id' : product_info['product_id'],
					'thumb'      : image,
					'name'       : product_info['name'],
					'model'      : product_info['model'],
					'stock'      : stock,
					'price'      : price,
					'special'    : special,
					'minimum'    : product_info['minimum'] > 0 ? product_info['minimum'] : 1,
					'href'       : await this.url.link('product/product', 'language=' + this.config.get('config_language') + '&product_id=' + product_info['product_id'])
				];
			} else {
				await this.model_account_wishlist.deleteWishlist(result['product_id']);
			}
		}

		return await this.load.view('account/wishlist_list', data);
	}

	/**
	 * @return void
	 */
	public function add() {
		await this.load.language('account/wishlist');

		const json = {};

		if ((this.request.post['product_id'])) {
			product_id = this.request.post['product_id'];
		} else {
			product_id = 0;
		}

		this.load.model('catalog/product',this);

		const product_info = await this.model_catalog_product.getProduct(product_id);

		if (!product_info) {
			json['error'] = this.language.get('error_product');
		}

		if (!Object.keys(json).length) {
			if (!(this.session.data['wishlist'])) {
				this.session.data['wishlist'] = [];
			}

			this.session.data['wishlist'].push(product_id;

			this.session.data['wishlist'] = array_unique(this.session.data['wishlist']);

			// Store the
			if (await this.customer.isLogged()) {
				// Edit customers cart
				this.load.model('account/wishlist',this);

				await this.model_account_wishlist.addWishlist(product_id);

				json['success'] = sprintf(this.language.get('text_success'), await this.url.link('product/product', 'language=' + this.config.get('config_language') + '&product_id=' + product_id), product_info['name'], await this.url.link('account/wishlist', 'language=' + this.config.get('config_language') + ((this.session.data['customer_token']) ? '&customer_token=' + this.session.data['customer_token'] : '')));

				json['total'] = sprintf(this.language.get('text_wishlist'), this.model_account_wishlist.getTotalWishlist());
			} else {
				json['success'] = sprintf(this.language.get('text_login'), await this.url.link('account/login', 'language=' + this.config.get('config_language')), await this.url.link('account/register', 'language=' + this.config.get('config_language')), await this.url.link('product/product', 'language=' + this.config.get('config_language') + '&product_id=' + product_id), product_info['name'], await this.url.link('account/wishlist', 'language=' + this.config.get('config_language') + ((this.session.data['customer_token']) ? '&customer_token=' + this.session.data['customer_token'] : '')));

				json['total'] = sprintf(this.language.get('text_wishlist'), ((this.session.data['wishlist']) ? count(this.session.data['wishlist']) : 0));
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	public function remove() {
		await this.load.language('account/wishlist');

		const json = {};

		if ((this.request.post['product_id'])) {
			product_id = this.request.post['product_id'];
		} else {
			product_id = 0;
		}

		if (!Object.keys(json).length) {
			if (await this.customer.isLogged()) {
				this.load.model('account/wishlist',this);

				await this.model_account_wishlist.deleteWishlist(product_id);

				json['success'] = this.language.get('text_remove');
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
