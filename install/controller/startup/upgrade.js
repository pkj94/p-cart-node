const fs = require('fs');
const path = require('path');
module.exports = class Upgrade extends Controller {
    index() {
        let upgrade = false;
        if (fs.existsSync(DIR_OPENCART, 'config.js') && fs.statSync(DIR_OPENCART, 'config.js').size > 0) {
            upgrade = true;
        }
        if (this.request.get.route && (this.request.get.route.startsWith('upgrade/') || this.request.get.route.startsWith('install/step_4'))) {
            upgrade = false;
        }
        if (upgrade) {
            this.response.redirect(this.url.link('upgrade/upgrade'));
        }
    }
}
