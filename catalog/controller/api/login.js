module.exports = class ControllerApiLogin extends Controller {
	async index() {
		const data = {};
		await this.load.language('api/login');

		let json = {}, api_info = {};

		this.load.model('account/api', this);

		// Login with API Key
		if ((this.request.post['username']) && (this.request.post['key'])) {
			api_info = await this.model_account_api.login(this.request.post['username'], this.request.post['key']);
		} else if ((this.request.post['key'])) {
			api_info = await this.model_account_api.login('Default', this.request.post['key']);
		}

		if (api_info.api_id) {
			// Check if IP is allowed
			const ip_data = [];

			const results = await this.model_account_api.getApiIps(api_info['api_id']);

			for (let result of results) {
				ip_data.push(result['ip'].trim());
			}

			if (!ip_data.includes(this.request.server.headers['x-forwarded-for'] || (
				this.request.server.connection ? (this.request.server.connection.remoteAddress ||
					this.request.server.socket.remoteAddress ||
					this.request.server.connection.socket.remoteAddress) : ''))) {
				json['error'] = json['error'] || {}
				json['error']['ip'] = sprintf(this.language.get('error_ip'), this.request.server.headers['x-forwarded-for'] || (
					this.request.server.connection ? (this.request.server.connection.remoteAddress ||
						this.request.server.socket.remoteAddress ||
						this.request.server.connection.socket.remoteAddress) : ''));
			}

			if (!Object.keys(json).length) {
				json['success'] = this.language.get('text_success');

				const session = new Session(this.config.get('session_engine'), this.registry);

				session.start(this.request.server.sessionID);

				await this.model_account_api.addApiSession(api_info['api_id'], session.getId(), this.request.server.headers['x-forwarded-for'] || (
					this.request.server.connection ? (this.request.server.connection.remoteAddress ||
						this.request.server.socket.remoteAddress ||
						this.request.server.connection.socket.remoteAddress) : ''));

				session.data['api_id'] = api_info['api_id'];
				await session.save(session.data);
				// Create Token
				json['api_token'] = session.getId();
			} else {
				json['error'] = json['error'] || {};
				json['error']['key'] = this.language.get('error_key');
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
