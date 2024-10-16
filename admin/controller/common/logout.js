module.exports = class LogoutController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		await this.user.logout();

		delete (this.session.data['user_token']);

		this.response.setRedirect(await this.url.link('common/login', '', true));
	}
}