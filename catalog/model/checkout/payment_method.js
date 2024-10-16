module.exports=class PaymentMethodController extends Controller {
	/**
	 * @param array payment_address
	 *
	 * @return array
	 */
	async getMethods(array payment_address = []) {
		method_data = [];

		this.load.model('setting/extension',this);

		const results = await this.model_setting_extension.getExtensionsByType('payment');

		for (let result of results) {
			if (this.config.get('payment_' + result['code'] + '_status')) {
				this.load.model('extension/' + result['extension'] + '/payment/' + result['code']);

				payment_methods = this.{'model_extension_' + result['extension'] + '_payment_' + result['code']}.getMethods(payment_address);

				if (payment_methods) {
					method_data[result['code']] = payment_methods;
				}
			}
		}

		sort_order = [];

		for (method_data as key : value) {
			sort_order[key] = value['sort_order'];
		}

		method_data= multiSort(method_data,sort_order,'ASC');

		return method_data;
	}
}