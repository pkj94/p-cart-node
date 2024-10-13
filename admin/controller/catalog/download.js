const fs = require('fs');
const expressPath = require('path');
const sprintf = require('locutus/php/strings/sprintf');
const strtotime = require('locutus/php/datetime/strtotime');
module.exports = class DownloadController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('catalog/download');

		this.document.setTitle(this.language.get('heading_title'));

		let url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': this.url.link('catalog/download', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['add'] = this.url.link('catalog/download.form', 'user_token=' + this.session.data['user_token'] + url);
		data['delete'] = this.url.link('catalog/download.delete', 'user_token=' + this.session.data['user_token']);

		data['user_token'] = this.session.data['user_token'];

		data['list'] = await this.getList();

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('catalog/download', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('catalog/download');

		this.response.setOutput(await this.getList());
	}

	/**
	 * @return string
	 */
	async getList() {
		const data = {};
		let sort = 'dd.name';
		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		}

		let order = 'ASC';
		if ((this.request.get['order'])) {
			order = this.request.get['order'];
		}

		let page = 1;
		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		}

		let url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['action'] = this.url.link('catalog/download.list', 'user_token=' + this.session.data['user_token'] + url);

		data['downloads'] = [];

		let filter_data = {
			'sort': sort,
			'order': order,
			'start': (page - 1) * Number(this.config.get('config_pagination_admin')),
			'limit': this.config.get('config_pagination_admin')
		};

		this.load.model('catalog/download', this);

		const download_total = await this.model_catalog_download.getTotalDownloads();

		const results = await this.model_catalog_download.getDownloads(filter_data);

		for (let result of results) {
			data['downloads'].push({
				'download_id': result['download_id'],
				'name': result['name'],
				'date_added': date(this.language.get('date_format_short'), strtotime(result['date_added'])),
				'edit': this.url.link('catalog/download.form', 'user_token=' + this.session.data['user_token'] + '&download_id=' + result['download_id'] + url)
			});
		}

		url = '';

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		data['sort_name'] = this.url.link('catalog/download.list', 'user_token=' + this.session.data['user_token'] + '&sort=dd.name' + url);
		data['sort_date_added'] = this.url.link('catalog/download.list', 'user_token=' + this.session.data['user_token'] + '&sort=d.date_added' + url);

		url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': download_total,
			'page': page,
			'limit': this.config.get('config_pagination_admin'),
			'url': this.url.link('catalog/download.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (download_total) ? ((page - 1) * Number(this.config.get('config_pagination_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_pagination_admin'))) > (download_total - this.config.get('config_pagination_admin'))) ? download_total : (((page - 1) * Number(this.config.get('config_pagination_admin'))) + this.config.get('config_pagination_admin')), download_total, Math.ceil(download_total / this.config.get('config_pagination_admin')));

		data['sort'] = sort;
		data['order'] = order;

		return await this.load.view('catalog/download_list', data);
	}

	/**
	 * @return void
	 */
	async form() {
		const data = {};
		await this.load.language('catalog/download');

		this.document.setTitle(this.language.get('heading_title'));

		data['text_form'] = !(this.request.get['download_id']) ? this.language.get('text_add') : this.language.get('text_edit');

		// Use the ini_get('upload_max_filesize') for the max file size
		data['error_upload_size'] = sprintf(this.language.get('error_upload_size'), process.env.UPLOAD_MAX_FILESIZE || '2M');

		data['config_file_max_size'] = ((process.env.UPLOAD_MAX_FILESIZE || '2M').replace(/[^0-9]/g, '') * 1024 * 1024);

		let url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': this.url.link('catalog/download', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['save'] = this.url.link('catalog/download.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = this.url.link('catalog/download', 'user_token=' + this.session.data['user_token'] + url);
		data['upload'] = this.url.link('catalog/download.upload', 'user_token=' + this.session.data['user_token']);
		let download_info;
		if ((this.request.get['download_id'])) {
			this.load.model('catalog/download', this);

			download_info = await this.model_catalog_download.getDownload(this.request.get['download_id']);
		}

		if ((this.request.get['download_id'])) {
			data['download_id'] = this.request.get['download_id'];
		} else {
			data['download_id'] = 0;
		}

		this.load.model('localisation/language', this);

		data['languages'] = await this.model_localisation_language.getLanguages();

		if ((this.request.get['download_id'])) {
			data['download_description'] = await this.model_catalog_download.getDescriptions(this.request.get['download_id']);
		} else {
			data['download_description'] = [];
		}

		if ((download_info)) {
			data['filename'] = download_info['filename'];
		} else {
			data['filename'] = '';
		}

		if ((download_info)) {
			data['mask'] = download_info['mask'];
		} else {
			data['mask'] = '';
		}

		data['report'] = await this.getReport();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('catalog/download_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('catalog/download');

		const json = { error: {} };

		if (!await this.user.hasPermission('modify', 'catalog/download')) {
			json['error']['warning'] = this.language.get('error_permission');
		}

		for (let [language_id, value] of Object.entries(this.request.post['download_description'])) {
			if ((oc_strlen(trim(value['name'])) < 3) || (oc_strlen(value['name']) > 64)) {
				json['error']['name_' + language_id] = this.language.get('error_name');
			}
		}

		if ((oc_strlen(this.request.post['filename']) < 3) || (oc_strlen(this.request.post['filename']) > 128)) {
			json['error']['filename'] = this.language.get('error_filename');
		}

		if (fs.realpathSync(DIR_DOWNLOAD + this.request.post['filename']).replaceAll('\\', '/').substring(0, DIR_DOWNLOAD.length) != DIR_DOWNLOAD) {
			json['error']['filename'] = this.language.get('error_directory');
		}

		if (!fs.existsSync(DIR_DOWNLOAD + this.request.post['filename'])) {
			json['error']['filename'] = this.language.get('error_exists');
		}

		if (preg_match('/[^a-zA-Z0-9\/._-]|[\p{Cyrillic}]+/u', this.request.post['filename'])) {
			json['error']['filename'] = this.language.get('error_filename_character');
		}

		if ((oc_strlen(this.request.post['mask']) < 3) || (oc_strlen(this.request.post['mask']) > 128)) {
			json['error']['mask'] = this.language.get('error_mask');
		}

		if (preg_match('/[^a-zA-Z0-9\/._-]|[\p{Cyrillic}]+/u', this.request.post['mask'])) {
			json['error']['mask'] = this.language.get('error_mask_character');
		}

		if (Object.keys(json['error']).length && !(json['error']['warning'])) {
			json['error']['warning'] = this.language.get('error_warning');
		}
		this.request.post['download_id'] = Number(this.request.post['download_id']);
		if (!Object.keys(json.error).length) {
			this.load.model('catalog/download', this);

			if (!this.request.post['download_id']) {
				json['download_id'] = await this.model_catalog_download.addDownload(this.request.post);
			} else {
				await this.model_catalog_download.editDownload(this.request.post['download_id'], this.request.post);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async delete() {
		await this.load.language('catalog/download');

		const json = {};

		let selected = [];
		if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		}

		if (!await this.user.hasPermission('modify', 'catalog/download')) {
			json['error'] = this.language.get('error_permission');
		}

		this.load.model('catalog/product', this);

		for (let download_id of selected) {
			const product_total = await this.model_catalog_product.getTotalProductsByDownloadId(download_id);

			if (product_total) {
				json['error'] = sprintf(this.language.get('error_product'), product_total);
			}
		}

		if (!Object.keys(json).length) {
			this.load.model('catalog/download', this);

			for (let download_id of selected) {
				await this.model_catalog_download.deleteDownload(download_id);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async report() {
		await this.load.language('catalog/download');

		this.response.setOutput(await this.getReport());
	}

	/**
	 * @return string
	 */
	async getReport() {
		const data = {};
		let download_id = 0;
		if ((this.request.get['download_id'])) {
			download_id = this.request.get['download_id'];
		}
		let page = 1;
		if ((this.request.get['page']) && this.request.get['route'] == 'catalog/download.report') {
			page = Number(this.request.get['page']);
		}

		let limit = 10;

		data['reports'] = [];

		this.load.model('catalog/download', this);
		this.load.model('customer/customer', this);
		this.load.model('setting/store', this);

		const results = await this.model_catalog_download.getReports(download_id, (page - 1) * limit, limit);

		for (let result of results) {
			const store_info = await this.model_setting_store.getStore(result['store_id']);
			let store = '';
			if (store_info && store_info.store_id) {
				store = store_info['name'];
			} else if (!result['store_id']) {
				store = this.config.get('config_name');
			}

			data['reports'].push({
				'ip': result['ip'],
				'account': await this.model_customer_customer.getTotalCustomersByIp(result['ip']),
				'store': store,
				'country': result['country'],
				'date_added': date(this.language.get('datetime_format'), strtotime(result['date_added'])),
				'filter_ip': this.url.link('customer/customer', 'user_token=' + this.session.data['user_token'] + '&filter_ip=' + result['ip'])
			});
		}

		const report_total = await this.model_catalog_download.getTotalReports(download_id);

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': report_total,
			'page': page,
			'limit': limit,
			'url': this.url.link('catalog/download.report', 'user_token=' + this.session.data['user_token'] + '&download_id=' + download_id + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (report_total) ? ((page - 1) * limit) + 1 : 0, (((page - 1) * limit) > (report_total - limit)) ? report_total : (((page - 1) * limit) + limit), report_total, Math.ceil(report_total / limit));

		return await this.load.view('catalog/download_report', data);
	}

	/**
	 * @return void
	 */
	async upload() {
		await this.load.language('catalog/download');

		const json = {};

		// Check user has permission
		if (!await this.user.hasPermission('modify', 'catalog/download')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!(this.request.files['file']['name'])) {
			json['error'] = this.language.get('error_upload');
		}
		let filename = '';
		if (!Object.keys(json).length) {
			// Sanitize the filename
			filename = expressPath.basename(html_entity_decode(this.request.files['file']['name']));

			// Validate the filename length
			if ((oc_strlen(filename) < 3) || (oc_strlen(filename) > 128)) {
				json['error'] = this.language.get('error_filename');
			}

			// Allowed file extension types
			let allowed = [];

			let extension_allowed = this.config.get('config_file_ext_allowed').replace('~\r?\n~', "\n");

			let filetypes = extension_allowed.split("\n");

			for (let filetype of filetypes) {
				allowed.push(filetype.trim());
			}
			if (!allowed.includes(filename.split('.').pop().toLowerCase())) {
				json['error'] = this.language.get('error_file_type');
			}

			// Allowed file mime types
			allowed = [];

			let mime_allowed = this.config.get('config_file_mime_allowed').replace('~\r?\n~', "\n");

			filetypes = mime_allowed.split("\n");

			for (let filetype of filetypes) {
				allowed.push(filetype.trim());
			}

			if (!allowed.includes(this.request.files['file']['mimetype'])) {
				json['error'] = this.language.get('error_file_type');
			}

			// Return any upload error
			// if (this.request.files['file']['error'] != UPLOAD_ERR_OK) {
			// 	json['error'] = this.language.get('error_upload_' + this.request.files['file']['error']);
			// }
		}

		if (!Object.keys(json).length) {
			let file = filename + '.' + oc_token(32);

			await uploadFile(this.request.files['file'], DIR_DOWNLOAD + file);

			json['filename'] = file;
			json['mask'] = filename;

			json['success'] = this.language.get('text_upload');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async download() {
		await this.load.language('catalog/download');
		let filename = '';
		if ((this.request.get['filename'])) {
			filename = expressPath.basename(this.request.get['filename']);
		}
		let file = DIR_DOWNLOAD + filename;

		if (fs.existsSync(file) && fs.lstatSync(file).isFile()) {
			this.response.headers = [];
			this.response.addHeader('Content-Disposition: attachment; filename=' + filename);
			this.response.addHeader('Content-Transfer-Encoding :binary');
			this.response.addHeader('Content-Type :application/octet-stream');
			this.response.setFile(file)
		} else {
			await this.load.language('error/not_found');

			this.document.setTitle(this.language.get('heading_title'));

			data['breadcrumbs'] = [];

			data['breadcrumbs'].push({
				'text': this.language.get('text_home'),
				'href': this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
			});

			data['breadcrumbs'].push({
				'text': this.language.get('heading_title'),
				'href': this.url.link('error/not_found', 'user_token=' + this.session.data['user_token'])
			});

			data['header'] = await this.load.controller('common/header');
			data['column_left'] = await this.load.controller('common/column_left');
			data['footer'] = await this.load.controller('common/footer');

			this.response.setOutput(await this.load.view('error/not_found', data));
		}
	}

	/**
	 * @return void
	 */
	async autocomplete() {
		let json = [];

		if ((this.request.get['filter_name'])) {
			this.load.model('catalog/download', this);

			let filter_data = {
				'filter_name': this.request.get['filter_name'],
				'start': 0,
				'limit': 5
			};

			const results = await this.model_catalog_download.getDownloads(filter_data);

			for (let result of results) {
				json.push({
					'download_id': result['download_id'],
					'name': strip_tags(html_entity_decode(result['name']))
				});
			}
		}

		let sort_order = [];

		for (let [key, value] of json) {
			sort_order[key] = value['name'];
		}

		// json = multiSort(json, sort_order, 'ASC');
		json = json.sort((a, b) => a.name - b.name);

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
