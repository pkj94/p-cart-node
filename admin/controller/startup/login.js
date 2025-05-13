module.exports = class LoginController extends global['OpencartSystemEngineController'] {
	constructor(registry) {
		super(registry)
	}
	async index() {
		let route = this.request.get.route || '';

		// Remove any method call for checking ignore pages.
		const pos = route.lastIndexOf('.');

		if (pos !== -1) {
			route = route.substring(0, pos);
		}

		const ignore = [
			'common/login',
			'common/forgotten',
			'common/language'
		];

		// User
		this.user = new global['OpencartSystemLibraryCart\User'](this.registry);

		this.registry.set('user', this.user);
		// console.log('statup/login',  this.request.get.user_token, this.session.data.user_token, this.session.data,this.request.get)

		if (!await this.user.isLogged() && !ignore.includes(route)) {
			return new global['OpencartSystemEngineAction']('common/login');
		}

		const ignorePages = [
			'common/login',
			'common/logout',
			'common/forgotten',
			'common/language',
			'error/not_found',
			'error/permission'
		];
		// console.log('statup/login', ignorePages.includes(route), this.request.get.user_token, this.session.data.user_token, this.session.data,this.request.get)
		if (!ignorePages.includes(route) && (!this.request.get.user_token || !this.session.data.user_token || this.request.get.user_token !== this.session.data.user_token)) {
			return new global['OpencartSystemEngineAction']('common/login');
		}

		return null;
	}
}


