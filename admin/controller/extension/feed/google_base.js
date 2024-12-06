const html_entity_decode = require("locutus/php/strings/html_entity_decode");

module.exports = class ControllerExtensionFeedGoogleBase extends Controller {
	error = {};

	async index() {
		const data = {};
		await this.load.language('extension/feed/google_base');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/setting', this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('feed_google_base', this.request.post);

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
				'href': await this.url.link('extension/feed/google_base', 'user_token=' + this.session.data['user_token'], true)
			});

			data['action'] = await this.url.link('extension/feed/google_base', 'user_token=' + this.session.data['user_token'], true);

			data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=feed', true);

			data['user_token'] = this.session.data['user_token'];

			data['data_feed'] = HTTP_CATALOG + 'index.js?route=extension/feed/google_base';

			if ((this.request.post['feed_google_base_status'])) {
				data['feed_google_base_status'] = this.request.post['feed_google_base_status'];
			} else {
				data['feed_google_base_status'] = this.config.get('feed_google_base_status');
			}

			data['header'] = await this.load.controller('common/header');
			data['column_left'] = await this.load.controller('common/column_left');
			data['footer'] = await this.load.controller('common/footer');

			this.response.setOutput(await this.load.view('extension/feed/google_base', data));
		}
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/feed/google_base')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length ? false : true
	}

	async install() {
		this.load.model('extension/feed/google_base', this);

		await this.model_extension_feed_google_base.install();
	}

	async uninstall() {
		this.load.model('extension/feed/google_base', this);

		await this.model_extension_feed_google_base.uninstall();
	}

	async import() {
		await this.load.language('extension/feed/google_base');

		const json = {};

		// Check user has permission
		if (!await this.user.hasPermission('modify', 'extension/feed/google_base')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!json.error) {
			if ((this.request.files['file']['name']) && is_file(this.request.files['file']['tmp_name'])) {
				// Sanitize the filename
				let filename = expressPath.basename(html_entity_decode(this.request.files['file']['name']));

				// Allowed file extension types
				if (oc_strtolower(oc_substr(filename.substr(filename.lastIndexOf('.')), 1)) != 'txt') {
					json['error'] = this.language.get('error_filetype');
				}

				// Allowed file mime types
				if (this.request.files['file']['type'] != 'text/plain') {
					json['error'] = this.language.get('error_filetype');
				}

				// Return any upload error
				if (this.request.files['file']['error'] != UPLOAD_ERR_OK) {
					json['error'] = this.language.get('error_upload_' + this.request.files['file']['error']);
				}
			} else {
				json['error'] = this.language.get('error_upload');
			}
		}

		if (!json.error) {
			json['success'] = this.language.get('text_success');

			this.load.model('extension/feed/google_base', this);

			// Get the contents of the uploaded file
			const content = fs.readFileSync(this.request.files['file']['tmp_name']);

			await this.model_extension_feed_google_base.import(content);

			delete (this.request.files['file']['tmp_name']);
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async category() {
		const data = {};
		await this.load.language('extension/feed/google_base');
		let page = 1;
		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		}

		data['google_base_categories'] = [];

		let limit = 10;
		let filter_data = {
			'start': (page - 1) * limit,
			'limit': limit
		};

		this.load.model('extension/feed/google_base', this);
		const results = await this.model_extension_feed_google_base.getCategories(filter_data);

		for (let result of results) {
			data['google_base_categories'].push({
				'google_base_category_id': result['google_base_category_id'],
				'google_base_category': result['google_base_category'],
				'category_id': result['category_id'],
				'category': result['category']
			});
		}

		const category_total = await this.model_extension_feed_google_base.getTotalCategories();

		const pagination = new Pagination();
		pagination.total = category_total;
		pagination.page = page;
		pagination.limit = limit;
		pagination.url = await this.url.link('extension/feed/google_base/category', 'user_token=' + this.session.data['user_token'] + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (category_total) ? ((page - 1) * limit) + 1 : 0, (((page - 1) * limit) > (category_total - limit)) ? category_total : (((page - 1) * limit) + limit), category_total, Math.ceil(category_total / limit));

		this.response.setOutput(await this.load.view('extension/feed/google_base_category', data));
	}

	async addcategory() {
		await this.load.language('extension/feed/google_base');

		const json = {};

		if (!await this.user.hasPermission('modify', 'extension/feed/google_base')) {
			json['error'] = this.language.get('error_permission');
		} else if ((this.request.post['google_base_category_id']) && (this.request.post['category_id'])) {
			this.load.model('extension/feed/google_base', this);

			await this.model_extension_feed_google_base.addCategory(this.request.post);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async removecategory() {
		await this.load.language('extension/feed/google_base');

		const json = {};

		if (!await this.user.hasPermission('modify', 'extension/feed/google_base')) {
			json['error'] = this.language.get('error_permission');
		} else {
			this.load.model('extension/feed/google_base', this);

			await this.model_extension_feed_google_base.deleteCategory(this.request.post['category_id']);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async autocomplete() {
		let json = [];

		if ((this.request.get['filter_name'])) {
			this.load.model('extension/feed/google_base', this);
			let filter_name = '';
			if ((this.request.get['filter_name'])) {
				filter_name = this.request.get['filter_name'];
			}

			let filter_data = {
				'filter_name': html_entity_decode(filter_name),
				'start': 0,
				'limit': 5
			};

			const results = await this.model_extension_feed_google_base.getGoogleBaseCategories(filter_data);

			for (let result of results) {
				json.push({
					'google_base_category_id': result['google_base_category_id'],
					'name': strip_tags(html_entity_decode(result['name']))
				});
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
