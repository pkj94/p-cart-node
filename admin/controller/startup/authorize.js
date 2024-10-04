module.exports = class AuthorizeController extends Controller {
	constructor(registry) {
		super(registry)
	}

	async index() {
		let route = this.request.get.route || '';
		let token = this.request.cookie.authorize || '';

		// Remove any method call for checking ignore pages.
		const pos = route.lastIndexOf('.');

		if (pos !== -1) {
			route = route.substring(0, pos);
		}

		const ignore = [
			'common/login',
			'common/logout',
			'common/forgotten',
			'common/authorize'
		];

		if (this.config.get('config_security') && !ignore.includes(route)) {
			const modelUserUser = new ModelUserUser(this.registry);
			const token_info = await modelUserUser.getAuthorizeByToken(this.user.getId(), token);

			if (!token_info || !token_info.status && token_info.attempts <= 2) {
				return new Action('common/authorize');
			}

			if (token_info && !token_info.status && token_info.attempts > 2) {
				return new Action('common/authorize.unlock');
			}
		}

		return null;
	}
}

