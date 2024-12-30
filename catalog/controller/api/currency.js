module.exports = class ControllerApiCurrency extends Controller {
	async index() {
const data = {};
		await this.load.language('api/currency');

		const json = {};

		if (!(this.session.data['api_id'])) {
			json['error'] = this.language.get('error_permission');
		} else {
			this.load.model('localisation/currency',this);

			const currency_info = await this.model_localisation_currency.getCurrencyByCode(this.request.post['currency']);

			if (currency_info.currency_id) {
				this.session.data['currency'] = this.request.post['currency'];

				delete this.session.data['shipping_method'];
				delete this.session.data['shipping_methods'];

				json['success'] = this.language.get('text_success');
			} else {
				json['error'] = this.language.get('error_currency');
			}
		}
		await this.session.save(this.session.data);
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
