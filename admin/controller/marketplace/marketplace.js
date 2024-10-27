const timeFun = require("locutus/php/datetime/time");
const expressPath = require('path');
module.exports = class MarketplaceMarketplaceController extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return void
	 */
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
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('marketplace/marketplace', 'user_token=' + this.session.data['user_token'] + url)
		});

		let time = timeFun();

		// We create a hash from the data in a similar method to how amazon does things.
		let string = 'api/marketplace/list' + "\n";
		string += (this.config.get('opencart_username') || '') + "\n";
		string += this.request.server.headers.host + "\n";
		string += VERSION + "\n";
		string += time + "\n";

		let signature = hash_hmac('sha1', string, this.config.get('opencart_secret')).toString('base64');
		url = '&username=' + encodeURIComponent(this.config.get('opencart_username') || '');
		url += '&domain=' + this.request.server.headers.host;
		url += '&version=' + VERSION;
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
			url += '&filter_member=' + encodeURIComponent(this.request.get['filter_member']);
		}

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}
		let curl = await require("axios").get(OPENCART_SERVER + 'index.php?route=api/marketplace' + url);

		let response = curl.data;

		let status = curl.status;

		let response_info = response;
		let extension_total = 0;
		if ((response_info['extension_total'])) {
			extension_total = response_info['extension_total'];
		}

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

		if ((response_info['promotions']) && page == 1) {
			for (let result of response_info['promotions']) {
				data['promotions'].push({
					'name': result['name'],
					'description': result['description'],
					'image': result['image'],
					'license': result['license'],
					'price': result['price'],
					'rating': result['rating'],
					'rating_total': result['rating_total'],
					'href': await this.url.link('marketplace/marketplace.info', 'user_token=' + this.session.data['user_token'] + '&extension_id=' + result['extension_id'] + url)
				});
			}
		}

		data['extensions'] = [];

		if ((response_info['extensions'])) {
			for (let result of response_info['extensions']) {
				data['extensions'].push({
					'name': result['name'],
					'description': result['description'],
					'image': result['image'],
					'license': result['license'],
					'price': result['price'],
					'rating': result['rating'],
					'rating_total': result['rating_total'],
					'href': await this.url.link('marketplace/marketplace.info', 'user_token=' + this.session.data['user_token'] + '&extension_id=' + result['extension_id'] + url)
				});
			}
		}

		data['signature'] = this.config.get('opencart_username') && this.config.get('opencart_secret');

		if (!this.config.get('opencart_username') || !this.config.get('opencart_secret')) {
			data['error_warning'] = this.language.get('error_api');
		} else if ((response_info['error'])) {
			data['error_warning'] = response_info['error'];
		} else {
			data['error_warning'] = '';
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
			'href': await this.url.link('marketplace/marketplace', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['categories'].push({
			'text': this.language.get('text_theme'),
			'value': 'theme',
			'href': await this.url.link('marketplace/marketplace', 'user_token=' + this.session.data['user_token'] + '&filter_category=theme' + url)
		});

		data['categories'].push({
			'text': this.language.get('text_marketplace'),
			'value': 'marketplace',
			'href': await this.url.link('marketplace/marketplace', 'user_token=' + this.session.data['user_token'] + '&filter_category=marketplace' + url)
		});

		data['categories'].push({
			'text': this.language.get('text_language'),
			'value': 'language',
			'href': await this.url.link('marketplace/marketplace', 'user_token=' + this.session.data['user_token'] + '&filter_category=language' + url)
		});

		data['categories'].push({
			'text': this.language.get('text_payment'),
			'value': 'payment',
			'href': await this.url.link('marketplace/marketplace', 'user_token=' + this.session.data['user_token'] + '&filter_category=payment' + url)
		});

		data['categories'].push({
			'text': this.language.get('text_shipping'),
			'value': 'shipping',
			'href': await this.url.link('marketplace/marketplace', 'user_token=' + this.session.data['user_token'] + '&filter_category=shipping' + url)
		});

		data['categories'].push({
			'text': this.language.get('text_module'),
			'value': 'module',
			'href': await this.url.link('marketplace/marketplace', 'user_token=' + this.session.data['user_token'] + '&filter_category=module' + url)
		});

		data['categories'].push({
			'text': this.language.get('text_total'),
			'value': 'total',
			'href': await this.url.link('marketplace/marketplace', 'user_token=' + this.session.data['user_token'] + '&filter_category=total' + url)
		});

		data['categories'].push({
			'text': this.language.get('text_feed'),
			'value': 'feed',
			'href': await this.url.link('marketplace/marketplace', 'user_token=' + this.session.data['user_token'] + '&filter_category=feed' + url)
		});

		data['categories'].push({
			'text': this.language.get('text_report'),
			'value': 'report',
			'href': await this.url.link('marketplace/marketplace', 'user_token=' + this.session.data['user_token'] + '&filter_category=report' + url)
		});

		data['categories'].push({
			'text': this.language.get('text_other'),
			'value': 'other',
			'href': await this.url.link('marketplace/marketplace', 'user_token=' + this.session.data['user_token'] + '&filter_category=other' + url)
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
			'href': await this.url.link('marketplace/marketplace', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['licenses'].push({
			'text': this.language.get('text_recommended'),
			'value': 'recommended',
			'href': await this.url.link('marketplace/marketplace', 'user_token=' + this.session.data['user_token'] + '&filter_license=recommended' + url)
		});

		data['licenses'].push({
			'text': this.language.get('text_free'),
			'value': 'free',
			'href': await this.url.link('marketplace/marketplace', 'user_token=' + this.session.data['user_token'] + '&filter_license=free' + url)
		});

		data['licenses'].push({
			'text': this.language.get('text_paid'),
			'value': 'paid',
			'href': await this.url.link('marketplace/marketplace', 'user_token=' + this.session.data['user_token'] + '&filter_license=paid' + url)
		});

		data['licenses'].push({
			'text': this.language.get('text_purchased'),
			'value': 'purchased',
			'href': await this.url.link('marketplace/marketplace', 'user_token=' + this.session.data['user_token'] + '&filter_license=purchased' + url)
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

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': extension_total,
			'page': page,
			'limit': 12,
			'url': await this.url.link('marketplace/marketplace', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		});

		data['filter_search'] = filter_search;
		data['filter_category'] = filter_category;
		data['filter_license'] = filter_license;
		data['filter_member_type'] = filter_member_type;
		data['filter_rating'] = filter_rating;
		data['sort'] = sort;

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('marketplace/marketplace_list', data));
	}

	/**
	 * @return object|Action|null
	 */
	async info() {
		const data = {};
		let extension_id = 0;
		if ((this.request.get['extension_id'])) {
			extension_id = this.request.get['extension_id'];
		}

		let time = timeFun();

		// We create a hash from the data in a similar method to how amazon does things.
		let string = 'api/marketplace/info' + "\n";
		string += (this.config.get('opencart_username') || '') + "\n";
		string += this.request.server.headers.host + "\n";
		string += VERSION + "\n";
		string += extension_id + "\n";
		string += time + "\n";

		let signature = base64_encode(hash_hmac('sha1', string, this.config.get('opencart_secret'), 1));

		let url = '&username=' + encodeURIComponent(this.config.get('opencart_username') || '');
		url += '&domain=' + this.request.server.headers.host;
		url += '&version=' + VERSION;
		url += '&extension_id=' + extension_id;
		url += '&time=' + time;
		url += '&signature=' + encodeURIComponent(signature);

		let curl = await require("axios").post(OPENCART_SERVER + 'index.php?route=api/marketplace/info' + url);
		let response = curl.data;
		let status = curl.status;
		let response_info = response;

		if (response_info) {
			await this.load.language('marketplace/marketplace');

			this.document.setTitle(this.language.get('heading_title'));

			data['signature'] = this.config.get('opencart_username') && this.config.get('opencart_secret');

			if (!this.config.get('opencart_username') || !this.config.get('opencart_secret')) {
				data['error_warning'] = this.language.get('error_api');
			} else if ((response_info['error'])) {
				data['error_warning'] = response_info['error'];
			} else {
				data['error_warning'] = '';
			}

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

			data['back'] = await this.url.link('marketplace/marketplace', 'user_token=' + this.session.data['user_token'] + url);

			data['breadcrumbs'] = [];

			data['breadcrumbs'].push({
				'text': this.language.get('text_home'),
				'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
			});

			data['breadcrumbs'].push({
				'text': this.language.get('heading_title'),
				'href': await this.url.link('marketplace/marketplace', 'user_token=' + this.session.data['user_token'] + url)
			});

			data['banner'] = response_info['banner'];

			data['extension_id'] = this.request.get['extension_id'];
			data['name'] = response_info['name'];
			data['description'] = response_info['description'];
			data['documentation'] = response_info['documentation'];
			data['price'] = response_info['price'];
			data['license'] = response_info['license'];
			data['license_period'] = response_info['license_period'];
			data['purchased'] = response_info['purchased'];
			data['compatibility'] = response_info['compatibility'];

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

			if ((response_info['comment_total'])) {
				data['comment_total'] = response_info['comment_total'];
			} else {
				data['comment_total'] = 0;
			}

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
				this.session.data['extension_download'][extension_id] = response_info['downloads'];
			} else {
				this.session.data['extension_download'][extension_id] = {};
				this.session.data['extension_download'][extension_id] = {};
			}

			this.document.addStyle('view/javascript/jquery/magnific/magnific-popup.css');
			this.document.addScript('view/javascript/jquery/magnific/jquery.magnific-popup.min.js');

			data['user_token'] = this.session.data['user_token'];

			data['header'] = await this.load.controller('common/header');
			data['column_left'] = await this.load.controller('common/column_left');
			data['footer'] = await this.load.controller('common/footer');

			this.response.setOutput(await this.load.view('marketplace/marketplace_info', data));

			return null;
		} else {
			return new global['\Opencart\System\Engine\Action']('error/not_found');
		}
	}

	/**
	 * @return void
	 */
	async extension() {
		const data = {};
		await this.load.language('marketplace/marketplace');
		let extension_id = 0;
		if ((this.request.get['extension_id'])) {
			extension_id = this.request.get['extension_id'];
		}

		this.load.model('setting/extension', this);

		data['downloads'] = [];

		if ((this.session.data['extension_download'][extension_id])) {
			let results = this.session.data['extension_download'][extension_id];

			for (let result of results) {
				if (substr(result['filename'], -10) == '.ocmod.zip') {
					code = expressPath.basename(result['filename'], '.ocmod.zip');

					const install_info = await this.model_setting_extension.getInstallByCode(code);

					// Download
					let download = '';
					if (!install_info) {
						download = await this.url.link('marketplace/marketplace.download', 'user_token=' + this.session.data['user_token'] + '&extension_id=' + extension_id + '&extension_download_id=' + result['extension_download_id']);
					}

					// Install
					let install = '';
					if (install_info && !install_info['status']) {
						install = await this.url.link('marketplace/installer.install', 'user_token=' + this.session.data['user_token'] + '&extension_install_id=' + install_info['extension_install_id']);
					}

					// Uninstall
					let uninstall = '';
					if (install_info && install_info['status']) {
						uninstall = await this.url.link('marketplace/installer.uninstall', 'user_token=' + this.session.data['user_token'] + '&extension_install_id=' + install_info['extension_install_id']);
					}

					// Delete
					let remove = '';
					if (install_info && !install_info['status']) {
						remove = await this.url.link('marketplace/installer.delete', 'user_token=' + this.session.data['user_token'] + '&extension_install_id=' + install_info['extension_install_id']);
					}

					data['downloads'].push({
						'name': result['name'],
						'date_added': date(this.language.get('date_format_short'), new Date(result['date_added'])),
						'download': download,
						'install': install,
						'uninstall': uninstall,
						'delete': remove
					});
				}
			}
		}

		this.response.setOutput(await this.load.view('marketplace/marketplace_extension', data));
	}

	/**
	 * @return void
	 */
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

		if (!this.config.get('opencart_username') || !this.config.get('opencart_secret')) {
			json['error'] = this.language.get('error_api');
		}

		if (!this.request.post['pin']) {
			json['error'] = this.language.get('error_pin');
		}

		if (!Object.keys(json).length) {
			let time = timeFun();

			// We create a hash from the data in a similar method to how amazon does things.
			let string = 'api/marketplace/purchase' + "\n";
			string += (this.config.get('opencart_username') || '') + "\n";
			string += this.request.server.headers.host + "\n";
			string += VERSION + "\n";
			string += extension_id + "\n";
			string += this.request.post['pin'] + "\n";
			string += time + "\n";

			let signature = hash_hmac('sha1', string, this.config.get('opencart_secret')).toString('base64');

			let url = '&username=' + encodeURIComponent(this.config.get('opencart_username') || '');
			url += '&domain=' + this.request.server.headers.host;
			url += '&version=' + encodeURIComponent(VERSION);
			url += '&extension_id=' + extension_id;
			url += '&time=' + time;
			url += '&signature=' + encodeURIComponent(signature);

			let curl = await require("axios").post(OPENCART_SERVER + 'index.php?route=api/marketplace/purchase' + url);

			let response = curl.data;

			let response_info = response;

			if ((response_info['success'])) {
				// If purchase complete we update the status for all downloads to be available.
				if ((this.session.data['extension_download'][extension_id])) {
					let results = this.session.data['extension_download'][extension_id];

					for (let key of Object.keys(results)) {
						this.session.data['extension_download'][extension_id][key]['status'] = 1;
					}
				}

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

	/**
	 * @return void
	 */
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

		if (!Object.keys(json).length) {
			let time = timeFun();

			// We create a hash from the data in a similar method to how amazon does things.
			let string = 'api/marketplace/download' + "\n";
			string += (this.config.get('opencart_username') || '') + "\n";
			string += this.request.server.headers.host + "\n";
			string += VERSION + "\n";
			string += extension_id + "\n";
			string += extension_download_id + "\n";
			string += time + "\n";

			let signature = hash_hmac('sha1', string, this.config.get('opencart_secret')).toString('base64');

			let url = '&username=' + encodeURIComponent(this.config.get('opencart_username') || '');
			url += '&domain=' + this.request.server.headers.host;
			url += '&version=' + encodeURIComponent(VERSION);
			url += '&extension_id=' + extension_id;
			url += '&extension_download_id=' + extension_download_id;
			url += '&time=' + time;
			url += '&signature=' + encodeURIComponent(signature);

			let curl = await require("axios").get(OPENCART_SERVER + 'index.php?route=api/marketplace/download&extension_download_id=' + extension_download_id + url);

			let response = curl.data;

			let response_info = response;

			if ((response_info['download'])) {
				if (response_info['filename'].substring(-10) == '.ocmod.zip') {
					fs.writeFileSync(DIR_STORAGE + 'marketplace/' + response_info['filename'], response)

					let extension_data = {
						'extension_id': extension_id,
						'extension_download_id': extension_download_id,
						'name': response_info['name'],
						'code': expressPath.basename(response_info['filename'], '.ocmod.zip'),
						'author': response_info['author'],
						'version': response_info['version'],
						'link': OPENCART_SERVER + 'marketplace/extension.info&extension_id=' + extension_id
					};

					this.load.model('setting/extension', this);

					json['extension_install_id'] = await this.model_setting_extension.addInstall(extension_data);

					json['success'] = this.language.get('text_success');
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

	/**
	 * @return void
	 */
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

		if (!this.config.get('opencart_username') || !this.config.get('opencart_secret')) {
			json['error'] = this.language.get('error_opencart');
		}

		if (!Object.keys(json).length) {
			let time = timeFun();

			// We create a hash from the data in a similar method to how amazon does things.
			let string = 'api/marketplace/addcomment' + "\n";
			string += encodeURIComponent(this.config.get('opencart_username') || '') + "\n";
			string += this.request.server.headers.host + "\n";
			string += encodeURIComponent(VERSION) + "\n";
			string += extension_id + "\n";
			string += parent_id + "\n";
			string += encodeURIComponent(base64_encode(this.request.post['comment'])) + "\n";
			string += time + "\n";

			let signature = hash_hmac('sha1', string, this.config.get('opencart_secret')).toString('base64');

			let url = '&username=' + this.config.get('opencart_username');
			url += '&domain=' + this.request.server.headers.host;
			url += '&version=' + VERSION;
			url += '&extension_id=' + extension_id;
			url += '&parent_id=' + parent_id;
			url += '&time=' + time;
			url += '&signature=' + encodeURIComponent(signature);

			let curl = await require("axios").post(OPENCART_SERVER + 'index.php?route=api/marketplace/addcomment&extension_id=' + extension_id + url, { comment: this.request.post['comment'] });
			let response = curl.data;
			let response_info = response;

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

	/**
	 * @return void
	 */
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

		let curl = await require("axios").get(OPENCART_SERVER + 'index.php?route=api/marketplace/comment&extension_id=' + extension_id + '&page=' + page);

		let response = curl.data;

		let json = JSON.parse(response);

		data['comments'] = [];

		let comment_total = json['comment_total'];

		if (json['comments']) {
			let results = json['comments'];

			for (let result of results) {
				let next = '';
				if (result['reply_total'] > 5) {
					next = await this.url.link('marketplace/marketplace.reply', 'user_token=' + this.session.data['user_token'] + '&extension_id=' + extension_id + '&parent_id=' + result['extension_comment_id'] + '&page=2');
				}

				data['comments'].push({
					'extension_comment_id': result['extension_comment_id'],
					'member': result['member'],
					'image': result['image'],
					'comment': result['comment'],
					'date_added': result['date_added'],
					'reply': result['reply'],
					'add': await this.url.link('marketplace/marketplace.addcomment', 'user_token=' + this.session.data['user_token'] + '&extension_id=' + extension_id + '&parent_id=' + result['extension_comment_id']),
					'refresh': await this.url.link('marketplace/marketplace.reply', 'user_token=' + this.session.data['user_token'] + '&extension_id=' + extension_id + '&parent_id=' + result['extension_comment_id'] + '&page=1'),
					'next': next
				});
			}
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': comment_total,
			'page': page,
			'limit': 20,
			'url': await this.url.link('marketplace/marketplace.comment', 'user_token=' + this.session.data['user_token'] + '&extension_id=' + extension_id + '&page={page}')
		});

		data['refresh'] = await this.url.link('marketplace/marketplace.comment', 'user_token=' + this.session.data['user_token'] + '&extension_id=' + extension_id + '&page=' + page);

		this.response.setOutput(await this.load.view('marketplace/marketplace_comment', data));
	}

	/**
	 * @return void
	 */
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

		let curl = await require("axios").get(OPENCART_SERVER + 'index.php?route=api/marketplace/comment&extension_id=' + extension_id + '&parent_id=' + parent_id + '&page=' + page);
		let response = curl.data;

		let json = JSON.parse(response);

		data['replies'] = [];
		let reply_total = 0;
		if ((json['reply_total'])) {
			reply_total = json['reply_total'];
		}

		if ((json['replies'])) {
			let results = json['replies'];

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

		data['refresh'] = await this.url.link('marketplace/marketplace.reply', 'user_token=' + this.session.data['user_token'] + '&extension_id=' + extension_id + '&parent_id=' + parent_id + '&page=' + page);

		if ((page * 5) < reply_total) {
			data['next'] = await this.url.link('marketplace/marketplace.reply', 'user_token=' + this.session.data['user_token'] + '&extension_id=' + extension_id + '&parent_id=' + parent_id + '&page=' + (page + 1));
		} else {
			data['next'] = '';
		}

		this.response.setOutput(await this.load.view('marketplace/marketplace_reply', data));
	}
}
