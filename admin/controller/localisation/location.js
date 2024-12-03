module.exports = class ControllerLocalisationLocation extends Controller {
	error = {};

	async index() {
		const data = {};
		await this.load.language('localisation/location');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('localisation/location');

		await this.getList();
	}

	async add() {
		await this.load.language('localisation/location');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('localisation/location');

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_localisation_location.addLocation(this.request.post);

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);

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

			this.response.setRedirect(await this.url.link('localisation/location', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async edit() {
		await this.load.language('localisation/location');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('localisation/location');

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_localisation_location.editLocation(this.request.get['location_id'], this.request.post);

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);

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

			this.response.setRedirect(await this.url.link('localisation/location', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async delete() {
		await this.load.language('localisation/location');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('localisation/location');

		if ((this.request.post['selected']) && await this.validateDelete()) {
			this.request.post['selected'] = Array.isArray(this.request.post['selected']) ? this.request.post['selected'] : [this.request.post['selected']]
			for (let location_id of this.request.post['selected']) {
				await this.model_localisation_location.deleteLocation(location_id);
			}

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);

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

			this.response.setRedirect(await this.url.link('localisation/location', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getList();
	}

	async getList() {
		const data = {};
		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		} else {
			sort = 'name';
		}

		if ((this.request.get['order'])) {
			order = this.request.get['order'];
		} else {
			order = 'ASC';
		}
		page = 1;
		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
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

		data['breadcrumbs'] = {};

		data['breadcrumbs'].push(array(
			'text' : this.language.get('text_home'),
			'href' : await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push(array(
				'text' : this.language.get('heading_title'),
				'href' : await this.url.link('localisation/location', 'user_token=' + this.session.data['user_token'] + url, true)
		});

data['add'] = await this.url.link('localisation/location/add', 'user_token=' + this.session.data['user_token'] + url, true);
data['delete'] = await this.url.link('localisation/location/delete', 'user_token=' + this.session.data['user_token'] + url, true);

data['locations'] = {};

const filter_data = {
	'sort': sort,
	'order': order,
	'start': (page - 1) * Number(this.config.get('config_limit_admin')),
	'limit': Number(this.config.get('config_limit_admin'))
});

location_total = await this.model_localisation_location.getTotalLocations();

results = await this.model_localisation_location.getLocations(filter_data);

for (let result of results) {
	data['locations'].push(array(
		'location_id' : result['location_id'],
		'name'        : result['name'],
		'address'     : result['address'],
		'edit'        : await this.url.link('localisation/location/edit', 'user_token=' + this.session.data['user_token'] + '&location_id=' + result['location_id'] + url, true)
			});
		}

if ((this.error['warning'])) {
	data['error_warning'] = this.error['warning'];
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

if (order == 'ASC') {
	url += '&order=DESC';
} else {
	url += '&order=ASC';
}

if ((this.request.get['page'])) {
	url += '&page=' + this.request.get['page'];
}

data['sort_name'] = await this.url.link('localisation/location', 'user_token=' + this.session.data['user_token'] + '&sort=name' + url, true);
data['sort_address'] = await this.url.link('localisation/location', 'user_token=' + this.session.data['user_token'] + '&sort=address' + url, true);

url = '';

if ((this.request.get['sort'])) {
	url += '&sort=' + this.request.get['sort'];
}

if ((this.request.get['order'])) {
	url += '&order=' + this.request.get['order'];
}

const pagination = new Pagination();
pagination.total = location_total;
pagination.page = page;
pagination.limit = Number(this.config.get('config_limit_admin'));
pagination.url = await this.url.link('localisation/location', 'user_token=' + this.session.data['user_token'] + url + '&page={page}', true);

data['pagination'] = pagination.render();

data['results'] = sprintf(this.language.get('text_pagination'), (location_total) ? ((page - 1) * Number(this.config.get('config_limit_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_limit_admin'))) > (location_total - Number(this.config.get('config_limit_admin')))) ? location_total : (((page - 1) * Number(this.config.get('config_limit_admin'))) + Number(this.config.get('config_limit_admin'))), location_total, Math.ceil(location_total / Number(this.config.get('config_limit_admin'))));

data['sort'] = sort;
data['order'] = order;

data['header'] = await this.load.controller('common/header');
data['column_left'] = await this.load.controller('common/column_left');
data['footer'] = await this.load.controller('common/footer');

this.response.setOutput(await this.load.view('localisation/location_list', data));
	}

	async getForm() {
	data['text_form'] = !(this.request.get['location_id']) ? this.language.get('text_add') : this.language.get('text_edit');

	if ((this.error['warning'])) {
		data['error_warning'] = this.error['warning'];
	} else {
		data['error_warning'] = '';
	}

	if ((this.error['name'])) {
		data['error_name'] = this.error['name'];
	} else {
		data['error_name'] = '';
	}

	if ((this.error['address'])) {
		data['error_address'] = this.error['address'];
	} else {
		data['error_address'] = '';
	}

	if ((this.error['telephone'])) {
		data['error_telephone'] = this.error['telephone'];
	} else {
		data['error_telephone'] = '';
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
		'href': await this.url.link('localisation/location', 'user_token=' + this.session.data['user_token'] + url, true)
	});

	if (!(this.request.get['location_id'])) {
		data['action'] = await this.url.link('localisation/location/add', 'user_token=' + this.session.data['user_token'] + url, true);
	} else {
		data['action'] = await this.url.link('localisation/location/edit', 'user_token=' + this.session.data['user_token'] + '&location_id=' + this.request.get['location_id'] + url, true);
	}

	data['cancel'] = await this.url.link('localisation/location', 'user_token=' + this.session.data['user_token'] + url, true);

	if ((this.request.get['location_id']) && (this.request.server['method'] != 'POST')) {
		location_info = await this.model_localisation_location.getLocation(this.request.get['location_id']);
	}

	data['user_token'] = this.session.data['user_token'];

	this.load.model('setting/store', this);

	if ((this.request.post['name'])) {
		data['name'] = this.request.post['name'];
	} else if ((location_info)) {
		data['name'] = location_info['name'];
	} else {
		data['name'] = '';
	}

	if ((this.request.post['address'])) {
		data['address'] = this.request.post['address'];
	} else if ((location_info)) {
		data['address'] = location_info['address'];
	} else {
		data['address'] = '';
	}

	if ((this.request.post['geocode'])) {
		data['geocode'] = this.request.post['geocode'];
	} else if ((location_info)) {
		data['geocode'] = location_info['geocode'];
	} else {
		data['geocode'] = '';
	}

	if ((this.request.post['telephone'])) {
		data['telephone'] = this.request.post['telephone'];
	} else if ((location_info)) {
		data['telephone'] = location_info['telephone'];
	} else {
		data['telephone'] = '';
	}

	if ((this.request.post['fax'])) {
		data['fax'] = this.request.post['fax'];
	} else if ((location_info)) {
		data['fax'] = location_info['fax'];
	} else {
		data['fax'] = '';
	}

	if ((this.request.post['image'])) {
		data['image'] = this.request.post['image'];
	} else if ((location_info)) {
		data['image'] = location_info['image'];
	} else {
		data['image'] = '';
	}

	this.load.model('tool/image', this);

	if ((this.request.post['image']) && is_file(DIR_IMAGE + this.request.post['image'])) {
		data['thumb'] = await this.model_tool_image.resize(this.request.post['image'], 100, 100);
	} else if ((location_info) && is_file(DIR_IMAGE + location_info['image'])) {
		data['thumb'] = await this.model_tool_image.resize(location_info['image'], 100, 100);
	} else {
		data['thumb'] = await this.model_tool_image.resize('no_image.png', 100, 100);
	}

	data['placeholder'] = await this.model_tool_image.resize('no_image.png', 100, 100);

	if ((this.request.post['open'])) {
		data['open'] = this.request.post['open'];
	} else if ((location_info)) {
		data['open'] = location_info['open'];
	} else {
		data['open'] = '';
	}

	if ((this.request.post['comment'])) {
		data['comment'] = this.request.post['comment'];
	} else if ((location_info)) {
		data['comment'] = location_info['comment'];
	} else {
		data['comment'] = '';
	}

	data['header'] = await this.load.controller('common/header');
	data['column_left'] = await this.load.controller('common/column_left');
	data['footer'] = await this.load.controller('common/footer');

	this.response.setOutput(await this.load.view('localisation/location_form', data));
}

	async validateForm() {
	if (!await this.user.hasPermission('modify', 'localisation/location')) {
		this.error['warning'] = this.language.get('error_permission');
	}

	if ((oc_strlen(this.request.post['name']) < 3) || (oc_strlen(this.request.post['name']) > 32)) {
		this.error['name'] = this.language.get('error_name');
	}

	if ((oc_strlen(this.request.post['address']) < 3) || (oc_strlen(this.request.post['address']) > 128)) {
		this.error['address'] = this.language.get('error_address');
	}

	if ((oc_strlen(this.request.post['telephone']) < 3) || (oc_strlen(this.request.post['telephone']) > 32)) {
		this.error['telephone'] = this.language.get('error_telephone');
	}

	return Object.keys(this.error).length ? false : true
}

	async validateDelete() {
	if (!await this.user.hasPermission('modify', 'localisation/location')) {
		this.error['warning'] = this.language.get('error_permission');
	}

	return Object.keys(this.error).length ? false : true
}
}