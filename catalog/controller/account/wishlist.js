const array_unique = require("locutus/php/array/array_unique");

module.exports = class ControllerAccountWishList extends Controller {
	async index() {
		const data = {};
		if (!await this.customer.isLogged()) {
			this.session.data['redirect'] = await this.url.link('account/wishlist', '', true);
			await this.session.save(this.session.data);
			this.response.setRedirect(await this.url.link('account/login', '', true));
		}

		await this.load.language('account/wishlist');

		this.load.model('account/wishlist', this);

		this.load.model('catalog/product', this);

		this.load.model('tool/image', this);

		if ((this.request.get['remove'])) {
			// Remove Wishlist
			await this.model_account_wishlist.deleteWishlist(this.request.get['remove']);

			this.session.data['success'] = this.language.get('text_remove');

			this.response.setRedirect(await this.url.link('account/wishlist'));
		}

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/home')
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_account'),
			'href': await this.url.link('account/account', '', true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('account/wishlist')
		});

		if ((this.session.data['success'])) {
			data['success'] = this.session.data['success'];

			delete this.session.data['success'];
		} else {
			data['success'] = '';
		}

		data['products'] = [];

		const results = await this.model_account_wishlist.getWishlist();

		for (let result of results) {
			const product_info = await this.model_catalog_product.getProduct(result['product_id']);

			if (product_info.product_id) {
				let image = false;
				if (product_info['image']) {
					image = await this.model_tool_image.resize(product_info['image'], this.config.get('theme_' + this.config.get('config_theme') + '_image_wishlist_width'), this.config.get('theme_' + this.config.get('config_theme') + '_image_wishlist_height'));
				}
				let stock = '';
				if (product_info['quantity'] <= 0) {
					stock = product_info['stock_status'];
				} else if (this.config.get('config_stock_display')) {
					stock = product_info['quantity'];
				} else {
					stock = this.language.get('text_instock');
				}
				let price = false;
				if (await this.customer.isLogged() || !Number(this.config.get('config_customer_price'))) {
					price = this.currency.format(this.tax.calculate(product_info['price'], product_info['tax_class_id'], this.config.get('config_tax')), this.session.data['currency']);
				}
				let special = false;
				if (product_info['special']) {
					special = this.currency.format(this.tax.calculate(product_info['special'], product_info['tax_class_id'], this.config.get('config_tax')), this.session.data['currency']);
				}


				data['products'].push({
					'product_id': product_info['product_id'],
					'thumb': image,
					'name': product_info['name'],
					'model': product_info['model'],
					'stock': stock,
					'price': price,
					'special': special,
					'href': await this.url.link('product/product', 'product_id=' + product_info['product_id']),
					'remove': await this.url.link('account/wishlist', 'remove=' + product_info['product_id'])
				});
			} else {
				await this.model_account_wishlist.deleteWishlist(result['product_id']);
			}
		}

		data['continue'] = await this.url.link('account/account', '', true);

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.setOutput(await this.load.view('account/wishlist', data));
	}

	async add() {
		await this.load.language('account/wishlist');

		const json = {};
		let product_id = 0;
		if ((this.request.post['product_id'])) {
			product_id = this.request.post['product_id'];
		}

		this.load.model('catalog/product', this);

		const product_info = await this.model_catalog_product.getProduct(product_id);

		if (product_info.product_id) {
			if (await this.customer.isLogged()) {
				// Edit customers cart
				this.load.model('account/wishlist', this);

				await this.model_account_wishlist.addWishlist(this.request.post['product_id']);

				json['success'] = sprintf(this.language.get('text_success'), await this.url.link('product/product', 'product_id=' + this.request.post['product_id']), product_info['name'], await this.url.link('account/wishlist'));

				json['total'] = sprintf(this.language.get('text_wishlist'), await this.model_account_wishlist.getTotalWishlist());
			} else {
				if (!(this.session.data['wishlist'])) {
					this.session.data['wishlist'] = [];
				}

				this.session.data['wishlist'].push(this.request.post['product_id']);

				this.session.data['wishlist'] = array_unique(this.session.data['wishlist']);

				json['success'] = sprintf(this.language.get('text_login'), await this.url.link('account/login', '', true), await this.url.link('account/register', '', true), await this.url.link('product/product', 'product_id=' + this.request.post['product_id']), product_info['name'], await this.url.link('account/wishlist'));

				json['total'] = sprintf(this.language.get('text_wishlist'), ((this.session.data['wishlist']) ? this.session.data['wishlist'].length : 0));
			}
		}
		await this.session.save(this.session.data);
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
