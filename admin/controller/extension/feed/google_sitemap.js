module.exports = class ControllerExtensionFeedGoogleSitemap extends Controller {
	error = {};

	async index() {
		const data = {};
		await this.load.language('extension/feed/google_sitemap');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/setting', this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('feed_google_sitemap', this.request.post);

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);

			this.response.setRedirect(await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=feed', true));
		} else {

			if ((this.error['warning'])) {
				data['error_warning'] = this.error['warning'];
			} else {
				data['error_warning'] = '';
			}

			data['breadcrumbs'] = [];

			data['breadcrumbs'].push({
				'text': this.language.get('text_home'),
				'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
			});

			data['breadcrumbs'].push({
				'text': this.language.get('text_extension'),
				'href': await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=feed', true)
			});

			data['breadcrumbs'].push({
				'text': this.language.get('heading_title'),
				'href': await this.url.link('extension/feed/google_sitemap', 'user_token=' + this.session.data['user_token'], true)
			});

			data['action'] = await this.url.link('extension/feed/google_sitemap', 'user_token=' + this.session.data['user_token'], true);

			data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=feed', true);

			if ((this.request.post['feed_google_sitemap_status'])) {
				data['feed_google_sitemap_status'] = this.request.post['feed_google_sitemap_status'];
			} else {
				data['feed_google_sitemap_status'] = this.config.get('feed_google_sitemap_status');
			}

			data['data_feed'] = HTTP_CATALOG + 'index.js?route=extension/feed/google_sitemap';

			data['header'] = await this.load.controller('common/header');
			data['column_left'] = await this.load.controller('common/column_left');
			data['footer'] = await this.load.controller('common/footer');

			this.response.setOutput(await this.load.view('extension/feed/google_sitemap', data));
		}
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/feed/google_sitemap')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length ? false : true
	}
}