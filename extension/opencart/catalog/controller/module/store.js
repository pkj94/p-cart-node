<?php
namespace Opencart\Catalog\Controller\Extension\Opencart\Module;
/**
 * Class Store
 *
 * @package
 */
class StoreController extends Controller {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @return string
	 */
	async index() {
		$status = true;

		if (this.config.get('module_store_admin')) {
			this.user = new \Opencart\System\Library\Cart\User(this.registry);

			$status = this.user.isLogged();
		}

		if ($status) {
			this.load.language('extension/opencart/module/store');

			data['store_id'] = this.config.get('config_store_id');

			data['stores'] = [];

			data['stores'].push({
				'store_id' : 0,
				'name'     : this.language.get('text_default'),
				'url'      : HTTP_SERVER + '?route=common/home&session_id=' . this.session.getId()
			];

			this.load.model('setting/store');

			const results = await this.model_setting_store.getStores();

			for(let result of results) {
				data['stores'].push({
					'store_id' : result['store_id'],
					'name'     : result['name'],
					'url'      : result['url'] + '?route=common/home&session_id=' . this.session.getId()
				];
			}

			return await this.load.view('extension/opencart/module/store', data);
		}
	}
}
