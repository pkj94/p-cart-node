module.exports = class ControllerExtensionRecurringPayPal extends Controller {
	error = {};
			
	async index() {
const data = {};
		content = '';
		
		if (this.config.get('payment_paypal_status') && !empty(this.request.get['order_recurring_id'])) {
			await this.load.language('extension/recurring/paypal');
		
			this.load.model('account/recurring',this);
			
			data['order_recurring_id'] = this.request.get['order_recurring_id'];

			order_recurring_info = await this.model_account_recurring.getOrderRecurring(data['order_recurring_id']);
			
			if (order_recurring_info) {
				data['recurring_status'] = order_recurring_info['status'];
				
				data['info_url'] =  str_replace('&amp;', '&', await this.url.link('extension/recurring/paypal/getRecurringInfo', 'order_recurring_id=' + data['order_recurring_id'], true));
				data['enable_url'] =  str_replace('&amp;', '&', await this.url.link('extension/recurring/paypal/enableRecurring', '', true));
				data['disable_url'] =  str_replace('&amp;', '&', await this.url.link('extension/recurring/paypal/disableRecurring', '', true));
				
				content = await this.load.view('extension/recurring/paypal', data);
			}
		}
		
		return content;
	}
		
	async getRecurringInfo() {
		this.response.setOutput(this.index());
	}
	
	async enableRecurring() {
		if (this.config.get('payment_paypal_status') && !empty(this.request.post['order_recurring_id'])) {
			await this.load.language('extension/recurring/paypal');
			
			this.load.model('extension/payment/paypal');
			
			order_recurring_id = this.request.post['order_recurring_id'];
			
			await this.model_extension_payment_paypal.editOrderRecurringStatus(order_recurring_id, 1);
			
			data['success'] = this.language.get('success_enable_recurring');	
		}
						
		data['error'] = this.error;
				
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json_encode(data));
	}
	
	async disableRecurring() {
		if (this.config.get('payment_paypal_status') && !empty(this.request.post['order_recurring_id'])) {
			await this.load.language('extension/recurring/paypal');
			
			this.load.model('extension/payment/paypal');
			
			order_recurring_id = this.request.post['order_recurring_id'];
			
			await this.model_extension_payment_paypal.editOrderRecurringStatus(order_recurring_id, 2);
			
			data['success'] = this.language.get('success_disable_recurring');	
		}
						
		data['error'] = this.error;
				
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json_encode(data));
	}
}