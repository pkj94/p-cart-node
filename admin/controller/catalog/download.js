module.exports = class ControllerCatalogDownload extends Controller {
	error = {};

	async index() {
		await this.load.language('catalog/download');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/download', this);

		await this.getList();
	}

	async add() {
		await this.load.language('catalog/download');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/download', this);

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_catalog_download.addDownload(this.request.post);

			this.session.data['success'] = this.language.get('text_success');

			url = '';

			if ((this.request.get['sort'])) {
				url += '&sort=' + this.request.get['sort'];
			}

			if ((this.request.get['order'])) {
				url += '&order=' + this.request.get['order'];
			}

			if ((this.request.get['page'])) {
				url += '&page=' + this.request.get['page'];
			}

			this.response.setRedirect(await this.url.link('catalog/download', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async edit() {
		await this.load.language('catalog/download');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/download', this);

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_catalog_download.editDownload(this.request.get['download_id'], this.request.post);

			this.session.data['success'] = this.language.get('text_success');

			url = '';

			if ((this.request.get['sort'])) {
				url += '&sort=' + this.request.get['sort'];
			}

			if ((this.request.get['order'])) {
				url += '&order=' + this.request.get['order'];
			}

			if ((this.request.get['page'])) {
				url += '&page=' + this.request.get['page'];
			}

			this.response.setRedirect(await this.url.link('catalog/download', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async delete() {
		await this.load.language('catalog/download');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/download', this);

		if ((this.request.post['selected']) && await this.validateDelete()) {
			this.request.post['selected'] = Array.isArray(this.request.post['selected']) ? this.request.post['selected'] : [this.request.post['selected']]
			for (let download_id of this.request.post['selected']) {
				await this.model_catalog_download.deleteDownload(download_id);
			}

			this.session.data['success'] = this.language.get('text_success');

			url = '';

			if ((this.request.get['sort'])) {
				url += '&sort=' + this.request.get['sort'];
			}

			if ((this.request.get['order'])) {
				url += '&order=' + this.request.get['order'];
			}

			if ((this.request.get['page'])) {
				url += '&page=' + this.request.get['page'];
			}

			this.response.setRedirect(await this.url.link('catalog/download', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getList();
	}

	async getList() {
		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		} else {
			sort = 'dd.name';
		}

		if ((this.request.get['order'])) {
			order = this.request.get['order'];
		} else {
			order = 'ASC';
		}

		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		} else {
			page = 1;
		}

		url = '';

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
			'href': await this.url.link('catalog/download', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		data['add'] = await this.url.link('catalog/download/add', 'user_token=' + this.session.data['user_token'] + url, true);
		data['delete'] = await this.url.link('catalog/download/delete', 'user_token=' + this.session.data['user_token'] + url, true);

		data['downloads'] = {};

		filter_data = array(
			'sort'  : sort,
			'order' : order,
			'start' : (page - 1) * Number(this.config.get('config_limit_admin')),
			'limit' : Number(this.config.get('config_limit_admin'))
		});

	download_total = await this.model_catalog_download.getTotalDownloads();

	results = await this.model_catalog_download.getDownloads(filter_data);

	for(let result of results) {
		data['downloads'].push({
			'download_id': result['download_id'],
			'name': result['name'],
			'date_added': date(this.language.get('date_format_short'), strtotime(result['date_added'])),
			'edit': await this.url.link('catalog/download/edit', 'user_token=' + this.session.data['user_token'] + '&download_id=' + result['download_id'] + url, true)
		});
	}

	if((this.error['warning'])) {
	data['error_warning'] = this.error['warning'];
} else {
	data['error_warning'] = '';
}

if ((this.session.data['success'])) {
	data['success'] = this.session.data['success'];

	delete this.session.data['success']);
} else {
	data['success'] = '';
}

if ((this.request.post['selected'])) {
	data['selected'] = this.request.post['selected'];
} else {
	data['selected'] = [];
}

url = '';

if (order == 'ASC') {
	url += '&order=DESC';
} else {
	url += '&order=ASC';
}

if ((this.request.get['page'])) {
	url += '&page=' + this.request.get['page'];
}

data['sort_name'] = await this.url.link('catalog/download', 'user_token=' + this.session.data['user_token'] + '&sort=dd.name' + url, true);
data['sort_date_added'] = await this.url.link('catalog/download', 'user_token=' + this.session.data['user_token'] + '&sort=d.date_added' + url, true);

url = '';

if ((this.request.get['sort'])) {
	url += '&sort=' + this.request.get['sort'];
}

if ((this.request.get['order'])) {
	url += '&order=' + this.request.get['order'];
}

pagination = new Pagination();
pagination.total = download_total;
pagination.page = page;
pagination.limit = Number(this.config.get('config_limit_admin'));
pagination.url = await this.url.link('catalog/download', 'user_token=' + this.session.data['user_token'] + url + '&page={page}', true);

data['pagination'] = pagination.render();

data['results'] = sprintf(this.language.get('text_pagination'), (download_total) ? ((page - 1) * Number(this.config.get('config_limit_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_limit_admin'))) > (download_total - Number(this.config.get('config_limit_admin')))) ? download_total : (((page - 1) * Number(this.config.get('config_limit_admin'))) + Number(this.config.get('config_limit_admin'))), download_total, Math.ceil(download_total / Number(this.config.get('config_limit_admin'))));

data['sort'] = sort;
data['order'] = order;

data['header'] = await this.load.controller('common/header');
data['column_left'] = await this.load.controller('common/column_left');
data['footer'] = await this.load.controller('common/footer');

this.response.setOutput(await this.load.view('catalog/download_list', data));
	}

	async getForm() {
	data['text_form'] = !(this.request.get['download_id']) ? this.language.get('text_add') : this.language.get('text_edit');

	if ((this.error['warning'])) {
		data['error_warning'] = this.error['warning'];
	} else {
		data['error_warning'] = '';
	}

	if ((this.error['name'])) {
		data['error_name'] = this.error['name'];
	} else {
		data['error_name'] = {};
	}

	if ((this.error['filename'])) {
		data['error_filename'] = this.error['filename'];
	} else {
		data['error_filename'] = '';
	}

	if ((this.error['mask'])) {
		data['error_mask'] = this.error['mask'];
	} else {
		data['error_mask'] = '';
	}

	url = '';

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
		'href': await this.url.link('catalog/download', 'user_token=' + this.session.data['user_token'] + url, true)
	});

	if (!(this.request.get['download_id'])) {
		data['action'] = await this.url.link('catalog/download/add', 'user_token=' + this.session.data['user_token'] + url, true);
	} else {
		data['action'] = await this.url.link('catalog/download/edit', 'user_token=' + this.session.data['user_token'] + '&download_id=' + this.request.get['download_id'] + url, true);
	}

	data['cancel'] = await this.url.link('catalog/download', 'user_token=' + this.session.data['user_token'] + url, true);

	this.load.model('localisation/language', this);

	data['languages'] = await this.model_localisation_language.getLanguages();

	if ((this.request.get['download_id']) && (this.request.server['method'] != 'POST')) {
		download_info = await this.model_catalog_download.getDownload(this.request.get['download_id']);
	}

	data['user_token'] = this.session.data['user_token'];

	if ((this.request.get['download_id'])) {
		data['download_id'] = this.request.get['download_id'];
	} else {
		data['download_id'] = 0;
	}

	if ((this.request.post['download_description'])) {
		data['download_description'] = this.request.post['download_description'];
	} else if ((this.request.get['download_id'])) {
		data['download_description'] = await this.model_catalog_download.getDownloadDescriptions(this.request.get['download_id']);
	} else {
		data['download_description'] = {};
	}

	if ((this.request.post['filename'])) {
		data['filename'] = this.request.post['filename'];
	} else if ((download_info)) {
		data['filename'] = download_info['filename'];
	} else {
		data['filename'] = '';
	}

	if ((this.request.post['mask'])) {
		data['mask'] = this.request.post['mask'];
	} else if ((download_info)) {
		data['mask'] = download_info['mask'];
	} else {
		data['mask'] = '';
	}

	data['header'] = await this.load.controller('common/header');
	data['column_left'] = await this.load.controller('common/column_left');
	data['footer'] = await this.load.controller('common/footer');

	this.response.setOutput(await this.load.view('catalog/download_form', data));
}

	async validateForm() {
	if (!await this.user.hasPermission('modify', 'catalog/download')) {
		this.error['warning'] = this.language.get('error_permission');
	}

	for (this.request.post['download_description'] of language_id : value) {
		if ((oc_strlen(value['name']) < 3) || (oc_strlen(value['name']) > 64)) {
			this.error['name'][language_id] = this.language.get('error_name');
		}
	}

	if ((oc_strlen(this.request.post['filename']) < 3) || (oc_strlen(this.request.post['filename']) > 128)) {
		this.error['filename'] = this.language.get('error_filename');
	}

	if (!is_file(DIR_DOWNLOAD + this.request.post['filename'])) {
		this.error['filename'] = this.language.get('error_exists');
	}

	if ((oc_strlen(this.request.post['mask']) < 3) || (oc_strlen(this.request.post['mask']) > 128)) {
		this.error['mask'] = this.language.get('error_mask');
	}

	return Object.keys(this.error).length ? false : true
}

	async validateDelete() {
	if (!await this.user.hasPermission('modify', 'catalog/download')) {
		this.error['warning'] = this.language.get('error_permission');
	}

	this.load.model('catalog/product', this);

	for (let download_id of this.request.post['selected']) {
		product_total = await this.model_catalog_product.getTotalProductsByDownloadId(download_id);

		if (product_total) {
			this.error['warning'] = sprintf(this.language.get('error_product'), product_total);
		}
	}

	return Object.keys(this.error).length ? false : true
}

	async upload() {
	await this.load.language('catalog/download');

	json = {};

	// Check user has permission
	if (!await this.user.hasPermission('modify', 'catalog/download')) {
		json['error'] = this.language.get('error_permission');
	}

	if (!json) {
		if ((this.request.files['file']['name']) && is_file(this.request.files['file']['tmp_name'])) {
			// Sanitize the filename
			filename = basename(html_entity_decode(this.request.files['file']['name']));

			// Validate the filename length
			if ((oc_strlen(filename) < 3) || (oc_strlen(filename) > 128)) {
				json['error'] = this.language.get('error_filename');
			}

			// Allowed file extension types
			allowed = {};

			extension_allowed = preg_replace('~\r?\n~', "\n", this.config.get('config_file_ext_allowed'));

			filetypes = explode("\n", extension_allowed);

			for (filetypes of filetype) {
				allowed.push(trim(filetype);
			}

			if (!in_array(strtolower(substr(strrchr(filename, '.'), 1)), allowed)) {
				json['error'] = this.language.get('error_filetype');
			}

			// Allowed file mime types
			allowed = {};

			mime_allowed = preg_replace('~\r?\n~', "\n", this.config.get('config_file_mime_allowed'));

			filetypes = explode("\n", mime_allowed);

			for (filetypes of filetype) {
				allowed.push(trim(filetype);
			}

			if (!in_array(this.request.files['file']['type'], allowed)) {
				json['error'] = this.language.get('error_filetype');
			}

			// Check to see if any PHP files are trying to be uploaded
			content = file_get_contents(this.request.files['file']['tmp_name']);

			if (preg_match('/\<\?php/i', content)) {
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

	if (!json) {
		file = filename + '.' + token(32);

		move_uploaded_file(this.request.files['file']['tmp_name'], DIR_DOWNLOAD + file);

		json['filename'] = file;
		json['mask'] = filename;

		json['success'] = this.language.get('text_upload');
	}

	this.response.addHeader('Content-Type: application/json');
	this.response.setOutput(json);
}

	async autocomplete() {
	json = {};

	if ((this.request.get['filter_name'])) {
		this.load.model('catalog/download', this);

		filter_data = array(
			'filter_name' : this.request.get['filter_name'],
			'start'       : 0,
			'limit'       : 5
			});

	results = await this.model_catalog_download.getDownloads(filter_data);

	for (let result of results) {
		json.push({
			'download_id': result['download_id'],
			'name': strip_tags(html_entity_decode(result['name']))
		});
	}
}

sort_order = {};

for (json of key : value) {
	sort_order[key] = value['name'];
}

array_multisort(sort_order, SORT_ASC, json);

this.response.addHeader('Content-Type: application/json');
this.response.setOutput(json);
	}
}