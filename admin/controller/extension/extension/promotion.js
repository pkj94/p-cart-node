

module.exports = class ControllerExtensionExtensionPromotion extends Controller {

	async index() {
		return '';
		const type = this.request.get['route'].substr(this.request.get['route'].lastIndexOf('/') + 1);
		const url = `${OPENCART_SERVER}index.php?route=api/promotion&type=${type}`;

		try {
			const response = await require('axios').get(url, {
				headers: {
					'Content-Type': 'application/json',
				},
				timeout: 30000,
			});

			if (response.status === 200) {
				return response.data;
			} else {
				return '';
			}
		} catch (error) {
			console.error('Request failed:', error);
			return '';
		}
	}
}
