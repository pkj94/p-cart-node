module.exports = class ControllerExtensionModuleStore extends Controller {
	async index() {
const data = {};
		status = true;

		if (this.config.get('module_store_admin')) {
			this.user = new Cart\User(this.registry);

			status = await this.user.isLogged();
		}

		if (status) {
			await this.load.language('extension/module/store');

			data['store_id'] = this.config.get('config_store_id');

			data['stores'] = array();

			data['stores'].push(array(
				'store_id' : 0,
				'name'     : this.language.get('text_default'),
				'url'      : HTTP_SERVER + 'index.js?route=common/home&session_id=' + this.session.getId()
			});

			this.load.model('setting/store');

			const results = await this.model_setting_store.getStores();

			for (let result of results) {
				data['stores'].push(array(
					'store_id' : result['store_id'],
					'name'     : result['name'],
					'url'      : result['url'] + 'index.js?route=common/home&session_id=' + this.session.getId()
				});
			}

			return await this.load.view('extension/module/store', data);
		}
	}
}
