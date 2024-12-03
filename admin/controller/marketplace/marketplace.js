const str_replace = require('locutus/php/strings/str_replace');

module.exports = class ControllerMarketplaceMarketplace extends Controller {
	async index() {
		const data = {};
		await this.load.language('marketplace/marketplace');

		this.document.setTitle(this.language.get('heading_title'));
		let filter_search = '';
		if ((this.request.get['filter_search'])) {
			filter_search = this.request.get['filter_search'];
		}
		let filter_category = '';
		if ((this.request.get['filter_category'])) {
			filter_category = this.request.get['filter_category'];
		}
		let filter_license = '';
		if ((this.request.get['filter_license'])) {
			filter_license = this.request.get['filter_license'];
		}
		let filter_rating = '';
		if ((this.request.get['filter_rating'])) {
			filter_rating = this.request.get['filter_rating'];
		}
		let filter_member_type = '';
		if ((this.request.get['filter_member_type'])) {
			filter_member_type = this.request.get['filter_member_type'];
		}
		let filter_member = '';
		if ((this.request.get['filter_member'])) {
			filter_member = this.request.get['filter_member'];
		}
		let sort = 'date_modified';
		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		}
		let page = 1;
		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		}

		let url = '';

		if ((this.request.get['filter_search'])) {
			url += '&filter_search=' + this.request.get['filter_search'];
		}

		if ((this.request.get['filter_category'])) {
			url += '&filter_category=' + this.request.get['filter_category'];
		}

		if ((this.request.get['filter_license'])) {
			url += '&filter_license=' + this.request.get['filter_license'];
		}

		if ((this.request.get['filter_rating'])) {
			url += '&filter_rating=' + this.request.get['filter_rating'];
		}

		if ((this.request.get['filter_member_type'])) {
			url += '&filter_member_type=' + this.request.get['filter_member_type'];
		}

		if ((this.request.get['filter_member'])) {
			url += '&filter_member=' + this.request.get['filter_member'];
		}

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
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
			'href': await this.url.link('marketplace/marketplace', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		let time = new Date().getTime() / 1000;

		// We create a hash from the data in a similar method to how amazon does things.
		let string = 'marketplace/api/list' + "\n";
		string += this.config.get('opencart_username')||'' + "\n";
		string += this.request.server['host'] + "\n";
		string += VERSION + "\n";
		string += time + "\n";
		// console.log(this.config.get('opencart_secret'))
		let signature = hash_hmac('sha1', string, this.config.get('opencart_secret'), 1).toString('base64');

		url = '&username=' + encodeURIComponent(this.config.get('opencart_username')||'');
		url += '&domain=' + this.request.server['host'];
		url += '&version=' + encodeURIComponent(VERSION);
		url += '&time=' + time;
		url += '&signature=' + encodeURIComponent(signature);

		if ((this.request.get['filter_search'])) {
			url += '&filter_search=' + encodeURIComponent(this.request.get['filter_search']);
		}

		if ((this.request.get['filter_category'])) {
			url += '&filter_category=' + this.request.get['filter_category'];
		}

		if ((this.request.get['filter_license'])) {
			url += '&filter_license=' + this.request.get['filter_license'];
		}

		if ((this.request.get['filter_rating'])) {
			url += '&filter_rating=' + this.request.get['filter_rating'];
		}

		if ((this.request.get['filter_member_type'])) {
			url += '&filter_member_type=' + this.request.get['filter_member_type'];
		}

		if ((this.request.get['filter_member'])) {
			url += '&filter_member=' + this.request.get['filter_member'];
		}

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}
		// console.log(OPENCART_SERVER + 'index.php?route=marketplace/api' + url);
		const curl = await fetch(OPENCART_SERVER + 'index.php?route=marketplace/api' + url).then(response => response.json());
		// console.log(curl)

		const response = curl.data;


		const response_info = typeof response == 'string' ? JSON.parse(response) : response;

		const extension_total = response_info['extension_total'] ?? 0;

		url = '';

		if ((this.request.get['filter_search'])) {
			url += '&filter_search=' + this.request.get['filter_search'];
		}

		if ((this.request.get['filter_category'])) {
			url += '&filter_category=' + this.request.get['filter_category'];
		}

		if ((this.request.get['filter_license'])) {
			url += '&filter_license=' + this.request.get['filter_license'];
		}

		if ((this.request.get['filter_rating'])) {
			url += '&filter_rating=' + this.request.get['filter_rating'];
		}

		if ((this.request.get['filter_member_type'])) {
			url += '&filter_member_type=' + this.request.get['filter_member_type'];
		}

		if ((this.request.get['filter_member'])) {
			url += '&filter_member=' + this.request.get['filter_member'];
		}

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['promotions'] = [];

		if ((response_info['promotions']) && response_info['promotions'] && page == 1) {
			for (let result of response_info['promotions']) {
				data['promotions'].push({
					'name': result['name'],
					'description': result['description'],
					'image': result['image'],
					'license': result['license'],
					'price': result['price'],
					'rating': result['rating'],
					'rating_total': result['rating_total'],
					'href': await this.url.link('marketplace/marketplace/info', 'user_token=' + this.session.data['user_token'] + '&extension_id=' + result['extension_id'] + url, true)
				});
			}
		}

		data['extensions'] = [];

		if ((response_info['extensions']) && response_info['extensions']) {
			for (let result of response_info['extensions']) {
				data['extensions'].push({
					'name': result['name'],
					'description': result['description'],
					'image': result['image'],
					'license': result['license'],
					'price': result['price'],
					'rating': result['rating'],
					'rating_total': result['rating_total'],
					'href': await this.url.link('marketplace/marketplace/info', 'user_token=' + this.session.data['user_token'] + '&extension_id=' + result['extension_id'] + url, true)
				});
			}
		}

		data['user_token'] = this.session.data['user_token'];

		if ((response_info['error'])) {
			data['error_signature'] = response_info['error'];
		} else {
			data['error_signature'] = '';
		}

		// Categories
		url = '';

		if ((this.request.get['filter_search'])) {
			url += '&filter_search=' + this.request.get['filter_search'];
		}

		if ((this.request.get['filter_license'])) {
			url += '&filter_license=' + this.request.get['filter_license'];
		}

		if ((this.request.get['filter_rating'])) {
			url += '&filter_rating=' + this.request.get['filter_rating'];
		}

		if ((this.request.get['filter_member_type'])) {
			url += '&filter_member_type=' + this.request.get['filter_member_type'];
		}

		if ((this.request.get['filter_member'])) {
			url += '&filter_member=' + this.request.get['filter_member'];
		}

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		data['categories'] = [];

		data['categories'].push({
			'text': this.language.get('text_all'),
			'value': '',
			'href': await this.url.link('marketplace/marketplace', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		data['categories'].push({
			'text': this.language.get('text_theme'),
			'value': 'theme',
			'href': await this.url.link('marketplace/marketplace', 'user_token=' + this.session.data['user_token'] + '&filter_category=theme' + url, true)
		});

		data['categories'].push({
			'text': this.language.get('text_marketplace'),
			'value': 'marketplace',
			'href': await this.url.link('marketplace/marketplace', 'user_token=' + this.session.data['user_token'] + '&filter_category=marketplace' + url, true)
		});

		data['categories'].push({
			'text': this.language.get('text_language'),
			'value': 'language',
			'href': await this.url.link('marketplace/marketplace', 'user_token=' + this.session.data['user_token'] + '&filter_category=language' + url, true)
		});

		data['categories'].push({
			'text': this.language.get('text_payment'),
			'value': 'payment',
			'href': await this.url.link('marketplace/marketplace', 'user_token=' + this.session.data['user_token'] + '&filter_category=payment' + url, true)
		});

		data['categories'].push({
			'text': this.language.get('text_shipping'),
			'value': 'shipping',
			'href': await this.url.link('marketplace/marketplace', 'user_token=' + this.session.data['user_token'] + '&filter_category=shipping' + url, true)
		});

		data['categories'].push({
			'text': this.language.get('text_module'),
			'value': 'module',
			'href': await this.url.link('marketplace/marketplace', 'user_token=' + this.session.data['user_token'] + '&filter_category=module' + url, true)
		});

		data['categories'].push({
			'text': this.language.get('text_total'),
			'value': 'total',
			'href': await this.url.link('marketplace/marketplace', 'user_token=' + this.session.data['user_token'] + '&filter_category=total' + url, true)
		});

		data['categories'].push({
			'text': this.language.get('text_feed'),
			'value': 'feed',
			'href': await this.url.link('marketplace/marketplace', 'user_token=' + this.session.data['user_token'] + '&filter_category=feed' + url, true)
		});

		data['categories'].push({
			'text': this.language.get('text_report'),
			'value': 'report',
			'href': await this.url.link('marketplace/marketplace', 'user_token=' + this.session.data['user_token'] + '&filter_category=report' + url, true)
		});

		data['categories'].push({
			'text': this.language.get('text_other'),
			'value': 'other',
			'href': await this.url.link('marketplace/marketplace', 'user_token=' + this.session.data['user_token'] + '&filter_category=other' + url, true)
		});

		// Licenses
		url = '';

		if ((this.request.get['filter_search'])) {
			url += '&filter_search=' + this.request.get['filter_search'];
		}

		if ((this.request.get['filter_category'])) {
			url += '&filter_category=' + this.request.get['filter_category'];
		}

		if ((this.request.get['filter_rating'])) {
			url += '&filter_rating=' + this.request.get['filter_rating'];
		}

		if ((this.request.get['filter_member_type'])) {
			url += '&filter_member_type=' + this.request.get['filter_member_type'];
		}

		if ((this.request.get['filter_member'])) {
			url += '&filter_member=' + this.request.get['filter_member'];
		}

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['licenses'] = [];

		data['licenses'].push({
			'text': this.language.get('text_all'),
			'value': '',
			'href': await this.url.link('marketplace/marketplace', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		data['licenses'].push({
			'text': this.language.get('text_free'),
			'value': 'free',
			'href': await this.url.link('marketplace/marketplace', 'user_token=' + this.session.data['user_token'] + '&filter_license=free' + url, true)
		});

		data['licenses'].push({
			'text': this.language.get('text_paid'),
			'value': 'paid',
			'href': await this.url.link('marketplace/marketplace', 'user_token=' + this.session.data['user_token'] + '&filter_license=paid' + url, true)
		});


		data['licenses'].push({
			'text': this.language.get('text_purchased'),
			'value': 'purchased',
			'href': await this.url.link('marketplace/marketplace', 'user_token=' + this.session.data['user_token'] + '&filter_license=purchased' + url, true)
		});

		// Sort
		url = '';

		if ((this.request.get['filter_search'])) {
			url += '&filter_search=' + this.request.get['filter_search'];
		}

		if ((this.request.get['filter_category'])) {
			url += '&filter_category=' + this.request.get['filter_category'];
		}

		if ((this.request.get['filter_license'])) {
			url += '&filter_license=' + this.request.get['filter_license'];
		}

		if ((this.request.get['filter_rating'])) {
			url += '&filter_rating=' + this.request.get['filter_rating'];
		}

		if ((this.request.get['filter_member_type'])) {
			url += '&filter_member_type=' + this.request.get['filter_member_type'];
		}

		if ((this.request.get['filter_member'])) {
			url += '&filter_member=' + this.request.get['filter_member'];
		}

		data['sorts'] = [];

		data['sorts'].push({
			'text': this.language.get('text_date_modified'),
			'value': 'date_modified',
			'href': await this.url.link('marketplace/marketplace', 'user_token=' + this.session.data['user_token'] + url + '&sort=date_modified')
		});

		data['sorts'].push({
			'text': this.language.get('text_date_added'),
			'value': 'date_added',
			'href': await this.url.link('marketplace/marketplace', 'user_token=' + this.session.data['user_token'] + url + '&sort=date_added')
		});

		data['sorts'].push({
			'text': this.language.get('text_rating'),
			'value': 'rating',
			'href': await this.url.link('marketplace/marketplace', 'user_token=' + this.session.data['user_token'] + url + '&sort=rating')
		});


		data['sorts'].push({
			'text': this.language.get('text_name'),
			'value': 'name',
			'href': await this.url.link('marketplace/marketplace', 'user_token=' + this.session.data['user_token'] + url + '&sort=name')
		});

		data['sorts'].push({
			'text': this.language.get('text_price'),
			'value': 'price',
			'href': await this.url.link('marketplace/marketplace', 'user_token=' + this.session.data['user_token'] + url + '&sort=price')
		});

		// Pagination
		url = '';

		if ((this.request.get['filter_search'])) {
			url += '&filter_search=' + this.request.get['filter_search'];
		}

		if ((this.request.get['filter_category'])) {
			url += '&filter_category=' + this.request.get['filter_category'];
		}

		if ((this.request.get['filter_license'])) {
			url += '&filter_license=' + this.request.get['filter_license'];
		}

		if ((this.request.get['filter_rating'])) {
			url += '&filter_rating=' + this.request.get['filter_rating'];
		}

		if ((this.request.get['filter_member_type'])) {
			url += '&filter_member_type=' + this.request.get['filter_member_type'];
		}

		if ((this.request.get['filter_member'])) {
			url += '&filter_member=' + this.request.get['filter_member'];
		}

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		const pagination = new Pagination();
		pagination.total = extension_total;
		pagination.page = page;
		pagination.limit = 12;
		pagination.url = await this.url.link('marketplace/marketplace', 'user_token=' + this.session.data['user_token'] + url + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['filter_search'] = filter_search;
		data['filter_category'] = filter_category;
		data['filter_license'] = filter_license;
		data['filter_member_type'] = filter_member_type;
		data['filter_rating'] = filter_rating;
		data['sort'] = sort;

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('marketplace/marketplace_list', data));
	}

	async info() {
		const data = {};
		let extension_id = 0;
		if ((this.request.get['extension_id'])) {
			extension_id = this.request.get['extension_id'];
		}

		let time = new Date().getTime() / 1000;

		// We create a hash from the data in a similar method to how amazon does things.
		let string = 'marketplace/api/info' + "\n";
		string += this.config.get('opencart_username')||'' + "\n";
		string += this.request.server['host'] + "\n";
		string += VERSION + "\n";
		string += extension_id + "\n";
		string += time + "\n";

		signature = hash_hmac('sha1', string, this.config.get('opencart_secret'), 1).toString('base64');

		let url = '&username=' + encodeURIComponent(this.config.get('opencart_username')||'');
		url += '&domain=' + this.request.server['HTTP_HOST'];
		url += '&version=' + encodeURIComponent(VERSION);
		url += '&extension_id=' + extension_id;
		url += '&time=' + time;
		url += '&signature=' + encodeURIComponent(signature);

		const curl = await fetch(OPENCART_SERVER + 'index.php?route=marketplace/api/info' + url).then(response => response.json());


		const response = curl.data;

		const response_info = typeof response == 'string' ? JSON.parse(response) : response;

		if (response_info) {
			await this.load.language('marketplace/marketplace');

			this.document.setTitle(this.language.get('heading_title'));

			if ((response_info['error'])) {
				data['error_signature'] = response_info['error'];
			} else {
				data['error_signature'] = '';
			}

			data['user_token'] = this.session.data['user_token'];

			url = '';

			if ((this.request.get['filter_search'])) {
				url += '&filter_search=' + this.request.get['filter_search'];
			}

			if ((this.request.get['filter_category'])) {
				url += '&filter_category=' + this.request.get['filter_category'];
			}

			if ((this.request.get['filter_license'])) {
				url += '&filter_license=' + this.request.get['filter_license'];
			}

			if ((this.request.get['filter_username'])) {
				url += '&filter_username=' + this.request.get['filter_username'];
			}

			if ((this.request.get['sort'])) {
				url += '&sort=' + this.request.get['sort'];
			}

			if ((this.request.get['page'])) {
				url += '&page=' + this.request.get['page'];
			}

			data['cancel'] = await this.url.link('marketplace/marketplace', 'user_token=' + this.session.data['user_token'] + url, true);

			data['breadcrumbs'] = [];

			data['breadcrumbs'].push({
				'text': this.language.get('text_home'),
				'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
			});

			data['breadcrumbs'].push({
				'text': this.language.get('heading_title'),
				'href': await this.url.link('marketplace/marketplace', 'user_token=' + this.session.data['user_token'] + url, true)
			});

			this.load.helper('bbcode');

			data['banner'] = response_info['banner'];

			data['extension_id'] = this.request.get['extension_id'];
			data['name'] = response_info['name'];
			data['description'] = response_info['description'];
			data['documentation'] = response_info['documentation'];
			data['price'] = response_info['price'];
			data['license'] = response_info['license'];
			data['license_period'] = response_info['license_period'];
			data['purchased'] = response_info['purchased'];
			data['rating'] = response_info['rating'];
			data['rating_total'] = response_info['rating_total'];
			data['downloaded'] = response_info['downloaded'];
			data['sales'] = response_info['sales'];
			data['date_added'] = date(this.language.get('date_format_short'), new Date(response_info['date_added']));
			data['date_modified'] = date(this.language.get('date_format_short'), new Date(response_info['date_modified']));

			data['member_username'] = response_info['member_username'];
			data['member_image'] = response_info['member_image'];
			data['member_date_added'] = response_info['member_date_added'];
			data['filter_member'] = await this.url.link('marketplace/marketplace', 'user_token=' + this.session.data['user_token'] + '&filter_member=' + response_info['member_username']);

			data['comment_total'] = response_info['comment_total'];

			data['images'] = [];

			for (response_info['images'] of result) {
				data['images'].push({
					'thumb': result['thumb'],
					'popup': result['popup']
				});
			}

			this.load.model('setting/extension', this);

			data['downloads'] = [];

			if (response_info['downloads']) {
				for (let result of response_info['downloads']) {
					const extension_install_info = await this.model_setting_extension.getExtensionInstallByExtensionDownloadId(result['extension_download_id']);
					let extension_install_id = 0;
					if (extension_install_info.extension_install_id) {
						extension_install_id = extension_install_info['extension_install_id'];
					}

					data['downloads'].push({
						'extension_download_id': result['extension_download_id'],
						'extension_install_id': extension_install_id,
						'name': result['name'],
						'filename': result['filename'],
						'date_added': date(this.language.get('date_format_short'), new Date(result['date_added'])),
						'status': result['status']
					});
				}
			}

			this.document.addStyle('view/javascript/jquery/magnific/magnific-popup.css');
			this.document.addScript('view/javascript/jquery/magnific/jquery.magnific-popup.min.js');

			data['header'] = await this.load.controller('common/header');
			data['column_left'] = await this.load.controller('common/column_left');
			data['footer'] = await this.load.controller('common/footer');

			this.response.setOutput(await this.load.view('marketplace/marketplace_info', data));
		} else {
			return new Action('error/not_found');
		}
	}

	async purchase() {
		await this.load.language('marketplace/marketplace');

		const json = {};
		let extension_id = 0;
		if ((this.request.get['extension_id'])) {
			extension_id = this.request.get['extension_id'];
		}

		if (!await this.user.hasPermission('modify', 'marketplace/marketplace')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!this.config.get('opencart_username')||'' || !this.config.get('opencart_secret')) {
			json['error'] = this.language.get('error_opencart');
		}

		if (!this.request.post['pin']) {
			json['error'] = this.language.get('error_pin');
		}

		if (!json.error) {
			let time = new Date().getTime() / 1000;

			// We create a hash from the data in a similar method to how amazon does things.
			let string = 'marketplace/api/purchase' + "\n";
			string += this.config.get('opencart_username')||'' + "\n";
			string += this.request.server['host'] + "\n";
			string += VERSION + "\n";
			string += extension_id + "\n";
			string += this.request.post['pin'] + "\n";
			string += time + "\n";

			let signature = hash_hmac('sha1', string, this.config.get('opencart_secret'), 1).toString('base64');

			url = '&username=' + encodeURIComponent(this.config.get('opencart_username')||'');
			url += '&domain=' + this.request.server['HTTP_HOST'];
			url += '&version=' + encodeURIComponent(VERSION);
			url += '&extension_id=' + extension_id;
			url += '&time=' + time;
			url += '&signature=' + encodeURIComponent(signature);

			const curl = await fetch(OPENCART_SERVER + 'index.php?route=marketplace/api/purchase' + url).then(response => response.json());
			const response = curl.data;
			const response_info = typeof response == 'string' ? JSON.parse(response) : response;

			if ((response_info['success'])) {
				json['success'] = response_info['success'];
			} else if ((response_info['error'])) {
				json['error'] = response_info['error'];
			} else {
				json['error'] = this.language.get('error_purchase');
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async download() {
		await this.load.language('marketplace/marketplace');

		const json = {};
		let extension_id = 0;
		if ((this.request.get['extension_id'])) {
			extension_id = this.request.get['extension_id'];
		}
		let extension_download_id = 0;
		if ((this.request.get['extension_download_id'])) {
			extension_download_id = this.request.get['extension_download_id'];
		}

		if (!await this.user.hasPermission('modify', 'marketplace/marketplace')) {
			json['error'] = this.language.get('error_permission');
		}

		// Check if there is a install zip already there
		let files = require('glob').sync(DIR_UPLOAD + '*.tmp');

		for (let file of files) {
			if (is_file(file) && (fs.statSync(file).ctime < (Date.now() - 5000))) {
				fs.unlinkSync(file);
			}

			if (is_file(file)) {
				json['error'] = this.language.get('error_install');

				break;
			}
		}

		// Check for any install directories
		let directories = require('glob').sync(DIR_UPLOAD + 'tmp-*');

		for (let directory of directories) {
			if (is_dir(directory) && (fs.statSync(directory).ctime < (Date.now() - 5000))) {
				// Get a list of files ready to upload
				let files = [];

				let path = [directory];

				while (path.length != 0) {
					let next = path.shift();

					// We have to use scandir function because glob will not pick up dot files.
					for (let file of fs.readdirSync(next).filter(item => item !== '.' && item !== '..')) {
						file = next + '/' + file;

						if (is_dir(file)) {
							path.push(file);
						}

						files.push(file);
					}
				}

				files = files.reverse();

				for (let file of files) {
					if (is_file(file)) {
						fs.unlinkSync(file);
					} else if (is_dir(file)) {
						fs.rmdirSync(file);
					}
				}

				fs.rmdirSync(directory);
			}

			if (is_dir(directory)) {
				json['error'] = this.language.get('error_install');

				break;
			}
		}

		if (!json) {
			let time = new Date().getTime() / 1000;

			// We create a hash from the data in a similar method to how amazon does things.
			let string = 'marketplace/api/download' + "\n";
			string += this.config.get('opencart_username')||'' + "\n";
			string += this.request.server['host'] + "\n";
			string += VERSION + "\n";
			string += extension_id + "\n";
			string += extension_download_id + "\n";
			string += time + "\n";

			signature = hash_hmac('sha1', string, this.config.get('opencart_secret'), 1).toString('base64');

			let url = '&username=' + encodeURIComponent(this.config.get('opencart_username')||'');
			url += '&domain=' + this.request.server['HTTP_HOST'];
			url += '&version=' + encodeURIComponent(VERSION);
			url += '&extension_id=' + extension_id;
			url += '&extension_download_id=' + extension_download_id;
			url += '&time=' + time;
			url += '&signature=' + encodeURIComponent(signature);

			const curl = await fetch(OPENCART_SERVER + 'index.php?route=marketplace/api/download&extension_download_id=' + extension_download_id + url).then(response => response.json());
			const response = curl.data;

			const response_info = typeof response == 'string' ? JSON.parse(response) : response;
			if ((response_info['download'])) {
				if (response_info['filename'].substr(-10) == '.ocmod.zip') {
					this.session.data['install'] = oc_token(10);

					let download = fs.readFileSync(response_info['download']);

					fs.writeFileSync(DIR_UPLOAD + this.session.data['install'] + '.tmp', download);

					this.load.model('setting/extension', this);

					json['extension_install_id'] = await this.model_setting_extension.addExtensionInstall(response_info['extension'], extension_download_id);

					json['text'] = this.language.get('text_install');

					json['next'] = str_replace('&amp;', '&', await this.url.link('marketplace/install/install', 'user_token=' + this.session.data['user_token'] + '&extension_install_id=' + json['extension_install_id'], true));
				} else {
					json['redirect'] = response_info['download'];
				}
			} else if ((response_info['error'])) {
				json['error'] = response_info['error'];
			} else {
				json['error'] = this.language.get('error_download');
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async addComment() {
		await this.load.language('marketplace/marketplace');

		const json = {};
		let extension_id = 0;
		if ((this.request.get['extension_id'])) {
			extension_id = this.request.get['extension_id'];
		}
		let parent_id = 0;
		if ((this.request.get['parent_id'])) {
			parent_id = this.request.get['parent_id'];
		}

		if (!await this.user.hasPermission('modify', 'marketplace/marketplace')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!this.config.get('opencart_username')||'' || !this.config.get('opencart_secret')) {
			json['error'] = this.language.get('error_opencart');
		}

		if (!json) {
			let time = new Date().getTime() / 1000;

			// We create a hash from the data in a similar method to how amazon does things.
			let string = 'marketplace/api/addcomment' + "\n";
			string += encodeURIComponent(this.config.get('opencart_username')||'') + "\n";
			string += this.request.server['host'] + "\n";
			string += encodeURIComponent(VERSION) + "\n";
			string += extension_id + "\n";
			string += parent_id + "\n";
			string += encodeURIComponent(atob(this.request.post['comment'])) + "\n";
			string += time + "\n";

			let signature = hash_hmac('sha1', string, this.config.get('opencart_secret'), 1).toString('base64');

			let url = '&username=' + this.config.get('opencart_username')||'';
			url += '&domain=' + this.request.server['HTTP_HOST'];
			url += '&version=' + VERSION;
			url += '&extension_id=' + extension_id;
			url += '&parent_id=' + parent_id;
			url += '&time=' + time;
			url += '&signature=' + encodeURIComponent(signature);

			const curl = await fetch(OPENCART_SERVER + 'index.php?route=marketplace/api/addcomment&extension_id=' + extension_id + url, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: { 'comment': this.request.post['comment'] }, redirect: 'follow' }).then(response => response.json());

			const response = curl.data;

			const response_info = typeof response == 'string' ? JSON.parse(response) : response;

			if ((response_info['success'])) {
				json['success'] = response_info['success'];
			} else if ((response_info['error'])) {
				json['error'] = response_info['error'];
			} else {
				json['error'] = this.language.get('error_comment');
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async comment() {
		const data = {};
		await this.load.language('marketplace/marketplace');
		let extension_id = 0;
		if ((this.request.get['extension_id'])) {
			extension_id = this.request.get['extension_id'];
		}
		let page = 1;
		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		}

		data['button_more'] = this.language.get('button_more');
		data['button_reply'] = this.language.get('button_reply');

		const curl = await fetch(OPENCART_SERVER + 'index.php?route=api/marketplace/comment&extension_id=' + extension_id + '&page=' + page).then(response => response.json());

		const response = curl.data;

		const json = typeof response == 'string' ? JSON.parse(response) : response;

		data['comments'] = [];

		const comment_total = json['comment_total'];

		if (json['comments']) {
			const results = json['comments'];

			for (let result of results) {
				let next = '';
				if (result['reply_total'] > 5) {
					next = await this.url.link('marketplace/marketplace/reply', 'user_token=' + this.session.data['user_token'] + '&extension_id=' + extension_id + '&parent_id=' + result['extension_comment_id'] + '&page=2');
				}

				data['comments'].push({
					'extension_comment_id': result['extension_comment_id'],
					'member': result['member'],
					'image': result['image'],
					'comment': result['comment'],
					'date_added': result['date_added'],
					'reply': result['reply'],
					'add': await this.url.link('marketplace/marketplace/addcomment', 'user_token=' + this.session.data['user_token'] + '&extension_id=' + extension_id + '&parent_id=' + result['extension_comment_id']),
					'refresh': await this.url.link('marketplace/marketplace/reply', 'user_token=' + this.session.data['user_token'] + '&extension_id=' + extension_id + '&parent_id=' + result['extension_comment_id'] + '&page=1'),
					'next': next
				});
			}
		}

		const pagination = new Pagination();
		pagination.total = comment_total;
		pagination.page = page;
		pagination.limit = 20;
		pagination.url = await this.url.link('marketplace/marketplace/comment', 'user_token=' + this.session.data['user_token'] + '&extension_id=' + extension_id + '&page={page}');

		data['pagination'] = pagination.render();

		data['refresh'] = await this.url.link('marketplace/marketplace/comment', 'user_token=' + this.session.data['user_token'] + '&extension_id=' + extension_id + '&page=' + page);

		this.response.setOutput(await this.load.view('marketplace/marketplace_comment', data));
	}

	async reply() {
		const data = {};
		await this.load.language('marketplace/marketplace');
		let extension_id = 0;
		if ((this.request.get['extension_id'])) {
			extension_id = this.request.get['extension_id'];
		}
		let parent_id = 0;
		if ((this.request.get['parent_id'])) {
			parent_id = this.request.get['parent_id'];
		}
		let page = 1;
		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		}

		const curl = await fetch(OPENCART_SERVER + 'index.php?route=marketplace/api/comment&extension_id=' + extension_id + '&parent_id=' + parent_id + '&page=' + page).then(response => response.json());
		const response = curl.data;

		json = JSON.parse(response, true);

		data['replies'] = [];

		const reply_total = json['reply_total'];

		if (json['replies']) {
			const results = json['replies'];

			for (let result of results) {
				data['replies'].push({
					'extension_comment_id': result['extension_comment_id'],
					'member': result['member'],
					'image': result['image'],
					'comment': result['comment'],
					'date_added': result['date_added']
				});
			}
		}

		data['refresh'] = await this.url.link('marketplace/marketplace/reply', 'user_token=' + this.session.data['user_token'] + '&extension_id=' + extension_id + '&parent_id=' + parent_id + '&page=' + page);

		if ((page * 5) < reply_total) {
			data['next'] = await this.url.link('marketplace/marketplace/reply', 'user_token=' + this.session.data['user_token'] + '&extension_id=' + extension_id + '&parent_id=' + parent_id + '&page=' + (page + 1));
		} else {
			data['next'] = '';
		}

		this.response.setOutput(await this.load.view('marketplace/marketplace_reply', data));
	}
}
