module.exports = class ModelExtensionPaymentLaybuy extends Model {
	async addRevisedTransaction(data = {}) {
		const query = await this.db.query("INSERT INTO `" + DB_PREFIX + "laybuy_revise_request` SET `laybuy_transaction_id` = '" + data['transaction_id'] + "', `type` = '" + this.db.escape(data['type']) + "', `order_id` = '" + data['order_id'] + "', `firstname` = '" + this.db.escape(data['firstname']) + "', `lastname` = '" + this.db.escape(data['lastname']) + "', `address` = '" + this.db.escape(data['address']) + "', `suburb` = '" + this.db.escape(data['suburb']) + "', `state` = '" + this.db.escape(data['state']) + "', `country` = '" + this.db.escape(data['country']) + "', `postcode` = '" + this.db.escape(data['postcode']) + "', `email` = '" + this.db.escape(data['email']) + "', `amount` = '" + data['amount'] + "', `currency` = '" + this.db.escape(data['currency']) + "', `downpayment` = '" + this.db.escape(data['downpayment']) + "', `months` = '" + data['months'] + "', `downpayment_amount` = '" + data['downpayment_amount'] + "', `payment_amounts` = '" + data['payment_amounts'] + "', `first_payment_due` = '" + this.db.escape(data['first_payment_due']) + "', `last_payment_due` = '" + this.db.escape(data['last_payment_due']) + "', `store_id` = '" + data['store_id'] + "', `status` = '" + data['status'] + "', `report` = '" + this.db.escape(data['report']) + "', `transaction` = '" + data['transaction'] + "', `paypal_profile_id` = '" + this.db.escape(data['paypal_profile_id']) + "', `laybuy_ref_no` = '" + data['laybuy_ref_no'] + "', `payment_type` = '" + data['payment_type'] + "', `date_added` = NOW()");

		return this.db.getLastId();
	}

	async getCustomerIdByOrderId(order_id) {
		const query = await this.db.query("SELECT `customer_id` FROM `" + DB_PREFIX + "order` WHERE `order_id` = '" + order_id + "'");

		if (query.num_rows) {
			return query.row['customer_id'];
		} else {
			return 0;
		}
	}

	async getInitialPayments() {
		let minimum = this.config.get('payment_laybuy_min_deposit') ? this.config.get('payment_laybuy_min_deposit') : 20;

		let maximum = this.config.get('payment_laybuy_max_deposit') ? this.config.get('payment_laybuy_max_deposit') : 50;

		let initial_payments = [];

		for (let i = minimum; i <= maximum; i += 10) {
			initial_payments.push(i);
		}

		return initial_payments;
	}

	async getMonths() {
		await this.load.language('extension/payment/laybuy');

		let max_months = this.config.get('payment_laybuy_max_months');

		if (!max_months) {
			max_months = 3;
		}

		if (max_months < 1) {
			max_months = 1;
		}

		let months = [];

		for (let i = 1; i <= max_months; i++) {
			months.push({
				'value': i,
				'label': i + ' ' + ((i > 1) ? this.language.get('text_months') : this.language.get('text_month'))
			});
		}

		return months;
	}

	async getPayPalProfileIds() {
		const query = await this.db.query("SELECT `paypal_profile_id` FROM `" + DB_PREFIX + "laybuy_transaction` WHERE `status` = '1'");

		return query.rows;
	}

	async getRevisedTransaction(id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "laybuy_revise_request` WHERE `laybuy_revise_request_id` = '" + id + "'");

		return query.row;
	}

	async getRemainingAmount(amount, downpayment_amount, payment_amounts, transaction = 2) {
		return amount - (downpayment_amount + ((transaction - 2) * payment_amounts));
	}

	async getRevisedTransactions(id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "laybuy_revise_request` WHERE `laybuy_revise_request_id` = '" + id + "'");

		return query.rows;
	}

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

	async getTransaction(id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "laybuy_transaction` WHERE `laybuy_transaction_id` = '" + id + "'");

		return query.row;
	}

	async getTransactions(data = {}) {
		let sql = "SELECT *, CONCAT(firstname, ' ', lastname) AS `customer` FROM `" + DB_PREFIX + "laybuy_transaction` `lt` WHERE 1 = 1";

		let implode = [];

		if ((data['filter_order_id'])) {
			implode.push("`lt`.`order_id` = '" + data['filter_order_id'] + "'");
		}

		if ((data['filter_customer'])) {
			implode.push("CONCAT(firstname, ' ', lastname) LIKE '%" + this.db.escape(data['filter_customer']) + "%'");
		}

		if ((data['filter_dp_percent'])) {
			implode.push("`lt`.`downpayment` = '" + data['filter_dp_percent'] + "'");
		}

		if ((data['filter_months'])) {
			implode.push("`lt`.`months` = '" + data['filter_months'] + "'");
		}

		if ((data['filter_status'])) {
			implode.push("`lt`.`status` = '" + data['filter_status'] + "'");
		}

		if ((data['filter_date_added'])) {
			implode.push("DATE(`lt`.`date_added`) = DATE('" + this.db.escape(data['filter_date_added']) + "')");
		}

		if (implode.length) {
			sql += " AND " + implode.join(" AND ");
		}

		let sort_data = [
			'lt.order_id',
			'customer',
			'lt.amount',
			'lt.downpayment',
			'lt.months',
			'lt.downpayment_amount',
			'lt.first_payment_due',
			'lt.last_payment_due',
			'lt.status',
			'lt.date_added'
		];

		if ((data['sort']) && sort_data.includes(data['sort'])) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY order_id";
		}

		if ((data['order']) && (data['order'] == 'DESC')) {
			sql += " DESC";
		} else {
			sql += " ASC";
		}

		if ((data['sort']) && data['sort'] != 'lt.date_added') {
			sql += ", lt.date_added DESC";
		}

		if ((data['start']) || (data['limit'])) {
			data['start'] = data['start'] || 0;
			if (data['start'] < 0) {
				data['start'] = 0;
			}

			data['limit'] = data['limit'] || 20;
			if (data['limit'] < 1) {
				data['limit'] = 20;
			}

			sql += " LIMIT " + data['start'] + "," + data['limit'];
		}

		const query = await this.db.query(sql);

		return query.rows;
	}

	async getTotalTransactions(data = {}) {
		let sql = "SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "laybuy_transaction` `lt` WHERE 1 = 1";

		let implode = [];

		if ((data['filter_order_id'])) {
			implode.push("`lt`.`order_id` = '" + data['filter_order_id'] + "'");
		}

		if ((data['filter_customer'])) {
			implode.push("CONCAT(firstname, ' ', lastname) LIKE '%" + this.db.escape(data['filter_customer']) + "%'");
		}

		if ((data['filter_dp_percent'])) {
			implode.push("`lt`.`downpayment` = '" + data['filter_dp_percent'] + "'");
		}

		if ((data['filter_months'])) {
			implode.push("`lt`.`months` = '" + data['filter_months'] + "'");
		}

		if ((data['filter_status'])) {
			implode.push("`lt`.`status` = '" + data['filter_status'] + "'");
		}

		if ((data['filter_date_added'])) {
			implode.push("DATE(`lt`.`date_added`) = DATE('" + this.db.escape(data['filter_date_added']) + "')");
		}

		if (implode.length) {
			sql += " AND " + implode.join(" AND ");
		}

		const query = await this.db.query(sql);

		return query.row['total'];
	}

	async getTransactionByLayBuyRefId(laybuy_ref_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "laybuy_transaction` WHERE `laybuy_ref_no` = '" + laybuy_ref_id + "'");

		return query.row;
	}

	async getTransactionByOrderId(order_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "laybuy_transaction` WHERE `order_id` = '" + order_id + "' ORDER BY `laybuy_ref_no` DESC LIMIT 1");

		return query.row;
	}

	async getTransactionStatuses() {
		await this.load.language('extension/payment/laybuy');

		let transaction_statuses = [
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

	async install() {
		await this.db.query(`CREATE TABLE IF NOT EXISTS \`${DB_PREFIX}laybuy_transaction\` (
			\`laybuy_transaction_id\` int(11) NOT NULL AUTO_INCREMENT,
			\`order_id\` int(11) NOT NULL DEFAULT '0',
			\`firstname\` varchar(32) NOT NULL DEFAULT '',
			\`lastname\` varchar(32) NOT NULL DEFAULT '',
			\`address\` text,
			\`suburb\` varchar(128) NOT NULL DEFAULT '',
			\`state\` varchar(128) NOT NULL DEFAULT '',
			\`country\` varchar(32) NOT NULL DEFAULT '',
			\`postcode\` varchar(10) NOT NULL DEFAULT '',
			\`email\` varchar(96) NOT NULL DEFAULT '',
			\`amount\` double NOT NULL,
			\`currency\` varchar(5) NOT NULL,
			\`downpayment\` double NOT NULL,
			\`months\` int(11) NOT NULL,
			\`downpayment_amount\` double NOT NULL,
			\`payment_amounts\` double NOT NULL,
			\`first_payment_due\` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
			\`last_payment_due\` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
			\`store_id\` int(11) NOT NULL DEFAULT '0',
			\`status\` int(11) NOT NULL DEFAULT '1',
			\`report\` text,
			\`transaction\` int(11) NOT NULL DEFAULT '2',
			\`paypal_profile_id\` varchar(250) NOT NULL DEFAULT '',
			\`laybuy_ref_no\` int(11) NOT NULL DEFAULT '0',
			\`date_added\` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
			PRIMARY KEY(\`laybuy_transaction_id\`)
		) ENGINE = MyISAM DEFAULT CHARSET = utf8 COLLATE = utf8_general_ci`);

		await this.db.query(`CREATE TABLE IF NOT EXISTS \`${DB_PREFIX}laybuy_revise_request\` (
			\`laybuy_revise_request_id\` int(11) NOT NULL AUTO_INCREMENT,
			\`laybuy_transaction_id\` int(11) DEFAULT '0',
			\`type\` varchar(250) NOT NULL DEFAULT '',
			\`order_id\` int(11) NOT NULL DEFAULT '0',
			\`firstname\` varchar(32) NOT NULL DEFAULT '',
			\`lastname\` varchar(32) NOT NULL DEFAULT '',
			\`address\` text,
			\`suburb\` varchar(128) NOT NULL DEFAULT '',
			\`state\` varchar(128) NOT NULL DEFAULT '',
			\`country\` varchar(32) NOT NULL DEFAULT '',
			\`postcode\` varchar(10) NOT NULL DEFAULT '',
			\`email\` varchar(96) NOT NULL DEFAULT '',
			\`amount\` double NOT NULL,
			\`currency\` varchar(5) NOT NULL,
			\`downpayment\` double NOT NULL,
			\`months\` int(11) NOT NULL,
			\`downpayment_amount\` double NOT NULL,
			\`payment_amounts\` double NOT NULL,
			\`first_payment_due\` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
			\`last_payment_due\` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
			\`store_id\` int(11) NOT NULL DEFAULT '0',
			\`status\` int(11) NOT NULL DEFAULT '1',
			\`report\` text,
			\`transaction\` int(11) NOT NULL DEFAULT '2',
			\`paypal_profile_id\` varchar(250) NOT NULL DEFAULT '',
			\`laybuy_ref_no\` int(11) NOT NULL DEFAULT '0',
			\`payment_type\` tinyint(1) NOT NULL DEFAULT '1',
			\`date_added\` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
			PRIMARY KEY(\`laybuy_revise_request_id\`)
		) ENGINE = MyISAM DEFAULT CHARSET = utf8 COLLATE = utf8_general_ci`);

		this.load.model('setting/event', this);

		await this.model_setting_event.addEvent('laybuy', 'catalog/model/checkout/order/deleteOrder/after', 'extension/payment/laybuy/deleteOrder');
	}

	async log(data, step = 6) {
		if (this.config.get('payment_laybuy_logging')) {
			const backtrace = getStackTrace();

			const log = new Log('laybuy.log');
			log.write(JSON.stringify(backtrace) + ' - ' + data);
		}
	}

	async uninstall() {
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "laybuy_transaction`");

		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "laybuy_revise_request`");

		this.load.model('setting/event', this);

		await this.model_setting_event.deleteEventByCode('laybuy');
	}

	async updateOrderStatus(order_id, order_status_id, comment) {
		await this.db.query("UPDATE `" + DB_PREFIX + "order` SET `order_status_id` = '" + order_status_id + "', `date_modified` = NOW() WHERE `order_id` = '" + order_id + "'");

		await this.db.query("INSERT INTO `" + DB_PREFIX + "order_history` SET `order_id` = '" + order_id + "', `order_status_id` = '" + order_status_id + "', `notify` = '0', `comment` = '" + this.db.escape(comment) + "', `date_added` = NOW()");
	}

	async updateRevisedTransaction(id, data = {}) {
		await this.db.query("UPDATE `" + DB_PREFIX + "laybuy_revise_request` SET `laybuy_transaction_id` = '" + data['transaction_id'] + "', `type` = '" + this.db.escape(data['type']) + "', `order_id` = '" + data['order_id'] + "', `firstname` = '" + this.db.escape(data['firstname']) + "', `lastname` = '" + this.db.escape(data['lastname']) + "', `address` = '" + this.db.escape(data['address']) + "', `suburb` = '" + this.db.escape(data['suburb']) + "', `state` = '" + this.db.escape(data['state']) + "', `country` = '" + this.db.escape(data['country']) + "', `postcode` = '" + this.db.escape(data['postcode']) + "', `email` = '" + this.db.escape(data['email']) + "', `amount` = '" + data['amount'] + "', `currency` = '" + this.db.escape(data['currency']) + "', `downpayment` = '" + this.db.escape(data['downpayment']) + "', `months` = '" + data['months'] + "', `downpayment_amount` = '" + data['downpayment_amount'] + "', `payment_amounts` = '" + data['payment_amounts'] + "', `first_payment_due` = '" + this.db.escape(data['first_payment_due']) + "', `last_payment_due` = '" + this.db.escape(data['last_payment_due']) + "', `store_id` = '" + data['store_id'] + "', `status` = '" + data['status'] + "', `report` = '" + this.db.escape(data['report']) + "', `transaction` = '" + data['transaction'] + "', `paypal_profile_id` = '" + this.db.escape(data['paypal_profile_id']) + "', `laybuy_ref_no` = '" + data['laybuy_ref_no'] + "', `payment_type` = '" + data['payment_type'] + "', `date_added` = NOW() WHERE `laybuy_revise_request_id` = '" + id + "'");
	}

	async updateTransaction(id, status, report, transaction) {
		await this.db.query("UPDATE `" + DB_PREFIX + "laybuy_transaction` SET `status` = '" + status + "', `report` = '" + this.db.escape(report) + "', `transaction` = '" + transaction + "' WHERE `laybuy_transaction_id` = '" + id + "'");
	}

	async updateTransactionStatus(id, status) {
		await this.db.query("UPDATE `" + DB_PREFIX + "laybuy_transaction` SET `status` = '" + status + "' WHERE `laybuy_transaction_id` = '" + id + "'");
	}
}