global['\Opencart\Admin\Controller\Extension\Opencart\Currency\Ecb'] = class ECB extends global['\Opencart\System\Engine\Controller'] {
  constructor(registry) {
    super(registry)
  }
  async index() {
    await this.load.language('extension/opencart/currency/ecb');

    this.document.setTitle(this.language.get('heading_title'));

    const data = {
      text_support: this.language.get('text_support'),
      breadcrumbs: [
        {
          text: this.language.get('text_home'),
          href: await this.url.link('common/dashboard', `user_token=${this.session.data['user_token']}`)
        },
        {
          text: this.language.get('text_extension'),
          href: await this.url.link('marketplace/extension', `user_token=${this.session.data['user_token']}&type=currency`)
        },
        {
          text: this.language.get('heading_title'),
          href: await this.url.link('extension/opencart/currency/ecb', `user_token=${this.session.data['user_token']}`)
        }
      ],
      save: await this.url.link('extension/opencart/currency/ecb.save', `user_token=${this.session.data['user_token']}`),
      back: await this.url.link('marketplace/extension', `user_token=${this.session.data['user_token']}&type=currency`),
      currency_ecb_status: this.config.get('currency_ecb_status'),
      header: await this.load.controller('common/header'),
      column_left: await this.load.controller('common/column_left'),
      footer: await this.load.controller('common/footer')
    };

    this.response.setOutput(await this.load.view('extension/opencart/currency/ecb', data));
  }

  async save() {
    await this.load.language('extension/opencart/currency/ecb');

    const json = {};

    if (!await this.user.hasPermission('modify', 'extension/opencart/currency/ecb')) {
      json.error = this.language.get('error_permission');
    }

    if (!json.error) {
      this.load.model('setting/setting', this);

      await this.model_setting_setting.editSetting('currency_ecb', this.request.post);

      json.success = this.language.get('text_success');
    }

    this.response.addHeader('Content-Type: application/json');
    this.response.setOutput(JSON.stringify(json));
  }

  async currencyConvert(default_ = '') {
    console.log('test ecb',this.config.get('currency_ecb_status'))
    if (this.config.get('currency_ecb_status')) {
      try {
        const response = await require('axios').get('https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml', {
          timeout: 30000
        });
        if (response.status === 200) {
          const xmlText = JSON.parse(xmlParser.toJson(response.data));
          // console.log('xmlText----', xmlText['gesmes:Envelope'])
          const cube = xmlText['gesmes:Envelope']['Cube']['Cube']['Cube'];

          const currencies = {
            EUR: 1.0000
          };

          for (const currency of cube) {
            if (currency.currency) {
              currencies[currency.currency] = parseFloat(currency.rate);
            }
          }

          const value = currencies[default_] || currencies.EUR;

          if (Object.keys(currencies).length) {
            this.load.model('localisation/currency', this);
            const results = await this.model_localisation_currency.getCurrencies();

            for (const [code, result] of Object.entries(results)) {
              if (currencies[result.code]) {
                await this.model_localisation_currency.editValueByCode(result.code, 1 / (value * (value / currencies[result.code])));
              }
            }

            await this.model_localisation_currency.editValueByCode(default_, '1.00000');
          }
        }
      } catch (error) {
        console.log(error)
        console.error('Error fetching currency data:', error);
      }
    }

    await this.cache.delete('currency');
  }
}
