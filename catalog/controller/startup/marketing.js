module.exports = class MarketingController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		let tracking = '';

		if ((this.request.get['tracking'])) {
			tracking = this.request.get['tracking'];
		}

		if ((this.request.cookie['tracking'])) {
			tracking = this.request.cookie['tracking'];
		}

		// Tracking Code
		if (tracking) {
			this.load.model('marketing/marketing', this);

			const marketing_info = await this.model_marketing_marketing.getMarketingByCode(tracking);

			if (marketing_info.marketing_id) {
				await this.model_marketing_marketing.addReport(marketing_info['marketing_id'], this.request.server['REMOTE_ADDR']);
			}

			if (this.config.get('config_affiliate_status')) {
				this.load.model('account/affiliate', this);

				const affiliate_info = await this.model_account_affiliate.getAffiliateByTracking(tracking);

				if (affiliate_info.affiliate_id && affiliate_info['status']) {
					await this.model_account_affiliate.addReport(affiliate_info['customer_id'], this.request.server['REMOTE_ADDR']);
				}

				if (marketing_info.marketing_id || (affiliate_info && affiliate_info['status'])) {
					this.session.data['tracking'] = tracking;

					if (!(this.request.cookie['tracking'])) {
						let option = {
							'expires': this.config.get('config_affiliate_expire') ? new Date(Date.now() + parseInt(thsi.config.get('config_affiliate_expire')) * 1000) : 0,
							'path': this.config.get('session_path'),
							'SameSite': this.config.get('config_session_samesite')
						};

						this.response.response.cookie('tracking', tracking, option);
					}
				}
			}
		}
	}
}
