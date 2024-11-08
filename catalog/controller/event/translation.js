module.exports = class Translation extends Controller {
	/**
	 * @param string route
	 * @param string prefix
	 *
	 * @return void
	 */
	async index(route, prefix) {
		this.load.model('design/translation', this);

		const results = await this.model_design_translation.getTranslations(route);

		for (let result of results) {
			if (!prefix) {
				this.language.set(result['key'], html_entity_decode(result['value']));
			} else {
				this.language.set(prefix + '_' + result['key'], html_entity_decode(result['value']));
			}
		}
	}
}
