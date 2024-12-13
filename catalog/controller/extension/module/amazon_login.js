module.exports = 
class ControllerExtensionModuleAmazonLogin extends Controller {
    async index() {
const data = {};
        if (this.config.get('payment_amazon_login_pay_status') && this.config.get('module_amazon_login_status') && !await this.customer.isLogged() && !empty(this.request.server['HTTPS'])) {

            this.load.model('extension/payment/amazon_login_pay');

            // capital L in Amazon cookie name is required, do not alter for coding standards
            if ((this.request.cookie['amazon_Login_state_cache'])) {
                setcookie('amazon_Login_state_cache', null, -1, '/');
            }

            amazon_payment_js = await this.model_extension_payment_amazon_login_pay.getWidgetJs();

            this.document.addScript(amazon_payment_js);

            data['client_id'] = trim(this.config.get('payment_amazon_login_pay_client_id'));
            data['merchant_id'] = this.config.get('payment_amazon_login_pay_merchant_id');
            data['return_url'] = html_entity_decode(await this.url.link('extension/module/amazon_login/login', '', true), ENT_COMPAT, "UTF-8");
            data['button_id'] = 'AmazonLoginButton';

            if (this.config.get('payment_amazon_login_pay_test') == 'sandbox') {
                data['sandbox'] = (this.session.data['user_id']); // Require an active admin panel session to show debug messages
            }

            if (this.config.get('module_amazon_login_button_type')) {
                data['button_type'] = this.config.get('module_amazon_login_button_type');
            } else {
                data['button_type'] = 'lwa';
            }

            if (this.config.get('module_amazon_login_button_colour')) {
                data['button_colour'] = this.config.get('module_amazon_login_button_colour');
            } else {
                data['button_colour'] = 'gold';
            }

            if (this.config.get('module_amazon_login_button_size')) {
                data['button_size'] = this.config.get('module_amazon_login_button_size');
            } else {
                data['button_size'] = 'medium';
            }

            if(!empty(this.session.data['language'])) {
              session_lang = this.session.data['language'];
              session_lang_code = current(explode('-', session_lang));
              language_region_mapping = array(
                'EUR' : array('de-De', 'es-ES','fr-FR', 'it-IT', 'en-GB'),
                'GBP' : array('de-De', 'es-ES','fr-FR', 'it-IT', 'en-GB'),
                'USD' :array('en-US')
              );

              if(this.config.get('payment_amazon_login_pay_payment_region')) {
                merchant_location = this.config.get('payment_amazon_login_pay_payment_region');
                available_codes = language_region_mapping[merchant_location];
                data['language'] = (this.config.get('payment_amazon_login_pay_language')) ? this.config.get('payment_amazon_login_pay_language') : 'en-US';
                for (available_codes of l_code) {
                  l_code_short = current(explode('-', l_code));
                  if(session_lang_code == l_code_short) {
                    data['language'] = l_code;
                  }
                }
              }
            } else {
              data['language'] = (this.config.get('payment_amazon_login_pay_language')) ? this.config.get('payment_amazon_login_pay_language') : 'en-US';
            }

            return await this.load.view('extension/module/amazon_login', data);
        }
    }

    async login() {
        await this.load.language('extension/payment/amazon_login_pay');
        await this.load.language('account/login');

        this.load.model('extension/module/amazon_login');

        from_amazon_pay = (this.request.get['from_amazon_pay']);

        delete this.session.data['apalwa']);

        try {
            if ((this.request.get['access_token'])) {
                access_token = this.request.get['access_token'];

                this.session.data['apalwa']['login']['access_token'] = access_token;

                await this.model_extension_module_amazon_login.verifyAccessToken(access_token);

                amazon_profile = await this.model_extension_module_amazon_login.fetchProfile(access_token);
            } else {
                await this.model_extension_module_amazon_login.debugLog("EXCEPTION", this.language.get('error_login'));

                throw new \RuntimeException(this.language.get('error_login'));
            }

            // No issues found, and the Amazon profile has been fetched
            if (from_amazon_pay) {
                delete this.session.data['guest']);
                delete this.session.data['account']);

                if (this.config.get('payment_amazon_login_pay_checkout') == 'guest') {
                    this.session.data['account'] = 'guest';

                    this.session.data['guest']['customer_group_id'] = this.config.get('config_customer_group_id');
                    this.session.data['guest']['firstname'] = amazon_profile.first_name;
                    this.session.data['guest']['lastname'] = amazon_profile.last_name;
                    this.session.data['guest']['email'] = amazon_profile.email;
                    this.session.data['guest']['telephone'] = '0000000';

                    this.session.data['apalwa']['pay']['profile'] = this.session.data['guest'];
                } else {
                    // The payment button must log in a customer
                    this.session.data['account'] = 'register';

                    profile = await this.model_extension_module_amazon_login.loginProfile(amazon_profile);

                    this.session.data['apalwa']['pay']['profile'] = profile;

                    // If a customer is already logged in, we must overwrite their data with amazon data
                    // Therefore, at the end of the day, we will have a 
                }

                this.response.setRedirect(await this.url.link('extension/payment/amazon_login_pay/address', '', true));
            } else {
                await this.model_extension_module_amazon_login.loginProfile(amazon_profile);

                this.response.setRedirect(await this.url.link('account/account', '', true));
            }
        } catch (\RuntimeException e) {
            this.session.data['apalwa']['login']['error'] = e.getMessage();

            this.response.setRedirect(await this.url.link('extension/module/amazon_login/error', '', true));
        }
    }

    async error() {
        await this.load.language('extension/payment/amazon_login_pay');

        data = array();

        continue = await this.url.link('common/home', '', true);

        if ((this.session.data['apalwa']['login']['error'])) {
            data['error'] = this.session.data['apalwa']['login']['error'];
            data['continue'] = continue;
            data['heading_title'] = this.language.get('error_login');

            this.document.setTitle(this.language.get('error_login'));

            delete this.session.data['apalwa']);

            data['breadcrumbs'] = [];

            data['breadcrumbs'].push({
                'href' : await this.url.link('common/home', '', true),
                'text' : this.language.get('text_home')
            );

            data['breadcrumbs'].push({
                'href' : null,
                'current' : true,
                'text' : this.language.get('error_login')
            );

            data['content_main'] = await this.load.view('extension/module/amazon_login_error', data);
            data['column_left'] = await this.load.controller('common/column_left');
            data['column_right'] = await this.load.controller('common/column_right');
            data['content_top'] = await this.load.controller('common/content_top');
            data['content_bottom'] = await this.load.controller('common/content_bottom');
            data['footer'] = await this.load.controller('common/footer');
            data['header'] = await this.load.controller('common/header');

            this.response.setOutput(await this.load.view('extension/payment/amazon_login_pay_generic', data));
        } else {
            this.response.setRedirect(continue);
        }
    }

    async logout() {
        delete this.session.data['apalwa']);

        // capital L in Amazon cookie name is required, do not alter for coding standards
        if ((this.request.cookie['amazon_Login_state_cache'])) {
            //@todo - rework this by triggering the JavaScript logout
            setcookie('amazon_Login_state_cache', null, -1, '/');
        }
    }
}
