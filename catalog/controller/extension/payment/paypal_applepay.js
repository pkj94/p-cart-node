module.exports = class ControllerExtensionPaymentPayPalApplePay extends Controller {
	error = {};
			
	async index() {
const data = {};
		this.load.model('extension/payment/paypal');
		
		agree_status = await this.model_extension_payment_paypal.getAgreeStatus();
		
		if (this.config.get('payment_paypal_status') && this.config.get('payment_paypal_client_id') && this.config.get('payment_paypal_secret') && agree_status) {
			await this.load.language('extension/payment/paypal');
							
			_config = new Config();
			_config.load('paypal');
			
			config_setting = _config.get('paypal_setting');
		
			setting = array_replace_recursive(config_setting, this.config.get('payment_paypal_setting'));
						
			data['client_id'] = this.config.get('payment_paypal_client_id');
			data['secret'] = this.config.get('payment_paypal_secret');
			data['merchant_id'] = this.config.get('payment_paypal_merchant_id');
			data['environment'] = this.config.get('payment_paypal_environment');
			data['partner_id'] = setting['partner'][data['environment']]['partner_id'];
			data['partner_attribution_id'] = setting['partner'][data['environment']]['partner_attribution_id'];
			data['checkout_mode'] = setting['general']['checkout_mode'];
			data['transaction_method'] = setting['general']['transaction_method'];
			
			if (setting['applepay_button']['checkout']['status']) {
				data['applepay_button_status'] = setting['applepay_button']['checkout']['status'];
			}
											
			require_once DIR_SYSTEM +'library/paypal/paypal.js';
		
			paypal_info = array(
				'partner_id' : data['partner_id'],
				'client_id' : data['client_id'],
				'secret' : data['secret'],
				'environment' : data['environment'],
				'partner_attribution_id' : data['partner_attribution_id']
			});
		
			paypal = new PayPal(paypal_info);
		
			token_info = array(
				'grant_type' : 'client_credentials'
			});	
				
			paypal.setAccessToken(token_info);
		
			data['client_token'] = paypal.getClientToken();
						
			if (paypal.hasErrors()) {
				error_messages = array();
				
				errors = paypal.getErrors();
								
				for (errors of error) {
					if ((error['name']) && (error['name'] == 'CURLE_OPERATION_TIMEOUTED')) {
						error['message'] = this.language.get('error_timeout');
					}
				
					if ((error['details'][0]['description'])) {
						error_messages.push(error['details'][0]['description'];
					} else if ((error['message'])) {
						error_messages.push(error['message'];
					}
									
					await this.model_extension_payment_paypal.log(error, error['message']);
				}
				
				this.error['warning'] = implode(' ', error_messages);
			}

			if (!empty(this.error['warning'])) {
				this.error['warning'] += ' ' + sprintf(this.language.get('error_payment'), await this.url.link('information/contact', '', true));
			}	

			data['error'] = this.error;			

			return await this.load.view('extension/payment/paypal/paypal_applepay', data);
		}
		
		return '';
	}
	
	async modal() {
		await this.load.language('extension/payment/paypal');
							
		_config = new Config();
		_config.load('paypal');
			
		config_setting = _config.get('paypal_setting');
		
		setting = array_replace_recursive(config_setting, this.config.get('payment_paypal_setting'));
						
		data['client_id'] = this.config.get('payment_paypal_client_id');
		data['secret'] = this.config.get('payment_paypal_secret');
		data['merchant_id'] = this.config.get('payment_paypal_merchant_id');
		data['environment'] = this.config.get('payment_paypal_environment');
		data['partner_id'] = setting['partner'][data['environment']]['partner_id'];
		data['partner_attribution_id'] = setting['partner'][data['environment']]['partner_attribution_id'];
		data['transaction_method'] = setting['general']['transaction_method'];
			
		if (setting['applepay_button']['checkout']['status']) {
			data['applepay_button_status'] = setting['applepay_button']['checkout']['status'];
		}
				
		require_once DIR_SYSTEM +'library/paypal/paypal.js';
		
		paypal_info = array(
			'partner_id' : data['partner_id'],
			'client_id' : data['client_id'],
			'secret' : data['secret'],
			'environment' : data['environment'],
			'partner_attribution_id' : data['partner_attribution_id']
		});
		
		paypal = new PayPal(paypal_info);
		
		token_info = array(
			'grant_type' : 'client_credentials'
		});	
				
		paypal.setAccessToken(token_info);
		
		data['client_token'] = paypal.getClientToken();
						
		if (paypal.hasErrors()) {
			error_messages = array();
				
			errors = paypal.getErrors();
								
			for (errors of error) {
				if ((error['name']) && (error['name'] == 'CURLE_OPERATION_TIMEOUTED')) {
					error['message'] = this.language.get('error_timeout');
				}
				
				if ((error['details'][0]['description'])) {
					error_messages.push(error['details'][0]['description'];
				} else if ((error['message'])) {
					error_messages.push(error['message'];
				}
									
				await this.model_extension_payment_paypal.log(error, error['message']);
			}
				
			this.error['warning'] = implode(' ', error_messages);
		}

		if (!empty(this.error['warning'])) {
			this.error['warning'] += ' ' + sprintf(this.language.get('error_payment'), await this.url.link('information/contact', '', true));
		}	

		data['error'] = this.error;		

		this.response.setOutput(await this.load.view('extension/payment/paypal/paypal_applepay_modal', data));
	}
}