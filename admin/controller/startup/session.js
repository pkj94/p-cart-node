module.exports = class SessionController extends Controller {
	constructor(registry) {
		super(registry)
	}
	async index() {
		const session = new SessionLibrary(this.registry);
		this.registry.set('session', session);

		// Update the session lifetime
		if (this.config.get('config_session_expire')) {
			this.config.set('session_expire', this.config.get('config_session_expire'));
		}

		// Require higher security for session cookies
		const options = {
			maxAge: this.config.get('config_session_expire') ? Date.now() + (this.config.get('config_session_expire') * 1000) : 0,
			path: this.config.get('session_path'),
			secure: !!this.request.server.HTTPS,
			httpOnly: false,
			sameSite: this.config.get('config_session_samesite')
		};
		this.response.response.cookie(this.config.get('session_name'), session.getId(), options);
	}
}