module.exports = class ControllerEventTheme extends Controller {
	async index(route, args) {
		// This is only here for compatibility with old templates
		let view = '';
		if (substr(route, -3) == 'tpl') {
			view = substr(route, 0, -3);
		}

		if (is_file(DIR_TEMPLATE + route + '.twig')) {
			this.config.set('template_engine', 'twig');
		} else if (is_file(DIR_TEMPLATE + route + '.tpl')) {
			this.config.set('template_engine', 'template');
		}
	}
}
