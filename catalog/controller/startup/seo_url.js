const str_replace = require('locutus/php/strings/str_replace');
const trim = require('locutus/php/strings/trim');
const http_build_query = require('locutus/php/url/http_build_query');

module.exports = class ControllerStartupSeoUrl extends Controller {
	async index() {
const data = {};
		// Add rewrite to url class
		if (Number(this.config.get('config_seo_url'))) {
			await this.url.addRewrite(this);
		}

		// Decode URL
		if ((this.request.get['_route_'])) {
			let parts = this.request.get['_route_'].split('/');

			// remove any empty arrays from trailing
			if (utf8_strlen(parts[parts.length - 1]) == 0) {
				parts.pop();
			}

			for (let part of parts) {
				const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "seo_url WHERE keyword = '" + this.db.escape(part) + "' AND store_id = '" + this.config.get('config_store_id') + "'");

				if (query.num_rows) {
					let url = query.row['query'].split('=');

					if (url[0] == 'product_id') {
						this.request.get['product_id'] = url[1];
					}

					if (url[0] == 'category_id') {
						if (!(this.request.get['path'])) {
							this.request.get['path'] = url[1];
						} else {
							this.request.get['path'] += '_' + url[1];
						}
					}

					if (url[0] == 'manufacturer_id') {
						this.request.get['manufacturer_id'] = url[1];
					}

					if (url[0] == 'information_id') {
						this.request.get['information_id'] = url[1];
					}

					if (query.row['query'] && url[0] != 'information_id' && url[0] != 'manufacturer_id' && url[0] != 'category_id' && url[0] != 'product_id') {
						this.request.get['route'] = query.row['query'];
					}
				} else {
					this.request.get['route'] = 'error/not_found';

					break;
				}
			}

			if (!(this.request.get['route'])) {
				if ((this.request.get['product_id'])) {
					this.request.get['route'] = 'product/product';
				} else if ((this.request.get['path'])) {
					this.request.get['route'] = 'product/category';
				} else if ((this.request.get['manufacturer_id'])) {
					this.request.get['route'] = 'product/manufacturer/info';
				} else if ((this.request.get['information_id'])) {
					this.request.get['route'] = 'information/information';
				}
			}
		}
	}

	async rewrite(link) {
		let url_info = new URL(link.replaceAll('&amp;', '&'));

		let url = '';

		let data = {};

		data = require('querystring').parse(url_info['query']);

		for (let [key, value] of Object.entries(data)) {
			if ((data['route'])) {
				if ((data['route'] == 'product/product' && key == 'product_id') || ((data['route'] == 'product/manufacturer/info' || data['route'] == 'product/product') && key == 'manufacturer_id') || (data['route'] == 'information/information' && key == 'information_id')) {
					const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "seo_url WHERE `query` = '" + this.db.escape(key + '=' + value) + "' AND store_id = '" + this.config.get('config_store_id') + "' AND language_id = '" + this.config.get('config_language_id') + "'");

					if (query.num_rows && query.row['keyword']) {
						url += '/' + query.row['keyword'];

						delete data[key];
					}
				} else if (key == 'path') {
					const categories = value.split('_');

					for (let category of categories) {
						const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "seo_url WHERE `query` = 'category_id=" + category + "' AND store_id = '" + this.config.get('config_store_id') + "' AND language_id = '" + this.config.get('config_language_id') + "'");

						if (query.num_rows && query.row['keyword']) {
							url += '/' + query.row['keyword'];
						} else {
							url = '';

							break;
						}
					}

					delete data[key];
				}
			}
		}

		if (url) {
			delete data['route'];

			let query = '';

			if (data) {
				for (let [key, value] of Object.entries(data)) {
					query += '&' + encodeURIComponent(key) + '=' + encodeURIComponent((Array.isArray(value) ? http_build_query(value) : value));
				}

				if (query) {
					query = '?' + str_replace('&', '&amp;', trim(query, '&'));
				}
			}

			return url_info['scheme'] + '://' + url_info['host'] + ((url_info['port']) ? ':' + url_info['port'] : '') + str_replace('/index.js', '', url_info['path']) + url + query;
		} else {
			return link;
		}
	}
}
