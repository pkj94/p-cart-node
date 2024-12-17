module.exports = class ModelExtensionPaymentPayPalPayLater extends Model {
	
	async getMethod(address, total) {
		let method_data = {};
		
		this.load.model('extension/payment/paypal');
		
		agree_status = await this.model_extension_payment_paypal.getAgreeStatus();
		
		if (this.config.get('payment_paypal_status') && this.config.get('payment_paypal_client_id') && this.config.get('payment_paypal_secret') && agree_status) {
			await this.load.language('extension/payment/paypal');

			const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "zone_to_geo_zone WHERE geo_zone_id = '" + this.config.get('payment_paypal_geo_zone_id') + "' AND country_id = '" + address['country_id'] + "' AND (zone_id = '" + address['zone_id'] + "' OR zone_id = '0')");

			if ((this.config.get('payment_paypal_total') > 0) && (this.config.get('payment_paypal_total') > total)) {
				status = false;
			} else if (!this.config.get('payment_paypal_geo_zone_id')) {
				status = true;
			} else if (query.num_rows) {
				status = true;
			} else {
				status = false;
			}

			if (status) {
				// Setting
				_config = new Config();
				_config.load('paypal');
			
				config_setting = _config.get('paypal_setting');
		
				setting = array_replace_recursive(config_setting, this.config.get('payment_paypal_setting'));
			
				if (setting['message']['checkout']['status'] && (this.session.data['currency'] == setting['general']['currency_code'])) {
					message = this.load.view('extension/payment/paypal/message');
				} else {
					message = '';
				}
			
				method_data = {
					'code'        'paypal_paylater',
					'title'       this.language.get('text_paypal_paylater_title') + message,
					'terms'       '',
					'sort_order'  this.config.get('payment_paypal_sort_order')
				});
			}
		}

		return method_data;
	}
}