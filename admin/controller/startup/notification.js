module.exports = class NotificationController extends global['OpencartSystemEngineController'] {
	constructor(registry) {
		super(registry)
	}
	async index() {
		if (!this.request.cookie.notification) {
			try {
				const response = await require('axios').get(`${OPENCART_SERVER}?route=api/notification`, {
					timeout: 30000, // 30 seconds timeout
					httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }) // for CURLOPT_SSL_VERIFYPEER = 0
				});

				// axios already parses a JSON response
				let notification = typeof response.data == 'string' ? oc_json_decode(response.data, {}) : (response.data || {});

				if (Array.isArray(notification.notification)) {
					this.load.model('tool/notification', this);

					for (const result of notification.notification) {
						let notification_info = await this.model_tool_notification.getNotification(result.notification_id);

						if (empty(notification_info)) {
							await this.model_tool_notification.addNotification(result);
						}
					}
				}

				const options = {
					expires: new Date(Date.now() + 3600 * 24 * 7 * 1000),
					path: this.config.get('session_path'),
					secure: !!this.request.server.HTTPS,
					httpOnly: false,
					sameSite: this.config.get('config_session_samesite')
				};

				// The Response library wraps Express's res, which sets cookies
				this.response.response.cookie('notification', '1', options);
			} catch (error) {
				console.error('Error fetching notifications:', error);
			}
		}
	}
}

