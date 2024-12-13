module.exports = class ControllerStartupMaintenance extends Controller {
	async index() {
const data = {};
		if (Number(this.config.get('config_maintenance'))) {
			// Route
			let route = this.config.get('action_default');
			if ((this.request.get['route']) && this.request.get['route'] != 'startup/router') {
				route = this.request.get['route'];
			}

			let ignore = [
				'common/language/language',
				'common/currency/currency'
			];

			// Show site if logged in of admin
			this.user = new CartUser(this.registry);
			await await this.user.init();
			if ((route.substr(0, 17) != 'extension/payment' && route.substr(0, 3) != 'api') && !ignore.includes(route) && !await this.user.isLogged()) {
				return new Action('common/maintenance');
			}
		}
	}
}
