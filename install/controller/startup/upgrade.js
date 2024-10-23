
const path = require('path');
global['\Opencart\Install\Controller\Startup\Upgrade'] = class Upgrade extends global['\Opencart\System\Engine\Controller'] {
    async index() {
        let upgrade = false;
        if (fs.existsSync(DIR_OPENCART + 'config.json') && fs.statSync(DIR_OPENCART + 'config.json').size > 0) {
            upgrade = true;
        }
        if (this.request.get.route && (this.request.get.route.startsWith('upgrade/') || this.request.get.route.startsWith('install/step_4'))) {
            upgrade = false;
        }
        if (upgrade) {
            this.response.setRedirect(await this.url.link('upgrade/upgrade'));
        }
    }
}
