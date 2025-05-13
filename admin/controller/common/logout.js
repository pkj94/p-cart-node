module.exports = class LogoutController extends global['OpencartSystemEngineController'] {
	/**
	 * @return void
	 */
	async index() {
		await this.user.logout();

		delete (this.session.data['user_token']);

		this.response.setRedirect(await this.url.link('common/login', '', true));
	}
}