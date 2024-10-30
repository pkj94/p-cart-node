const html_entity_decode = require("locutus/php/strings/html_entity_decode");

module.exports = class Theme extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @param string route
	 * @param  args
	 * @param string code
	 *
	 * @return void
	 */
	async index(route, args, code) {
		// If there is a theme override we should get it
		this.load.model('design/theme', this);

		const theme_info = await this.model_design_theme.getTheme(route, this.config.get('config_theme'));
		if (theme_info.theme_id) {
			 code.value = html_entity_decode(theme_info['code']);
		}

	}
}