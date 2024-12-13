module.exports = class ModelExtensionModuleLaybuyLayout extends Model {
	async getStatusLabel(id) {
		const statuses = await this.getTransactionStatuses();

		for (let status of statuses) {
			if (status['status_id'] == id && status['status_name'] != '') {
				return status['status_name'];

				break;
			}
		}

		return id;
	}

	async getTransactionByOrderId(order_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "laybuy_transaction` WHERE `order_id` = '" + order_id + "' ORDER BY `laybuy_ref_no` DESC LIMIT 1");

		return query.row;
	}

	async getTransactionStatuses() {
		await this.load.language('extension/payment/laybuy');

		const transaction_statuses = [
			{
				'status_id': 1,
				'status_name': this.language.get('text_status_1')
			},
			{
				'status_id': 5,
				'status_name': this.language.get('text_status_5')
			},
			{
				'status_id': 7,
				'status_name': this.language.get('text_status_7')
			},
			{
				'status_id': 50,
				'status_name': this.language.get('text_status_50')
			},
			{
				'status_id': 51,
				'status_name': this.language.get('text_status_51')
			}
		];

		return transaction_statuses;
	}

	async isLayBuyOrder(order_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "laybuy_transaction` WHERE `order_id` = '" + order_id + "'");

		if (query.num_rows) {
			return true;
		} else {
			return false;
		}
	}
}