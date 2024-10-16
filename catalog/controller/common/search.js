module.exports=class SearchController extends Controller {
	/**
	 * @return string
	 */
	async index() {
const data ={};
		await this.load.language('common/search');

		data['text_search'] = this.language.get('text_search');

		if ((this.request.get['search'])) {
			data['search'] = this.request.get['search'];
		} else {
			data['search'] = '';
		}

		data['language'] = this.config.get('config_language');

		return await this.load.view('common/search', data);
	}
}