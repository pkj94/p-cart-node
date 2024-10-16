const sprintf = require("locutus/php/strings/sprintf");
const fs = require('fs');
const expressPath = require('path');
module.exports = class UploadController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('tool/upload');

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
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('tool/upload', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['add'] = await this.url.link('tool/upload.form', 'user_token=' + this.session.data['user_token'] + url);
		data['delete'] = await this.url.link('tool/upload.delete', 'user_token=' + this.session.data['user_token']);

		data['list'] = await this.getList();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('tool/upload', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('tool/upload');

		this.response.setOutput(await this.getList());
	}

	/**
	 * @return string
	 */
	async getList() {
		const data = {};
		let filter_name = '';
		if ((this.request.get['filter_name'])) {
			filter_name = this.request.get['filter_name'];
		}

		let filter_date_from = '';
		if ((this.request.get['filter_date_from'])) {
			filter_date_from = this.request.get['filter_date_from'];
		}

		let filter_date_to = '';
		if ((this.request.get['filter_date_to'])) {
			filter_date_to = this.request.get['filter_date_to'];
		}
		let sort = 'date_added';
		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		}
		let order = 'DESC';
		if ((this.request.get['order'])) {
			order = this.request.get['order'];
		}

		let page = 1;
		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		}

		let url = '';

		if ((this.request.get['filter_name'])) {
			url += '&filter_name=' + encodeURIComponent(html_entity_decode(this.request.get['filter_name']));
		}

		if ((this.request.get['filter_date_from'])) {
			url += '&filter_date_from=' + this.request.get['filter_date_from'];
		}

		if ((this.request.get['filter_date_to'])) {
			url += '&filter_date_to=' + this.request.get['filter_date_to'];
		}

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['action'] = await this.url.link('tool/upload.list', 'user_token=' + this.session.data['user_token'] + url);

		data['uploads'] = [];

		let filter_data = {
			'filter_name': filter_name,
			'filter_date_from': filter_date_from,
			'filter_date_to': filter_date_to,
			'sort': sort,
			'order': order,
			'start': (page - 1) * Number(this.config.get('config_pagination_admin')),
			'limit': this.config.get('config_pagination_admin')
		};

		this.load.model('tool/upload', this);

		const upload_total = await this.model_tool_upload.getTotalUploads(filter_data);

		const results = await this.model_tool_upload.getUploads(filter_data);

		for (let result of results) {
			data['uploads'].push({
				'upload_id': result['upload_id'],
				'name': result['name'],
				'code': result['code'],
				'date_added': date(this.language.get('date_format_short'), new Date(result['date_added'])),
				'download': await this.url.link('tool/upload.download', 'user_token=' + this.session.data['user_token'] + '&code=' + result['code'] + url)
			});
		}

		url = '';

		if ((this.request.get['filter_name'])) {
			url += '&filter_name=' + encodeURIComponent(html_entity_decode(this.request.get['filter_name']));
		}

		if ((this.request.get['filter_date_from'])) {
			url += '&filter_date_from=' + this.request.get['filter_date_from'];
		}

		if ((this.request.get['filter_date_to'])) {
			url += '&filter_date_to=' + this.request.get['filter_date_to'];
		}

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['sort_name'] = await this.url.link('tool/upload.list', 'user_token=' + this.session.data['user_token'] + '&sort=name' + url);
		data['sort_code'] = await this.url.link('tool/upload.list', 'user_token=' + this.session.data['user_token'] + '&sort=code' + url);
		data['sort_date_added'] = await this.url.link('tool/upload.list', 'user_token=' + this.session.data['user_token'] + '&sort=date_added' + url);

		url = '';

		if ((this.request.get['filter_name'])) {
			url += '&filter_name=' + encodeURIComponent(html_entity_decode(this.request.get['filter_name']));
		}

		if ((this.request.get['filter_date_from'])) {
			url += '&filter_date_from=' + this.request.get['filter_date_from'];
		}

		if ((this.request.get['filter_date_to'])) {
			url += '&filter_date_to=' + this.request.get['filter_date_to'];
		}

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': upload_total,
			'page': page,
			'limit': this.config.get('config_pagination_admin'),
			'url': await this.url.link('tool/upload.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (upload_total) ? ((page - 1) * Number(this.config.get('config_pagination_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_pagination_admin'))) > (upload_total - this.config.get('config_pagination_admin'))) ? upload_total : (((page - 1) * Number(this.config.get('config_pagination_admin'))) + this.config.get('config_pagination_admin')), upload_total, Math.ceil(upload_total / this.config.get('config_pagination_admin')));

		data['filter_name'] = filter_name;
		data['filter_date_from'] = filter_date_from;
		data['filter_date_to'] = filter_date_to;

		data['sort'] = sort;
		data['order'] = order;

		return await this.load.view('tool/upload_list', data);
	}

	/**
	 * @return void
	 */
	async delete() {
		await this.load.language('tool/upload');

		const json = {};

		let selected = [];
		if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		}

		if (!await this.user.hasPermission('modify', 'tool/upload')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('tool/upload', this);

			for (let upload_id of selected) {
				// Remove file before deleting DB record.
				const upload_info = await this.model_tool_upload.getUpload(upload_id);

				if (upload_info.upload_id && fs.existsSync(DIR_UPLOAD + upload_info['filename'])) {
					fs.unlinkSync(DIR_UPLOAD + upload_info['filename']);
				}

				await this.model_tool_upload.deleteUpload(upload_id);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async download() {
		await this.load.language('tool/upload');
		let code = '';
		if ((this.request.get['code'])) {
			code = this.request.get['code'];
		}

		this.load.model('tool/upload', this);

		const upload_info = await this.model_tool_upload.getUploadByCode(code);

		if (upload_info.upload_id) {
			let file = DIR_UPLOAD + upload_info['filename'];
			let mask = expressPath.basename(upload_info['name']);

			// if (!headers_sent()) {
			if (fs.lstatSync(file).isFile()) {
				this.response.headers = [];
				this.response.addHeader('Content-Disposition: attachment; filename=' + (mask ? mask : expressPath.basename(file)));
				this.response.addHeader('Content-Transfer-Encoding :binary');
				this.response.addHeader('Content-Type :application/octet-stream');
				this.response.setFile(file)
			} else {
				exit(sprintf(this.language.get('error_not_found'), basename(file)));
			}
			// } else {
			// 	exit(this.language.get('error_headers_sent'));
			// }
		} else {
			await this.load.language('error/not_found');

			this.document.setTitle(this.language.get('heading_title'));

			data['breadcrumbs'] = [];

			data['breadcrumbs'].push({
				'text': this.language.get('text_home'),
				'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
			});

			data['breadcrumbs'].push({
				'text': this.language.get('heading_title'),
				'href': await this.url.link('error/not_found', 'user_token=' + this.session.data['user_token'])
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
	async upload() {
		await this.load.language('tool/upload');

		const json = {};

		// Check user has permission
		if (!await this.user.hasPermission('modify', 'tool/upload')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!(this.request.files['file']['name'])) {
			json['error'] = this.language.get('error_upload');
		}

		if (!Object.keys(json).length) {
			// Sanitize the filename
			let filename = expressPath.basename(html_entity_decode(this.request.files['file']['name']));

			// Validate the filename length
			if ((oc_strlen(filename) < 3) || (oc_strlen(filename) > 128)) {
				json['error'] = this.language.get('error_filename');
			}

			// Allowed file extension types
			let allowed = [];

			let extension_allowed = this.config.get('config_file_ext_allowed').replace(/\r?\n/g, '\n');

			let filetypes = extension_allowed.split("\n");

			for (let filetype of filetypes) {
				allowed.push(filetype.trim());
			}

			if (!allowed.includes(filename.split('.').pop().toLowerCase())) {
				json['error'] = this.language.get('error_file_type');
			}

			// Allowed file mime types
			allowed = [];

			let mime_allowed = this.config.get('config_file_mime_allowed').replace(/\r?\n/g, '\n');

			filetypes = mime_allowed.split("\n");

			for (let filetype of filetypes) {
				allowed.push(filetype.trim());
			}

			if (!allowed.includes(this.request.files['file']['mimetype'])) {
				json['error'] = this.language.get('error_file_type');
			}
		}

		if (!Object.keys(json).length) {
			let file = filename + '.' + oc_token(32);
			try {
				await uploadFile(this.request.files['file'], DIR_UPLOAD + file);
				// Hide the uploaded file name so people cannot link to it directly.
				this.load.model('tool/upload', this);

				json['code'] = await this.model_tool_upload.addUpload(filename, file);

				json['success'] = this.language.get('text_success');
			} catch (e) {
				json['error'] = this.language.get('error_upload_' + this.request.files['file']['error']);
			}

		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
