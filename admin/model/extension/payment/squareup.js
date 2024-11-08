module.exports = 
class ModelExtensionPaymentSquareup extends Model {
    const RECURRING_ACTIVE = 1;
    const RECURRING_INACTIVE = 2;
    const RECURRING_CANCELLED = 3;
    const RECURRING_SUSPENDED = 4;
    const RECURRING_EXPIRED = 5;
    const RECURRING_PENDING = 6;
    
    async getTransaction(squareup_transaction_id) {
        return await this.db.query("SELECT * FROM `" + DB_PREFIX + "squareup_transaction` WHERE squareup_transaction_id='" + squareup_transaction_id + "'").row;
    }
    
    async getTransactions(data) {
        sql = "SELECT * FROM `" + DB_PREFIX + "squareup_transaction`";

        if ((data['order_id'])) {
            sql += " WHERE order_id='" + data['order_id'] + "'";
        }

        sql += " ORDER BY created_at DESC";

        if ((data['start']) && (data['limit'])) {
            sql += " LIMIT " + data['start'] + ', ' + data['limit'];
        }

        return await this.db.query(sql).rows;
    }

    async getTotalTransactions(data) {
        sql = "SELECT COUNT(*) of total FROM `" + DB_PREFIX + "squareup_transaction`";
        
        if ((data['order_id'])) {
            sql += " WHERE order_id='" + data['order_id'] + "'";
        }

        return await this.db.query(sql).row['total'];
    }
    
    async updateTransaction(squareup_transaction_id, type, refunds = {}) {
        await this.db.query("UPDATE `" + DB_PREFIX + "squareup_transaction` SET transaction_type='" + this.db.escape(type) + "', is_refunded='" + (refunds) + "', refunds='" + this.db.escape(JSON.stringify(refunds)) + "' WHERE squareup_transaction_id='" + squareup_transaction_id + "'");
    }

    async getOrderStatusId(order_id, transaction_status = null) {
        if (transaction_status) {
            return this.config.get('payment_squareup_status_' + strtolower(transaction_status));
        } else {
            this.load.model('sale/order',this);

            order_info = await this.model_sale_order.getOrder(order_id);

            return order_info['order_status_id'];
        }
    }

    async editOrderRecurringStatus(order_recurring_id, status) {
        await this.db.query("UPDATE `" + DB_PREFIX + "order_recurring` SET `status` = '" + status + "' WHERE `order_recurring_id` = '" + order_recurring_id + "'");
    }

    async createTables() {
        await this.db.query("CREATE TABLE IF NOT EXISTS `" + DB_PREFIX + "squareup_transaction` (
          `squareup_transaction_id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
          `transaction_id` char(40) NOT NULL,
          `merchant_id` char(32) NOT NULL,
          `location_id` varchar(32) NOT NULL,
          `order_id` int(11) NOT NULL,
          `transaction_type` char(20) NOT NULL,
          `transaction_amount` decimal(15,2) NOT NULL,
          `transaction_currency` char(3) NOT NULL,
          `billing_address_city` char(100) NOT NULL,
          `billing_address_company` char(100) NOT NULL,
          `billing_address_country` char(3) NOT NULL,
          `billing_address_postcode` char(10) NOT NULL,
          `billing_address_province` char(20) NOT NULL,
          `billing_address_street_1` char(100) NOT NULL,
          `billing_address_street_2` char(100) NOT NULL,
          `device_browser` char(255) NOT NULL,
          `device_ip` char(15) NOT NULL,
          `created_at` char(29) NOT NULL,
          `is_refunded` tinyint(1) NOT NULL,
          `refunded_at` varchar(29) NOT NULL,
          `tenders` text NOT NULL,
          `refunds` text NOT NULL,
          PRIMARY KEY (`squareup_transaction_id`),
          KEY `order_id` (`order_id`),
          KEY `transaction_id` (`transaction_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8;");

        await this.db.query("CREATE TABLE IF NOT EXISTS `" + DB_PREFIX + "squareup_token` (
         `squareup_token_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
         `customer_id` int(11) NOT NULL,
         `sandbox` tinyint(1) NOT NULL,
         `token` char(40) NOT NULL,
         `date_added` datetime NOT NULL,
         `brand` VARCHAR(32) NOT NULL,
         `ends_in` VARCHAR(4) NOT NULL,
         PRIMARY KEY (`squareup_token_id`),
         KEY `getCards` (`customer_id`, `sandbox`),
         KEY `verifyCardCustomer` (`squareup_token_id`, `customer_id`),
         KEY `cardExists` (`customer_id`, `brand`, `ends_in`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8");

        await this.db.query("CREATE TABLE IF NOT EXISTS `" + DB_PREFIX + "squareup_customer` (
         `customer_id` int(11) NOT NULL,
         `sandbox` tinyint(1) NOT NULL,
         `square_customer_id` varchar(32) NOT NULL,
         PRIMARY KEY (`customer_id`, `sandbox`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8");
    }
    
    async dropTables() {
        await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "squareup_transaction`");
        await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "squareup_token`");
        await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "squareup_customer`");
    }
}