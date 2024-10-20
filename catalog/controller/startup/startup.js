module.exports = class StartupController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		// Load startup actions
		this.load.model('setting/startup', this);

		const results = await this.model_setting_startup.getStartups();

		for (let result of results) {
			console.log('startup---', result, result['action'].substring(0, 8))
			if (result['action'].substring(0, 8) == 'catalog/') {
				await this.load.controller(result['action'].substring(8));
			}
		}
		return true;
	}
}