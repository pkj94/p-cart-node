module.exports = class AuthorizeController extends global['\Opencart\System\Engine\Controller'] {
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
			this.load.model('user/user', this);
			const token_info = await this.model_user_user.getAuthorizeByToken(await this.user.getId(), token);

			if (!token_info || !token_info.status && token_info.attempts <= 2) {
				return new global['\Opencart\System\Engine\Action']('common/authorize');
			}

			if (token_info && !token_info.status && token_info.attempts > 2) {
				return new global['\Opencart\System\Engine\Action']('common/authorize.unlock');
			}
		}

		return null;
	}
}

