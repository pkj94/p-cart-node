module.exports = class LogoutController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		this.user.logout();

		delete (this.session.data['user_token']);

		this.response.setRedirect(this.url.link('common/login', '', true));
	}
}