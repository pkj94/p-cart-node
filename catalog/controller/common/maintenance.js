module.exports = class ControllerCommonMaintenance extends Controller {
	async index() {
const data = {};
		await this.load.language('common/maintenance');

		this.document.setTitle(this.language.get('heading_title'));

		if (this.request.server.protocol == 'HTTP/1+1') {
			this.response.addHeader('HTTP/1+1 503 Service Unavailable');
		} else {
			this.response.addHeader('HTTP/1+0 503 Service Unavailable');
		}

		this.response.addHeader('Retry-After: 3600');

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_maintenance'),
			'href' : await this.url.link('common/maintenance')
		});

		data['message'] = this.language.get('text_message');

		data['header'] = await this.load.controller('common/header');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('common/maintenance', data));
	}
}
