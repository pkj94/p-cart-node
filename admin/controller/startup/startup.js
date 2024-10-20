module.exports = class StartupController extends Controller {
	constructor(registry) {
		super(registry)
	}
	async index() {
		// Load startup actions
		this.load.model('setting/startup', this);

		const results = await this.model_setting_startup.getStartups();
		// console.log(results)
		for (const result of results) {
			if (result.action.startsWith('admin/') && result.status) {
				await this.load.controller(result.action.slice(6));
			}
		}
	}
}

