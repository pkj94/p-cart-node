const str_replace = require("locutus/php/strings/str_replace");

module.exports = class PaginationController extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @param array setting
	 *
	 * @return string
	 */
	async index(setting) {
		let total = 0;
		if ((setting['total'])) {
			total = setting['total'];
		}
		let page = 1;
		if ((setting['page']) && setting['page'] > 0) {
			page = setting['page'];
		} else {
			page = 1;
		}
		let limit = 10;
		if ((setting['limit']) && setting['limit']) {
			limit = Number(setting['limit']);
		} else {
			limit = 10;
		}
		let url = '';
		if ((setting['url'])) {
			url = setting['url'].replace(new RegExp('%7Bpage%7D'), '{page}');
		}

		let num_links = 8;
		let num_pages = Math.ceil(total / limit);
		let back = false;
		let end;
		if (url && page > 1 && num_pages < page) {
			back = true;
		} else {
			back = false;
		}

		const data = { page: page };

		if (page > 1) {
			data['first'] = str_replace(['&amp;page={page}', '?page={page}', '&page={page}'], '', url);

			if (page - 1 === 1) {
				data['prev'] = str_replace(['&amp;page={page}', '?page={page}', '&page={page}'], '', url);
			} else {
				data['prev'] = str_replace('{page}', page - 1, url);
			}
		} else {
			data['first'] = '';
			data['prev'] = '';
		}

		data['links'] = [];
		let start = 1;
		if (num_pages > 1) {
			if (num_pages <= num_links) {
				start = 1;
				end = num_pages;
			} else {
				start = page - Math.floor(num_links / 2);
				end = page + Math.floor(num_links / 2);

				if (start < 1) {
					end += Math.abs(start) + 1;
					start = 1;
				}

				if (end > num_pages) {
					start -= (end - num_pages);
					end = num_pages;
				}
			}

			for (let i = start; i <= end; i++) {
				data['links'].push({
					'page': i,
					'href': str_replace('{page}', i, url)
				});
			}
		}

		if (num_pages > page) {
			data['next'] = str_replace('{page}', page + 1, url);
			data['last'] = str_replace('{page}', num_pages, url);
		} else {
			data['next'] = '';
			data['last'] = '';
		}
		if (num_pages > 1 || back) {
			return await this.load.view('common/pagination', data);
		} else {
			return '';
		}
	}
}
