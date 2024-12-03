module.exports = class ControllerStartupRouter extends Controller {
	async index() {
		// Route
		let route = this.config.get('action_default');
		if ((this.request.get['route']) && this.request.get['route'] != 'startup/router') {
			route = this.request.get['route'];
		} else {
			route = this.config.get('action_default');
		}

		let data = [];

		// Sanitize the call
		route = route.replace(/[^a-zA-Z0-9_\/]/g, '');

		// Trigger the pre events
		let result = await this.event.trigger('controller/' + route + '/before', [route, data]);

		if (result) {
			return result;
		}
		let action = new Action(route);

		// Any output needs to be another Action object. 
		let output = await action.execute(this.registry, data);

		// Trigger the post events
		result = await this.event.trigger('controller/' + route + '/after', [route, output]);

		if (!result) {
			return result;
		}

		return output;
	}
}
