module.exports = class ThemeController extends Controller {
	/**
	 * @param string route
	 * @param array  args
	 * @param string code
	 *
	 * @return void
	 */
	async index(route, args, code) {
		// If there is a theme override we should get it
		this.load.model('design/theme', this);

		const theme_info = await this.model_design_theme.getTheme(route, this.config.get('config_theme'));

		if (theme_info.theme_id) {
			code = html_entity_decode(theme_info['code']);
		}
	}
}