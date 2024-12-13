module.exports = class ControllerAccountDownload extends Controller {
	async index() {
		const data = {};
		if (!await this.customer.isLogged()) {
			this.session.data['redirect'] = await this.url.link('account/download', '', true);
			await this.session.save(this.session.data);
			this.response.setRedirect(await this.url.link('account/login', '', true));
		}

		await this.load.language('account/download');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/home')
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_account'),
			'href': await this.url.link('account/account', '', true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_downloads'),
			'href': await this.url.link('account/download', '', true)
		});

		this.load.model('account/download', this);
		let page = 1;
		if ((this.request.get['page'])) {
			page = this.request.get['page'];
		}

		const limit = 10;

		data['downloads'] = [];

		const download_total = await this.model_account_download.getTotalDownloads();

		const results = await this.model_account_download.getDownloads((Number(page) - 1) * limit, limit);

		for (let result of results) {
			if (is_file(DIR_DOWNLOAD + result['filename'])) {
				let size = fs.statSync(DIR_DOWNLOAD + result['filename']).size;

				let i = 0;

				let suffix = [
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
					'size': Math.round(substr(size, 0, strpos(size, '+') + 4), 2) + suffix[i],
					'href': await this.url.link('account/download/download', 'download_id=' + result['download_id'], true)
				});
			}
		}

		const pagination = new Pagination();
		pagination.total = download_total;
		pagination.page = page;
		pagination.limit = limit;
		pagination.url = await this.url.link('account/download', 'page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (download_total) ? ((Number(page) - 1) * limit) + 1 : 0, (((Number(page) - 1) * limit) > (download_total - limit)) ? download_total : (((Number(page) - 1) * limit) + limit), download_total, Math.ceil(download_total / limit));

		data['continue'] = await this.url.link('account/account', '', true);

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.setOutput(await this.load.view('account/download', data));
	}

	async download() {
		if (!await this.customer.isLogged()) {
			this.session.data['redirect'] = await this.url.link('account/download', '', true);
			await this.session.save(this.session.data);
			this.response.setRedirect(await this.url.link('account/login', '', true));
		}

		this.load.model('account/download', this);
		let download_id = 0;
		if ((this.request.get['download_id'])) {
			download_id = this.request.get['download_id'];
		}
		const download_info = await this.model_account_download.getDownload(download_id);

		if (download_info.download_id) {
			const file = DIR_DOWNLOAD + download_info['filename'];
			const mask = expressPath.basename(download_info['mask']);

			if (is_file(file)) {
				this.response.setHeader('Content-Type: application/octet-stream');
				this.response.setHeader('Content-Disposition: attachment; filename="' + (mask ? mask : expressPath.basename(file)) + '"');
				this.response.setHeader('Expires: 0');
				this.response.setHeader('Cache-Control: must-revalidate, post-check=0, pre-check=0');
				this.response.setHeader('Pragma: public');
				this.response.setHeader('Content-Length: ' + fs.statSync(file).size);



				this.response.setFile(file);

			} else {
				new Error('Error: Could not find file ' + file + '!');
			}

		} else {
			this.response.setRedirect(await this.url.link('account/download', '', true));
		}
	}
}
