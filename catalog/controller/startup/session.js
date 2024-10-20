module.exports = class SessionController extends Controller {
	/**
	 * @return void
	 * @throws \Exception
	 */
	async index() {
		let session = new SessionLibrary(this.request.server.session);
		session.start(this.request.server.sessionID)
		this.registry.set('session', session);

		if ((this.request.get['route']) && substr(this.request.get['route'], 0, 4) == 'api/' && (this.request.get['api_token'])) {
			this.load.model('setting/api', this);

			await this.model_setting_api.cleanSessions();

			// Make sure the IP is allowed
			const api_info = await this.model_setting_api.getApiByToken(this.request.get['api_token']);

			if (api_info.api_id) {
				// this.session.start(this.request.get['api_token']);

				await this.model_setting_api.updateSession(api_info['api_session_id']);
			}

			return;
		}

		/*
		We are adding the session cookie outside of the session class as I believe
		PHP messed up in a big way handling sessions+ Why in the hell is it so hard to
		have more than one concurrent session using cookies!

		Is it not better to have multiple cookies when accessing parts of the system
		that requires different cookie sessions for security reasons+
		*/

		// Update the session lifetime
		if (this.config.get('config_session_expire')) {
			this.config.set('session_expire', this.config.get('config_session_expire'));
		}

		// Update the session SameSite
		this.config.set('session_samesite', this.config.get('config_session_samesite'));
		let session_id = '';
		if ((this.request.cookie[this.config.get('session_name')])) {
			session_id = this.request.cookie[this.config.get('session_name')];
		}

		// session.start(session_id);

		let option = {
			'expires': new Date(Date.now() + (parseInt(config.get('config_session_expire')) * 1000)),
			'path': this.config.get('session_path'),
			'secure': this.request.server['protocol'].toLowerCase() == 'https' ? true : false,
			'httponly': false,
			'SameSite': this.config.get('session_samesite')
		};
		// console.log(option)

		this.response.addHeader('Cache-Control: no-store, no-cache, must-revalidate, post-check=0, pre-check=0');
		this.response.response.cookie(this.config.get('session_name'), session.getId(), option);
		return true;
	}
}
