module.exports = class ControllerApiLogin extends Controller {
	async index() {
const data = {};
		await this.load.language('api/login');

		json = api_info = array();

		this.load.model('account/api');

		// Login with API Key
		if ((this.request.post['username']) && (this.request.post['key'])) {
			api_info = await this.model_account_api.login(this.request.post['username'], this.request.post['key']);
		} else if ((this.request.post['key'])) {
			api_info = await this.model_account_api.login('Default', this.request.post['key']);
		}

		if (api_info) {
			// Check if IP is allowed
			ip_data = array();
	
			const results = await this.model_account_api.getApiIps(api_info['api_id']);
	
			for (let result of results) {
				ip_data.push(trim(result['ip']);
			}
	
			if (!in_array(this.request.server.headers['x-forwarded-for'] || (
                this.request.server.connection ? (this.request.server.connection.remoteAddress ||
                    this.request.server.socket.remoteAddress ||
                    this.request.server.connection.socket.remoteAddress) : ''), ip_data)) {
				json['error']['ip'] = sprintf(this.language.get('error_ip'), this.request.server.headers['x-forwarded-for'] || (
                this.request.server.connection ? (this.request.server.connection.remoteAddress ||
                    this.request.server.socket.remoteAddress ||
                    this.request.server.connection.socket.remoteAddress) : ''));
			}				
				
			if (!json) {
				json['success'] = this.language.get('text_success');
				
				session = new Session(this.config.get('session_engine'), this.registry);
				
				session.start();
				
				await this.model_account_api.addApiSession(api_info['api_id'], session.getId(), this.request.server.headers['x-forwarded-for'] || (
                this.request.server.connection ? (this.request.server.connection.remoteAddress ||
                    this.request.server.socket.remoteAddress ||
                    this.request.server.connection.socket.remoteAddress) : ''));
				
				session.data['api_id'] = api_info['api_id'];
				
				// Create Token
				json['api_token'] = session.getId();
			} else {
				json['error']['key'] = this.language.get('error_key');
			}
		}
		
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
