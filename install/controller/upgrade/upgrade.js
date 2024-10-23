global['\Opencart\Install\Controller\Upgrade\Upgrade'] = class Upgrade extends global['\Opencart\System\Engine\Controller'] {

	constructor(registry) {
		super(registry);
	}
	/**
	 * @return void
	 */
	async index() {
		await this.load.language('upgrade/upgrade');

		this.document.setTitle(this.language.get('heading_title'));

		const data = {
			heading_title: this.language.get('heading_title'),
			text_upgrade: this.language.get('text_upgrade'),
			text_server: this.language.get('text_server'),
			text_steps: this.language.get('text_steps'),
			text_error: this.language.get('text_error'),
			text_clear: this.language.get('text_clear'),
			text_refresh: this.language.get('text_refresh'),
			text_admin: this.language.get('text_admin'),
			text_user: this.language.get('text_user'),
			text_setting: this.language.get('text_setting'),
			text_store: this.language.get('text_store'),
			text_loading: this.language.get('text_loading'),
			entry_progress: this.language.get('entry_progress'),
			button_continue: this.language.get('button_continue')
		};

		const server = HTTP_SERVER.trim('/');

		data.server = server.substring(0, server.indexOf('/')) + '/';
		data.total = fs.readdirSync(DIR_APPLICATION + 'controller/upgrade/').filter(a => a.indexOf('upgrade_')).length;

		data.header = await this.load.controller('common/header');
		data.footer = await this.load.controller('common/footer');
		// data.column_left = await this.load.controller('common/column_left');

		this.response.setOutput(await this.load.view('upgrade/upgrade', data));
	}
}