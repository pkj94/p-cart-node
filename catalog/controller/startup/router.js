module.exports = class ControllerStartupRouter extends Controller {
	async index() {
		const data = {};
		// Route
		let route = this.config.get('action_default');
		if ((this.request.get['route']) && this.request.get['route'] != 'startup/router') {
			route = this.request.get['route'];
		}

		// Sanitize the call
		route = route.replace(/[^a-zA-Z0-9_\/]/g, '');


		// Trigger the pre events
		let result = await this.event.trigger('controller/' + route + '/before', [route, data]);

		if ((result)) {
			return result;
		}

		// We dont want to use the loader class of it would make an controller callable.
		const action = new Action(route);

		// Any output needs to be another Action object.
		// console.log('action', action)

		let output = await action.execute(this.registry);
		// console.log('==---==-=',output)

		// Trigger the post events
		result = await this.event.trigger('controller/' + route + '/after', [route, data, output]);

		if ((result)) {
			return result;
		}

		return output;
	}
}
