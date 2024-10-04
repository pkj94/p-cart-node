const axios = require('axios');

module.exports = class NotificationController extends Controller {
	constructor(registry) {
		super(registry)
	}
	async index() {
		if (!this.request.cookie.notification) {
			try {
				const response = await axios.get(`${OPENCART_SERVER}?route=api/notification`, {
					timeout: 30000, // 30 seconds timeout
					httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }) // for CURLOPT_SSL_VERIFYPEER = 0
				});

				let notification = response.data ? JSON.parse(response.data) : '';

				if (notification.notification) {
					for (const result of notification.notifications) {
						let notification_info = await this.model_notification.addNotification(result.notification_id);

						if (!notification_info) {
							await this.model_notification.addNotification(result);
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

				this.response.cookie('notification', true, options);
			} catch (error) {
				console.error('Error fetching notifications:', error);
			}
		}
	}
}

