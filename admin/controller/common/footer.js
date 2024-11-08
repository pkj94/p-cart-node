module.exports = class ControllerCommonFooter extends Controller {
	async index() {
		const data = {};
		await this.load.language('common/footer');

		if (await this.user.isLogged() && (this.request.get['user_token']) && (this.request.get['user_token'] == this.session.data['user_token'])) {
			data['version_text'] = sprintf(this.language.get('text_version'), VERSION);
		} else {
			data['version_text'] = '';
		}

		return await this.load.view('common/footer', data);
	}
}
