module.exports=class Statistics extends global['\Opencart\System\Engine\Controller'] {
	// catalog/model/catalog/review/addReview/after
	/**
	 * @param string route
	 * @param  args
	 * @param mixed  output
	 *
	 * @return void
	 */
	async addReview(route, args, output) {
		this.load.model('report/statistics',this);

		await this.model_report_statistics.addValue('review', 1);	
	}
		
	// catalog/model/account/returns/addReturn/after

	/**
	 * @param string route
	 * @param  args
	 * @param mixed  output
	 *
	 * @return void
	 */
	async addReturn(route, args, output) {
		this.load.model('report/statistics',this);

		await this.model_report_statistics.addValue('returns', 1);
	}
	
	// catalog/model/checkout/order/addHistory/before

	/**
	 * @param string route
	 * @param  args
	 *
	 * @return void
	 */
	async addHistory(route, args) {
		this.load.model('checkout/order',this);
				
		const order_info = await this.model_checkout_order.getOrder(args[0]);

		if (order_info.order_id) {
			this.load.model('report/statistics',this);

			let old_status_id = order_info['order_status_id'];
			let new_status_id = args[1];

			let processing_status = this.config.get('config_processing_status');
			let complete_status = this.config.get('config_complete_status');

			let active_status = [...processing_status, ...complete_status];

			// If order status in complete or processing add value to sale total
			if (active_status.includes(new_status_id) && !active_status.includes(old_status_id)) {
				await this.model_report_statistics.addValue('order_sale', order_info['total']);
			}
			
			// If order status not in complete or processing remove value to sale total
			if (!active_status.includes(new_status_id) && active_status.includes(old_status_id)) {
				await this.model_report_statistics.removeValue('order_sale', order_info['total']);
			}

			// Add to processing status if new status is in the array
			if (processing_status.includes(new_status_id) && !processing_status.includes(old_status_id)) {
				await this.model_report_statistics.addValue('order_processing', 1);
			}

			// Remove from processing status if new status is not and old status is
			if (!processing_status.includes(new_status_id) && processing_status.includes(old_status_id)) {
				await this.model_report_statistics.removeValue('order_processing', 1);
			}

			// Add to complete status if new status is not array
			if (complete_status.includes(new_status_id) && !complete_status.includes(old_status_id)) {
				await this.model_report_statistics.addValue('order_complete', 1);
			}

			// Remove from complete status if new status is not array
			if (!complete_status.includes(new_status_id) && complete_status.includes(old_status_id)) {
				await this.model_report_statistics.removeValue('order_complete', 1);
			}
		}
	}
}
