module.exports = class ControllerCommonSearch extends Controller {
	async index() {
const data = {};
		await this.load.language('common/search');

		data['text_search'] = this.language.get('text_search');

		if ((this.request.get['search'])) {
			data['search'] = this.request.get['search'];
		} else {
			data['search'] = '';
		}

		return await this.load.view('common/search', data);
	}
}