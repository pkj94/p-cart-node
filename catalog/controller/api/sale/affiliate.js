module.exports = class Affiliate extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('api/sale/affiliate');

		const json = {};

		if ((this.request.post['affiliate_id'])) {
			affiliate_id = this.request.post['affiliate_id'];
		} else {
			affiliate_id = 0;
		}

		if (affiliate_id) {
			this.load.model('account/affiliate', this);

			affiliate_info = await this.model_account_affiliate.getAffiliate(affiliate_id);

			if (!affiliate_info) {
				json['error'] = this.language.get('error_affiliate');
			}
		}

		if (!Object.keys(json).length) {
			if (affiliate_id) {
				json['success'] = this.language.get('text_success');

				this.session.data['affiliate_id'] = affiliate_id;
			} else {
				json['success'] = this.language.get('text_remove');

				delete (this.session.data['affiliate_id']);
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}