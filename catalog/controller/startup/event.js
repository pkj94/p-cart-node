module.exports = class ControllerStartupEvent extends Controller {
	async index() {
const data = {};
		// Add events from the DB
		this.load.model('setting/event', this);

		const results = await this.model_setting_event.getEvents();

		for (let result of results) {
			this.event.register(result['trigger'].substr(result['trigger'].indexOf('/') + 1), new Action(result['action']), result['sort_order']);
		}
	}
}