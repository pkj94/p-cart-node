module.exports = class CurrencyController extends Controller {
    constructor(registry) {
        super(registry)
    }

    async index(route, args, output) {
        let currency;

        if (route === 'model/setting/setting/editSetting' && args[0] === 'config' && args[1].config_currency) {
            currency = args[1].config_currency;
        } else {
            currency = this.config.get('config_currency');
        }

        this.load.model('setting/extension', this);
        const extension_info = await this.model_setting_extension.getExtensionByCode('currency', this.config.get('config_currency_engine'));

        if (extension_info) {
            await this.load.controller('extension/' + extension_info['extension'] + '/currency/' + extension_info['code'] + '.currency', currency);
        }
    }
}

