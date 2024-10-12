<?php
namespace Opencart\Catalog\Controller\Extension\Opencart\Currency;
/**
 * Class Fixer
 *
 * @package
 */
class FixerController extends Controller {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @param string $default
	 *
	 * @return void
	 */
	async currency(string $default = '') {
		if (this.config.get('currency_fixer_status')) {
			$curl = curl_init();

			curl_setopt($curl, CURLOPT_URL, 'http://data.fixer.io/api/latest?access_key=' . this.config.get('currency_fixer_api'));
			curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
			curl_setopt($curl, CURLOPT_HEADER, false);
			curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, 0);
			curl_setopt($curl, CURLOPT_CONNECTTIMEOUT, 30);
			curl_setopt($curl, CURLOPT_TIMEOUT, 30);

			$response = curl_exec($curl);

			curl_close($curl);

			$response_info = JSON.parse($response, true);

			if (is_array($response_info) && ($response_info['rates'])) {
				// Compile all the rates into an array
				$currencies = [];

				$currencies['EUR'] = 1.0000;

				foreach ($response_info['rates'] as $key : $value) {
					$currencies[$key] = $value;
				}

				this.load.model('localisation/currency');

				const results = await this.model_localisation_currency.getCurrencies();

				for(let result of results) {
					if (($currencies[result['code']])) {
						$from = $currencies['EUR'];

						$to = $currencies[result['code']];

						await this.model_localisation_currency.editValueByCode(result['code'], 1 / ($currencies[$default] * ($from / $to)));
					}
				}

				await this.model_localisation_currency.editValueByCode($default, 1);

				this.cache.delete('currency');
			}
		}
	}
}