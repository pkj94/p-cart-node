module.exports = class Api extends global['\Opencart\System\Engine\Controller'] {
	constructor(registry) {
		super(registry);
	}
	/**
	 * @return object|Action|null
	 */
	async index() {
		let route = '';
		if ((this.request.get['route'])) {
			route = this.request.get['route'];
		}

		if (route.substring(0, 4) == 'api/' && route !== 'api/account/login' && !(this.session.data['api_id'])) {
			return new global['\Opencart\System\Engine\Action']('error/permission');
		}

		return null;
	}
}
