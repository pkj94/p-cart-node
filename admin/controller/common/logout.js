module.exports = class ControllerCommonLogout extends Controller {
	async index() {
		await this.user.logout();

		delete this.session.data['user_token'];
		await this.session.save(this.session.data);
		this.response.setRedirect(await this.url.link('common/login', '', true));
	}
}