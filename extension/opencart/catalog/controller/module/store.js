global['\Opencart\Catalog\Controller\Extension\Opencart\Module\Store'] = class Store extends global['\Opencart\System\Engine\Controller'] {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @return string
	 */
	async index() {
		const data = {};
		let status = true;

		if (this.config.get('module_store_admin')) {
			this.user = new (require(DIR_SYSTEM + 'library/cart/user'))(this.registry);

			status = await this.user.isLogged();
		}

		if (status) {
			await this.load.language('extension/opencart/module/store');

			data['store_id'] = this.config.get('config_store_id');

			data['stores'] = [];

			data['stores'].push({
				'store_id': 0,
				'name': this.language.get('text_default'),
				'url': HTTP_SERVER + '?route=common/home&session_id=' + this.session.getId()
			});

			this.load.model('setting/store', this);

			const results = await this.model_setting_store.getStores();

			for (let result of results) {
				data['stores'].push({
					'store_id': result['store_id'],
					'name': result['name'],
					'url': result['url'] + '?route=common/home&session_id=' + this.session.getId()
				});
			}

			return await this.load.view('extension/opencart/module/store', data);
		}
	}
}
