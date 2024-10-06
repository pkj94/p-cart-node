module.exports = class PermissionController extends Controller {
	constructor(registry) {
		super(registry)
	}
	async index() {
		if (this.request.get.route) {
			const pos = this.request.get.route.lastIndexOf('.');

			let route;
			if (pos === -1) {
				route = this.request.get.route;
			} else {
				route = this.request.get.route.substring(0, pos);
			}

			// We want to ignore some pages from having their permissions checked.
			const ignore = [
				'common/dashboard',
				'common/login',
				'common/logout',
				'common/forgotten',
				'common/authorize',
				'common/language',
				'error/not_found',
				'error/permission'
			];

			if (!ignore.includes(route) && !this.user.hasPermission('access', route)) {
				return await new Action('error/permission');
			}
		}

		return null;
	}
}
