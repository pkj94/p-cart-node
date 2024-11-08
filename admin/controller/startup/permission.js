module.exports = class ControllerStartupPermission extends Controller {
	async index() {
		if ((this.request.get['route'])) {
			let route = '';

			let part = this.request.get['route'].split('/');

			if ((part[0])) {
				route += part[0];
			}

			if ((part[1])) {
				route += '/' + part[1];
			}

			// If a 3rd part is found we need to check if its under one of the extension folders.
			let extension = [
				'extension/advertise',
				'extension/dashboard',
				'extension/analytics',
				'extension/captcha',
				'extension/currency',
				'extension/extension',
				'extension/feed',
				'extension/fraud',
				'extension/module',
				'extension/payment',
				'extension/shipping',
				'extension/theme',
				'extension/total',
				'extension/report'
			];

			if ((part[2]) && extension.includes(route)) {
				route += '/' + part[2];
			}

			// We want to ingore some pages from having its permission checked.
			let ignore = [
				'common/dashboard',
				'common/login',
				'common/logout',
				'common/forgotten',
				'common/reset',
				'error/not_found',
				'error/permission'
			];

			if (!ignore.includes(route) && !await this.user.hasPermission('access', route)) {
				return new Action('error/permission');
			}
		}
	}
}
