const substr = require("locutus/php/strings/substr");

module.exports = class ControllerStartupEvent extends Controller {
	async index() {
		// Add events from the DB
		this.load.model('setting/event', this);

		const results = await this.model_setting_event.getEvents();

		for (let result of results) {
			if ((substr(result['trigger'], 0, 6) == 'admin/') && result['status']) {
				this.event.register(substr(result['trigger'], 6), new Action(result['action']), result['sort_order']);
			}
		}
	}
}