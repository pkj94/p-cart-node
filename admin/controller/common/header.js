module.exports = class ControllerCommonHeader extends Controller {
	async index() {
		const data = {};
		data['title'] = this.document.getTitle();

		if (this.request.server['HTTPS']) {
			data['base'] = HTTPS_SERVER;
		} else {
			data['base'] = HTTP_SERVER;
		}
		let server = HTTP_CATALOG;
		if (this.request.server['HTTPS']) {
			server = HTTPS_CATALOG;
		} else {
			server = HTTP_CATALOG;
		}

		if (is_file(DIR_IMAGE + this.config.get('config_icon'))) {
			this.document.addLink(server + 'image/' + this.config.get('config_icon'), 'icon');
		}

		data['description'] = this.document.getDescription();
		data['keywords'] = this.document.getKeywords();
		data['links'] = this.document.getLinks();
		data['styles'] = this.document.getStyles();
		data['scripts'] = this.document.getScripts();
		data['lang'] = this.language.get('code');
		data['direction'] = this.language.get('direction');

		await this.load.language('common/header');

		data['text_logged'] = sprintf(this.language.get('text_logged'), await this.user.getUserName());

		if (!(this.request.get['user_token']) || !(this.session.data['user_token']) || (this.request.get['user_token'] != this.session.data['user_token'])) {
			data['logged'] = '';

			data['home'] = await this.url.link('common/login', '', true);
		} else {
			data['logged'] = true;

			data['home'] = await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true);
			data['logout'] = await this.url.link('common/logout', 'user_token=' + this.session.data['user_token'], true);
			data['profile'] = await this.url.link('common/profile', 'user_token=' + this.session.data['user_token'], true);

			this.load.model('user/user', this);

			this.load.model('tool/image', this);

			const user_info = await this.model_user_user.getUser(await this.user.getId());

			if (user_info.user_id) {
				data['firstname'] = user_info['firstname'];
				data['lastname'] = user_info['lastname'];
				data['username'] = user_info['username'];
				data['user_group'] = user_info['user_group'];

				if (is_file(DIR_IMAGE + user_info['image'])) {
					data['image'] = await this.model_tool_image.resize(user_info['image'], 45, 45);
				} else {
					data['image'] = await this.model_tool_image.resize('profile.png', 45, 45);
				}
			} else {
				data['firstname'] = '';
				data['lastname'] = '';
				data['user_group'] = '';
				data['image'] = '';
			}

			// Online Stores
			data['stores'] = [];

			data['stores'].push({
				'name': this.config.get('config_name'),
				'href': HTTP_CATALOG
			});

			this.load.model('setting/store', this);

			const results = await this.model_setting_store.getStores();

			for (let result of results) {
				data['stores'].push({
					'name': result['name'],
					'href': result['url']
				});
			}
		}

		return await this.load.view('common/header', data);
	}
}
