module.exports = class ControllerAccountTracking extends Controller {
	async index() {
const data = {};
		if (!await this.customer.isLogged()) {
			this.session.data['redirect'] = await this.url.link('account/tracking', '', true);
			await this.session.save(this.session.data);
			this.response.setRedirect(await this.url.link('account/login', '', true));
		}

		this.load.model('account/customer',this);

		affiliate_info = await this.model_account_customer.getAffiliate(await this.customer.getId());
			
		if (affiliate_info) {
			await this.load.language('account/tracking');
	
			this.document.setTitle(this.language.get('heading_title'));
	
			data['breadcrumbs'] = [];
	
			data['breadcrumbs'].push({
				'text' : this.language.get('text_home'),
				'href' : await this.url.link('common/home')
			});
	
			data['breadcrumbs'].push({
				'text' : this.language.get('text_account'),
				'href' : await this.url.link('account/account', '', true)
			});
	
			data['breadcrumbs'].push({
				'text' : this.language.get('heading_title'),
				'href' : await this.url.link('account/tracking', '', true)
			});
	
			data['text_description'] = sprintf(this.language.get('text_description'), this.config.get('config_name'));
	
			data['code'] = affiliate_info['tracking'];
	
			data['continue'] = await this.url.link('account/account', '', true);
	
			data['column_left'] = await this.load.controller('common/column_left');
			data['column_right'] = await this.load.controller('common/column_right');
			data['content_top'] = await this.load.controller('common/content_top');
			data['content_bottom'] = await this.load.controller('common/content_bottom');
			data['footer'] = await this.load.controller('common/footer');
			data['header'] = await this.load.controller('common/header');
	
			this.response.setOutput(await this.load.view('account/tracking', data));
		} else {
			return new Action('error/not_found');
		}
	}

	async autocomplete() {
		const json = {};

		if ((this.request.get['filter_name'])) {
			if ((this.request.get['tracking'])) {
				tracking = this.request.get['tracking'];
			} else {
				tracking = '';
			}
			
			this.load.model('catalog/product',this);

			const filter_data = {
				'filter_name' : this.request.get['filter_name'],
				'start'       : 0,
				'limit'       : 5
			});

			const results = await this.model_catalog_product.getProducts(filter_data);

			for (let result of results) {
				json.push(array(
					'name' : strip_tags(html_entity_decode(result['name'])),
					'link' : str_replace('&amp;', '&', await this.url.link('product/product', 'product_id=' + result['product_id'] + '&tracking=' + tracking))
				});
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}