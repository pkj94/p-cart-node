module.exports = class ControllerExtensionAnalyticsGoogle extends Controller {
    async index() {
const data = {};
		return html_entity_decode(this.config.get('analytics_google_code'));
	}
}
