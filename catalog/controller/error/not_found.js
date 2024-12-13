module.exports = class ControllerErrorNotFound extends Controller {
	async index() {
const data = {};
		await this.load.language('error/not_found');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : await this.url.link('common/home')
		});

		if ((this.request.get['route'])) {
			url_data = this.request.get;

			delete url_data['_route_']);

			route = url_data['route'];

			delete url_data['route']);

			url = '';

			if (url_data) {
				url = '&' + decodeURIComponent(http_build_query(url_data, '', '&'));
			}

			data['breadcrumbs'].push({
				'text' : this.language.get('heading_title'),
				'href' : await this.url.link(route, url, this.request.server['HTTPS'])
			});
		}

		data['continue'] = await this.url.link('common/home');

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.addHeader(this.request.server.protocol + ' 404 Not Found');

		this.response.setOutput(await this.load.view('error/not_found', data));
	}
}