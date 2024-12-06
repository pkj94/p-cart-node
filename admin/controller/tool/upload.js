module.exports = class ControllerToolUpload extends Controller {
	error = {};

	async index() {
		await this.load.language('tool/upload');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('tool/upload', this);

		await this.getList();
	}

	async delete() {
		await this.load.language('tool/upload');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('tool/upload', this);

		if ((this.request.post['selected']) && await this.validateDelete()) {
			this.request.post['selected'] = Array.isArray(this.request.post['selected']) ? this.request.post['selected'] : [this.request.post['selected']]
			for (let upload_id of this.request.post['selected']) {
				// Remove file before deleting DB record.
				const upload_info = await this.model_tool_upload.getUpload(upload_id);

				if (upload_info && is_file(DIR_UPLOAD + upload_info['filename'])) {
					fs.unlinkSync(DIR_UPLOAD + upload_info['filename']);
				}

				await this.model_tool_upload.deleteUpload(upload_id);
			}

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);

			let url = '';

			if ((this.request.get['filter_name'])) {
				url += '&filter_name=' + encodeURIComponent(html_entity_decode(this.request.get['filter_name']));
			}

			if ((this.request.get['filter_date_added'])) {
				url += '&filter_date_added=' + this.request.get['filter_date_added'];
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

			this.response.setRedirect(await this.url.link('tool/upload', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getList();
	}

	async getList() {
		const data = {};
		let filter_name = '';
		if ((this.request.get['filter_name'])) {
			filter_name = this.request.get['filter_name'];
		}
		let filter_date_added = '';
		if ((this.request.get['filter_date_added'])) {
			filter_date_added = this.request.get['filter_date_added'];
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

		if ((this.request.get['filter_date_added'])) {
			url += '&filter_date_added=' + this.request.get['filter_date_added'];
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

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('tool/upload', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		data['delete'] = await this.url.link('tool/upload/delete', 'user_token=' + this.session.data['user_token'] + url, true);

		data['uploads'] = [];

		const filter_data = {
			'filter_name': filter_name,
			'filter_date_added': filter_date_added,
			'sort': sort,
			'order': order,
			'start': (page - 1) * Number(this.config.get('config_limit_admin')),
			'limit': Number(this.config.get('config_limit_admin'))
		};

		const upload_total = await this.model_tool_upload.getTotalUploads(filter_data);

		const results = await this.model_tool_upload.getUploads(filter_data);

		for (let result of results) {
			data['uploads'].push({
				'upload_id': result['upload_id'],
				'name': result['name'],
				'filename': result['filename'],
				'date_added': date(this.language.get('date_format_short'), new Date(result['date_added'])),
				'download': await this.url.link('tool/upload/download', 'user_token=' + this.session.data['user_token'] + '&code=' + result['code'] + url, true)
			});
		}

		data['user_token'] = this.session.data['user_token'];

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else if ((this.session.data['error'])) {
			data['error_warning'] = this.session.data['error'];

			delete this.session.data['error'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.session.data['success'])) {
			data['success'] = this.session.data['success'];

			delete this.session.data['success'];
		} else {
			data['success'] = '';
		}

		if ((this.request.post['selected'])) {
			data['selected'] = this.request.post['selected'];
		} else {
			data['selected'] = [];
		}

		url = '';

		if ((this.request.get['filter_name'])) {
			url += '&filter_name=' + encodeURIComponent(html_entity_decode(this.request.get['filter_name']));
		}

		if ((this.request.get['filter_date_added'])) {
			url += '&filter_date_added=' + this.request.get['filter_date_added'];
		}

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['sort_name'] = await this.url.link('tool/upload', 'user_token=' + this.session.data['user_token'] + '&sort=name' + url, true);
		data['sort_filename'] = await this.url.link('tool/upload', 'user_token=' + this.session.data['user_token'] + '&sort=filename' + url, true);
		data['sort_date_added'] = await this.url.link('tool/upload', 'user_token=' + this.session.data['user_token'] + '&sort=date_added' + url, true);

		url = '';

		if ((this.request.get['filter_name'])) {
			url += '&filter_name=' + encodeURIComponent(html_entity_decode(this.request.get['filter_name']));
		}

		if ((this.request.get['filter_date_added'])) {
			url += '&filter_date_added=' + this.request.get['filter_date_added'];
		}

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		const pagination = new Pagination();
		pagination.total = upload_total;
		pagination.page = page;
		pagination.limit = Number(this.config.get('config_limit_admin'));
		pagination.url = await this.url.link('tool/upload', 'user_token=' + this.session.data['user_token'] + url + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (upload_total) ? ((page - 1) * Number(this.config.get('config_limit_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_limit_admin'))) > (upload_total - Number(this.config.get('config_limit_admin')))) ? upload_total : (((page - 1) * Number(this.config.get('config_limit_admin'))) + Number(this.config.get('config_limit_admin'))), upload_total, Math.ceil(upload_total / Number(this.config.get('config_limit_admin'))));

		data['filter_name'] = filter_name;
		data['filter_date_added'] = filter_date_added;

		data['sort'] = sort;
		data['order'] = order;

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');
		await this.session.save(this.session.data);
		this.response.setOutput(await this.load.view('tool/upload', data));
	}

	async validateDelete() {
		if (!await this.user.hasPermission('modify', 'tool/upload')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length ? false : true
	}

	async download() {
		this.load.model('tool/upload', this);

		await this.load.language('tool/upload');
		let code = 0;
		if ((this.request.get['code'])) {
			code = this.request.get['code'];
		}

		let url = '';

		if ((this.request.get['filter_name'])) {
			url += '&filter_name=' + encodeURIComponent(html_entity_decode(this.request.get['filter_name']));
		}

		if ((this.request.get['filter_date_added'])) {
			url += '&filter_date_added=' + this.request.get['filter_date_added'];
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

		const upload_info = await this.model_tool_upload.getUploadByCode(code);

		if (upload_info.upload_id) {
			let file = DIR_UPLOAD + upload_info['filename'];
			let mask = expressPath.basename(upload_info['name']);

			if (is_file(file) && fs.statSync(file).size > 0) {
				this.response.addHeader('Pragma: public');
				this.response.addHeader('Expires: 0');
				this.response.addHeader('Content-Description: File Transfer');
				this.response.addHeader('Content-Type: application/octet-stream');
				this.response.addHeader('Content-Disposition: attachment; filename="' + (mask ? mask : expressPath.basename(file)) + '"');
				this.response.addHeader('Content-Transfer-Encoding: binary');

				this.response.setFile(file);
			} else {
				this.session.data['error'] = this.language.get('error_file');
				await this.session.save(this.session.data);
				this.response.setRedirect(await this.url.link('tool/upload', 'user_token=' + this.session.data['user_token'] + url, true));
			}
		} else {
			this.session.data['error'] = this.language.get('error_upload');
			await this.session.save(this.session.data);
			this.response.setRedirect(await this.url.link('tool/upload', 'user_token=' + this.session.data['user_token'] + url, true));
		}
	}

	async upload() {
		await this.load.language('sale/order');

		const json = {};

		// Check user has permission
		if (!await this.user.hasPermission('modify', 'tool/upload')) {
			json['error'] = this.language.get('error_permission');
		}
		let filename = '';
		if (!json.error) {
			if ((this.request.files['file']['name'])) {
				// Sanitize the filename
				filename = html_entity_decode(this.request.files['file']['name']);

				if ((oc_strlen(filename) < 3) || (oc_strlen(filename) > 128)) {
					json['error'] = this.language.get('error_filename');
				}

				// Allowed file extension types
				let allowed = [];

				const extension_allowed = this.config.get('config_file_ext_allowed').replace(/\r?\n/g, "\n");

				const filetypes = extension_allowed.split("\n");

				for (let filetype of filetypes) {
					allowed.push(filetype.trim());
				}

				let fileExtension = filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase(); // Check if the file extension is allowed 
				if (!allowed.includes(fileExtension)) {
					json['error'] = this.language.get('error_filetype');
				}

				// Allowed file mime types
				allowed = [];

				const mime_allowed = this.config.get('config_file_mime_allowed').replace(/\r?\n/g, '\n');

				filetypes = mime_allowed.split("\n");

				for (let filetype of filetypes) {
					allowed.push(filetype.trim());
				}

				if (!allowed.includes(this.request.files['file']['type'])) {
					json['error'] = this.language.get('error_filetype');
				}

				// Check to see if any PHP files are trying to be uploaded
				// content = fs.readFileSync(this.request.files['file']['tmp_name']);

				// if (preg_match('/\<\?php/i', content)) {
				// 	json['error'] = this.language.get('error_filetype');
				// }

				// Return any upload error
				// if (this.request.files['file']['error'] != UPLOAD_ERR_OK) {
				// 	json['error'] = this.language.get('error_upload_' + this.request.files['file']['error']);
				// }
			} else {
				json['error'] = this.language.get('error_upload');
			}
		}

		if (!json.error) {
			let file = filename + '.' + token(32);
			try {
				await uploadFile(this.request.files['file'], DIR_UPLOAD + file);
				// Hide the uploaded file name so people can not link to it directly.
				this.load.model('tool/upload', this);

				json['code'] = await this.model_tool_upload.addUpload(filename, file);

				json['success'] = this.language.get('text_upload');
			} catch (e) {
				json['error'] = this.language.get('error_upload_' + this.request.files['file']['error']);
			}

		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}