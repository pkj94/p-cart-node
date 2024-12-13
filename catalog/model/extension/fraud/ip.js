module.exports = class ModelExtensionFraudIp extends Model {
    async check(order_info) {
        this.load.model('account/customer', this);

        let status = false;

        if (order_info['customer_id']) {
            const results = await this.model_account_customer.getIps(order_info['customer_id']);

            for (let result of results) {
                const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "fraud_ip` WHERE ip = '" + this.db.escape(result['ip']) + "'");

                if (query.num_rows) {
                    status = true;

                    break;
                }
            }
        } else {
            const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "fraud_ip` WHERE ip = '" + this.db.escape(order_info['ip']) + "'");

            if (query.num_rows) {
                status = true;
            }
        }

        if (status) {
            return this.config.get('fraud_ip_order_status_id');
        }
    }
}
