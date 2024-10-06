
/**
 * Class Footer
 *
 * @package Opencart\Admin\Controller\Common
 */
module.exports = class FooterController extends Controller {
    /**
     * @return string
     */
    async index() {
        let data = {};
        await this.load.language('common/footer');

        if (this.user.isLogged() && this.request.get['user_token'] && (this.request.get['user_token'] == this.session.data['user_token'])) {
            data['text_version'] = sprintf(this.language.get('text_version'), VERSION);
        } else {
            data['text_version'] = '';
        }

        data['bootstrap'] = 'view/javascript/bootstrap/js/bootstrap.bundle.min.js';

        return this.load.view('common/footer', data);
    }
}