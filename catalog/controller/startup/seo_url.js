module.exports = class SeoUrl extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return void
	 */
	async index() {
		// Add rewrite to URL class
		if (Number(this.config.get('config_seo_url'))) {
			this.url.addRewrite(this);

			this.load.model('design/seo_url', this);

			// Decode URL
			if ((this.request.get['_route_'])) {
				let parts = this.request.get['_route_'].split('/');

				// remove any empty arrays from trailing
				if (oc_strlen(parts[parts.length - 1]) == 0) {
					parts.pop();
				}

				for (let part of parts) {
					const seo_url_info = await this.model_design_seo_url.getSeoUrlByKeyword(part);

					if (seo_url_info.seo_url_id) {
						this.request.get[seo_url_info['key']] = html_entity_decode(seo_url_info['value']);
					}
				}
			}
		}
		return true;
	}

	/**
	 * @param string link
	 *
	 * @return string
	 */
	async rewrite(link) {
		let url_info = new URL(link.replace(/&amp;/g, '&'));
		// Build the url
		let url = '';

		if (url_info['scheme']) {
			url += url_info['scheme'];
		}

		url += '://';

		if (url_info['host']) {
			url += url_info['host'];
		}

		if ((url_info['port'])) {
			url += ':' + url_info['port'];
		}

		const query = {};
		new URLSearchParams(url_info.query).forEach((value, key) => {
			query[key] = value;
		});

		// Start changing the URL query into a path
		let paths = [];

		// Parse the query into its separate parts
		let parts = url_info['search'].split('&');

		for (let part of parts) {
			const [key, value] = part.split('=');

			let result = await this.model_design_seo_url.getSeoUrlByKeyValue(key, value);

			if (result.seo_url_id) {
				paths.push(result);

				delete query[key];
			}
		}

		let sort_order = {};

		for (let [key, value] of Object.entries(paths)) {
			sort_order[key] = value['sort_order'];
		}

		// paths = multiSort(paths, sort_order, 'ASC');
		paths = paths.sort((a, b) => a.sort_order - b.sort_order);
		// Build the path
		url += str_replace('/', '', url_info['path']);

		for (let result of paths) {
			url += '/' + result['keyword'];
		}

		// Rebuild the URL query
		if (query) {
			url += '?' + str_replace(['%2F'], ['/'], http_build_query(query));
		}

		return url;
	}
}