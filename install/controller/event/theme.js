module.exports = class ControllerEventTheme extends Controller {
    async index(view, data) {
        if (is_file(DIR_TEMPLATE + view + '.twig')) {
            this.config.set('template_engine', 'twig');
        } else if (is_file(DIR_TEMPLATE + view + '.tpl')) {
            this.config.set('template_engine', 'js');
        }
    }
}
