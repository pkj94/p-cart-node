module.exports = class ControllerStartupLogin extends Controller {
	async index() {
const data = {};
		let route = (this.request.get['route']) ? this.request.get['route'] : '';

		let ignore = [
			'common/login',
			'common/forgotten',
			'common/reset'
		];

		// User
		this.registry.set('user', new CartUser(this.registry));

		if (!await this.user.isLogged() && !ignore.includes(route)) {
			return new Action('common/login');
		}

		if ((this.request.get['route'])) {
			let ignore = [
				'common/login',
				'common/logout',
				'common/forgotten',
				'common/reset',
				'error/not_found',
				'error/permission'
			];

			if (!ignore.includes(route) && (!(this.request.get['user_token']) || !(this.session.data['user_token']) || (this.request.get['user_token'] != this.session.data['user_token']))) {
				return new Action('common/login');
			}
		} else {
			if (!(this.request.get['user_token']) || !(this.session.data['user_token']) || (this.request.get['user_token'] != this.session.data['user_token'])) {
				return new Action('common/login');
			}
		}
	}
}
