module.exports = class Download extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('account/download');

		if (!await this.customer.isLogged() || (!(this.request.get['customer_token']) || !(this.session.data['customer_token']) || (this.request.get['customer_token'] != this.session.data['customer_token']))) {
			this.session.data['redirect'] = await this.url.link('account/download', 'language=' + this.config.get('config_language'));

			this.response.setRedirect(await this.url.link('account/login', 'language=' + this.config.get('config_language')));
		}

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/home', 'language=' + this.config.get('config_language'))
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_account'),
			'href': await this.url.link('account/account', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_downloads'),
			'href': await this.url.link('account/download', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token'])
		});

		this.load.model('account/download');

		let page = 1;
		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		}

		let limit = 10;

		data['downloads'] = [];

		download_total = await this.model_account_download.getTotalDownloads();

		const results = await this.model_account_download.getDownloads((page - 1) * limit, limit);

		for (let result of results) {
			if (is_file(DIR_DOWNLOAD + result['filename'])) {
				size = filesize(DIR_DOWNLOAD + result['filename']);

				i = 0;

				suffix = [
					'B',
					'KB',
					'MB',
					'GB',
					'TB',
					'PB',
					'EB',
					'ZB',
					'YB'
				];

				while ((size / 1024) > 1) {
					size = size / 1024;
					i++;
				}

				data['downloads'].push({
					'order_id': result['order_id'],
					'date_added': date(this.language.get('date_format_short'), new Date(result['date_added'])),
					'name': result['name'],
					'size': round(substr(size, 0, strpos(size, '+') + 4), 2) + suffix[i],
					'href': await this.url.link('account/download+download', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token'] + '&download_id=' + result['download_id'])
				});
			}
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': download_total,
			'page': page,
			'limit': limit,
			'url': await this.url.link('account/download', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token'] + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (download_total) ? ((page - 1) * limit) + 1 : 0, (((page - 1) * limit) > (download_total - limit)) ? download_total : (((page - 1) * limit) + limit), download_total, Math.ceil(download_total / limit));

		data['continue'] = await this.url.link('account/account', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token']);

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.setOutput(await this.load.view('account/download', data));
	}

	/**
	 * @return void
	 */
	async download() {
		if (!await this.customer.isLogged() || (!(this.request.get['customer_token']) || !(this.session.data['customer_token']) || (this.request.get['customer_token'] != this.session.data['customer_token']))) {
			this.session.data['redirect'] = await this.url.link('account/download', 'language=' + this.config.get('config_language'));

			this.response.setRedirect(await this.url.link('account/login', 'language=' + this.config.get('config_language')));
		}

		this.load.model('account/download');

		if ((this.request.get['download_id'])) {
			download_id = this.request.get['download_id'];
		} else {
			download_id = 0;
		}

		download_info = await this.model_account_download.getDownload(download_id);

		if (download_info) {
			file = DIR_DOWNLOAD + download_info['filename'];
			mask = basename(download_info['mask']);

			if (!headers_sent()) {
				if (is_file(file)) {
					header('Content-Type: application/octet-stream');
					header('Content-Disposition: attachment; filename="' + (mask ? mask : basename(file)) + '"');
					header('Expires: 0');
					header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
					header('Pragma: public');
					header('Content-Length: ' + filesize(file));

					if (ob_get_level()) {
						ob_end_clean();
					}

					readfile(file, 'rb');

					await this.model_account_download.addReport(download_id, (this.request.server.headers['x-forwarded-for'] ||
						this.request.server.connection.remoteAddress ||
						this.request.server.socket.remoteAddress ||
						this.request.server.connection.socket.remoteAddress));

					exit();
				} else {
					exit(sprintf(this.language.get('error_not_found'), basename(file)));
				}
			} else {
				exit(this.language.get('error_headers_sent'));
			}
		} else {
			this.response.setRedirect(await this.url.link('account/download', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token']));
		}
	}
}
