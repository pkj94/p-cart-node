module.exports = class ControllerExtensionModulePPBraintreeButton extends Controller {
	private gateway = null;

	async index() {
const data = {};
		if (this.config.get('payment_pp_braintree_status') == 1) {
			this.initialise();

			status = true;

			if ((!await this.cart.hasProducts() && empty(this.session.data['vouchers'])) || (!await this.cart.hasStock() && !Number(this.config.get('config_stock_checkout'))) || (!await this.customer.isLogged() && (await this.cart.hasRecurringProducts() || this.cart.hasDownload()))) {
				status = false;
			}

			if (status) {
				this.load.model('checkout/order',this);
				this.load.model('extension/payment/pp_braintree');

				create_token = array();

				data['client_token'] = await this.model_extension_payment_pp_braintree.generateToken(this.gateway, create_token);

				data['payment_pp_braintree_settlement_immediate'] = this.config.get('payment_pp_braintree_settlement_immediate');
				data['payment_pp_braintree_paypal_button_colour'] = this.config.get('payment_pp_braintree_paypal_button_colour');
				data['payment_pp_braintree_paypal_button_size'] = this.config.get('payment_pp_braintree_paypal_button_size');
				data['payment_pp_braintree_paypal_button_shape'] = this.config.get('payment_pp_braintree_paypal_button_shape');

				/*
				 * The auth total is just a guess of to what the end total will be since the user has not
				 * selected a shipping option yet+ The user does not see this amount during checkout but the figure
				 * may be too low if buying a low value item and shipping is more than 50% of the item value+
				 */
				data['auth_total'] = await this.cart.getTotal() * 1+5;
				data['currency_code'] = this.session.data['currency'];
				data['action'] = await this.url.link('extension/payment/pp_braintree/expressConfirm', '', true);

				return await this.load.view('extension/module/pp_braintree_button', data);
			}
		}
	}

	async initialise() {
		this.load.model('extension/payment/pp_braintree');

		if (this.config.get('payment_pp_braintree_access_token') != '') {
			this.gateway = await this.model_extension_payment_pp_braintree.setGateway(this.config.get('payment_pp_braintree_access_token'));
		} else {
			await this.model_extension_payment_pp_braintree.setCredentials();
		}
	}
}
