module.exports = class ModelExtensionTotalVoucher extends Model {
	async addVoucher(order_id, data) {
		await this.db.query("INSERT INTO " + DB_PREFIX + "voucher SET order_id = '" + order_id + "', code = '" + this.db.escape(data['code']) + "', from_name = '" + this.db.escape(data['from_name']) + "', from_email = '" + this.db.escape(data['from_email']) + "', to_name = '" + this.db.escape(data['to_name']) + "', to_email = '" + this.db.escape(data['to_email']) + "', voucher_theme_id = '" + data['voucher_theme_id'] + "', message = '" + this.db.escape(data['message']) + "', amount = '" + data['amount'] + "', status = '1', date_added = NOW()");

		return this.db.getLastId();
	}

	async disableVoucher(order_id) {
		await this.db.query("UPDATE " + DB_PREFIX + "voucher SET status = '0' WHERE order_id = '" + order_id + "'");
	}

	async getVoucher(code) {
		let status = true;

		const voucher_query = await this.db.query("SELECT *, vtd.name AS theme FROM " + DB_PREFIX + "voucher v LEFT JOIN " + DB_PREFIX + "voucher_theme vt ON (v.voucher_theme_id = vt.voucher_theme_id) LEFT JOIN " + DB_PREFIX + "voucher_theme_description vtd ON (vt.voucher_theme_id = vtd.voucher_theme_id) WHERE v.code = '" + this.db.escape(code) + "' AND vtd.language_id = '" + this.config.get('config_language_id') + "' AND v.status = '1'");

		if (voucher_query.num_rows) {
			if (voucher_query.row['order_id']) {
				const implode = [];

				for (let order_status_id of this.config.get('config_complete_status')) {
					implode.push("'" + order_status_id + "'");
				}

				const order_query = await this.db.query("SELECT order_id FROM `" + DB_PREFIX + "order` WHERE order_id = '" + voucher_query.row['order_id'] + "' AND order_status_id IN(" + implode.join(",") + ")");

				if (!order_query.num_rows) {
					status = false;
				}

				const order_voucher_query = await this.db.query("SELECT order_voucher_id FROM `" + DB_PREFIX + "order_voucher` WHERE order_id = '" + voucher_query.row['order_id'] + "' AND voucher_id = '" + voucher_query.row['voucher_id'] + "'");

				if (!order_voucher_query.num_rows) {
					status = false;
				}
			}

			const voucher_history_query = await this.db.query("SELECT SUM(amount) AS total FROM `" + DB_PREFIX + "voucher_history` vh WHERE vh.voucher_id = '" + voucher_query.row['voucher_id'] + "' GROUP BY vh.voucher_id");
			let amount = voucher_query.row['amount'];
			if (voucher_history_query.num_rows) {
				amount = voucher_query.row['amount'] + voucher_history_query.row['total'];
			}

			if (amount <= 0) {
				status = false;
			}
		} else {
			status = false;
		}

		if (status) {
			return {
				'voucher_id': voucher_query.row['voucher_id'],
				'code': voucher_query.row['code'],
				'from_name': voucher_query.row['from_name'],
				'from_email': voucher_query.row['from_email'],
				'to_name': voucher_query.row['to_name'],
				'to_email': voucher_query.row['to_email'],
				'voucher_theme_id': voucher_query.row['voucher_theme_id'],
				'theme': voucher_query.row['theme'],
				'message': voucher_query.row['message'],
				'image': voucher_query.row['image'],
				'amount': amount,
				'status': voucher_query.row['status'],
				'date_added': voucher_query.row['date_added']
			};
		}
	}

	async getTotal(total) {
		if ((this.session.data['voucher'])) {
			await this.load.language('extension/total/voucher', 'voucher');

			const voucher_info = await this.getVoucher(this.session.data['voucher']);

			if (voucher_info) {
				let amount = Math.min(voucher_info['amount'], total['total']);

				if (amount > 0) {
					total['totals'].push({
						'code': 'voucher',
						'title': sprintf(this.language.get('voucher').get('text_voucher'), this.session.data['voucher']),
						'value': -amount,
						'sort_order': this.config.get('total_voucher_sort_order')
					});

					total['total'] -= amount;
				} else {
					delete this.session.data['voucher'];
				}
			} else {
				delete this.session.data['voucher'];
			}
		}
		return total;
	}

	async confirm(order_info, order_total) {
		let code = '';

		let start = order_total['title'].indexOf('(') + 1;
		let end = order_total['title'].indexOf(')');

		if (start && end) {
			code = order_total['title'].substr(start, end - start);
		}

		if (code) {
			const voucher_info = await this.getVoucher(code);

			if (voucher_info) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "voucher_history` SET voucher_id = '" + voucher_info['voucher_id'] + "', order_id = '" + order_info['order_id'] + "', amount = '" + order_total['value'] + "', date_added = NOW()");
			} else {
				return this.config.get('config_fraud_status_id');
			}
		}
	}

	async unconfirm(order_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "voucher_history` WHERE order_id = '" + order_id + "'");
	}
}
