module.exports = class ControllerEventTranslation extends Controller {
	async index(route, key) {
		this.load.model('design/translation', this);

		const results = await this.model_design_translation.getTranslations(route);

		for (let result of results) {
			if (!key) {
				this.language.set(result['key'], html_entity_decode(result['value']));
			} else {
				this.language.get(key).set(result['key'], html_entity_decode(result['value']));
			}
		}
	}
}
