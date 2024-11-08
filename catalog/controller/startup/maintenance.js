module.exports = class Maintenance extends Controller {
	/**
	 * @return object|Action|null
	 */
	async index() {
		if (Number(this.config.get('config_maintenance'))) {
			// Route
			let route = this.config.get('action_default');
			if ((this.request.get['route'])) {
				route = this.request.get['route'];
			} else {
				route = this.config.get('action_default');
			}

			let ignore = [
				'common/language/language',
				'common/currency/currency'
			];

			// Show site if logged in as admin
			const user = new (require(DIR_SYSTEM + 'library/cart/user'))(this.registry);

			if (route.substring(0, 3) != 'api' && !ignore.includes(route) && !await user.isLogged()) {
				return new global['\Opencart\System\Engine\Action']('common/maintenance');
			}
		}

		return null;
	}
}
