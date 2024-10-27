module.exports = class Startup extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return void
	 */
	async index() {
		// Load startup actions
		this.load.model('setting/startup', this);

		const results = await this.model_setting_startup.getStartups();

		for (let result of results) {
			if (result['action'].substring(0, 8) == 'catalog/') {
				await this.load.controller(result['action'].substring(8));
			}
		}
		return true;
	}
}