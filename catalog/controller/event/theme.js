module.exports = class ControllerEventTheme extends Controller {
	async index(route, args, code) {

		if (!Number(this.config.get('theme_' + this.config.get('config_theme') + '_status'))) {
			new Error('Error: A theme has not been assigned to this store!');
		}

		// If the default theme is selected we need to know which directory its pointing to
		let directory = this.config.get('config_theme');
		if (this.config.get('config_theme') == 'default') {
			directory = this.config.get('theme_default_directory');
		}
		if (directory != 'default' && is_file(DIR_TEMPLATE + directory + '/template/' + route + '.twig')) {
			this.config.set('template_directory', directory + '/template/');
		} else if (is_file(DIR_TEMPLATE + 'default/template/' + route + '.twig')) {
			this.config.set('template_directory', 'default/template/');
		}

		// If there is a theme override we should get it
		this.load.model('design/theme', this);

		const theme_info = await this.model_design_theme.getTheme(route, directory);
		if (theme_info && theme_info.code) {
			code = html_entity_decode(theme_info['code']);
		}
	}
}