const uniqid = require("locutus/php/misc/uniqid");
const strip_tags = require("locutus/php/strings/strip_tags");

module.exports =
    class ModelExtensionPaymentSquareup extends Model {
        RECURRING_ACTIVE = 1;
        RECURRING_INACTIVE = 2;
        RECURRING_CANCELLED = 3;
        RECURRING_SUSPENDED = 4;
        RECURRING_EXPIRED = 5;
        RECURRING_PENDING = 6;

        TRANSACTION_DATE_ADDED = 0;
        TRANSACTION_PAYMENT = 1;
        TRANSACTION_OUTSTANDING_PAYMENT = 2;
        TRANSACTION_SKIPPED = 3;
        TRANSACTION_FAILED = 4;
        TRANSACTION_CANCELLED = 5;
        TRANSACTION_SUSPENDED = 6;
        TRANSACTION_SUSPENDED_FAILED = 7;
        TRANSACTION_OUTSTANDING_FAILED = 8;
        TRANSACTION_EXPIRED = 9;

        async getMethod(address, total) {
            const geo_zone_query = await this.db.query("SELECT * FROM " + DB_PREFIX + "zone_to_geo_zone WHERE geo_zone_id = '" + this.config.get('payment_squareup_geo_zone_id') + "' AND country_id = '" + address['country_id'] + "' AND (zone_id = '" + address['zone_id'] + "' OR zone_id = '0')");

            const squareup_display_name = this.config.get('payment_squareup_display_name');

            await this.load.language('extension/payment/squareup');
            let title = this.language.get('text_default_squareup_name');
            if ((squareup_display_name[this.config.get('config_language_id')])) {
                title = squareup_display_name[this.config.get('config_language_id')];
            }

            let status = true;

            const minimum_total = Number(this.config.get('payment_squareup_total'));

            const squareup_geo_zone_id = this.config.get('payment_squareup_geo_zone_id');

            if (minimum_total > 0 && minimum_total > total) {
                status = false;
            } else if (empty(squareup_geo_zone_id)) {
                status = true;
            } else if (geo_zone_query.num_rows == 0) {
                status = false;
            }

            let method_data = null;

            if (status) {
                method_data = {
                    'code': 'squareup',
                    'title': title,
                    'terms': '',
                    'sort_order': this.config.get('payment_squareup_sort_order')
                };
            }

            return method_data;
        }

        async addTransaction(transaction, merchant_id, address, order_id, user_agent, ip) {
            let amount = await this.squareup.standardDenomination(transaction['tenders'][0]['amount_money']['amount'], transaction['tenders'][0]['amount_money']['currency']);

            await this.db.query("INSERT INTO `" + DB_PREFIX + "squareup_transaction` SET transaction_id='" + this.db.escape(transaction['id']) + "', merchant_id='" + this.db.escape(merchant_id) + "', location_id='" + this.db.escape(transaction['location_id']) + "', order_id='" + order_id + "', transaction_type='" + this.db.escape(transaction['tenders'][0]['card_details']['status']) + "', transaction_amount='" + amount + "', transaction_currency='" + this.db.escape(transaction['tenders'][0]['amount_money']['currency']) + "', billing_address_city='" + this.db.escape(address['locality']) + "', billing_address_country='" + this.db.escape(address['country']) + "', billing_address_postcode='" + this.db.escape(address['postal_code']) + "', billing_address_province='" + this.db.escape(address['sublocality']) + "', billing_address_street_1='" + this.db.escape(address['address_line_1']) + "', billing_address_street_2='" + this.db.escape(address['address_line_2']) + "', device_browser='" + this.db.escape(user_agent) + "', device_ip='" + this.db.escape(ip) + "', created_at='" + this.db.escape(transaction['created_at']) + "', is_refunded='" + ((transaction['refunds'])) + "', refunded_at='" + this.db.escape((transaction['refunds']) ? transaction['refunds'][0]['created_at'] : '') + "', tenders='" + this.db.escape(JSON.stringify(transaction['tenders'])) + "', refunds='" + this.db.escape(JSON.stringify((transaction['refunds']) ? transaction['refunds'] : array())) + "'");
        }

        async tokenExpiredEmail() {
            if (!this.mailResendPeriodExpired('token_expired')) {
                return;
            }

            const mail = new Mail();

            mail.protocol = this.config.get('config_mail_protocol');
            mail.parameter = this.config.get('config_mail_parameter');

            mail.smtp_hostname = this.config.get('config_mail_smtp_hostname');
            mail.smtp_username = this.config.get('config_mail_smtp_username');
            mail.smtp_password = html_entity_decode(this.config.get('config_mail_smtp_password'));
            mail.smtp_port = this.config.get('config_mail_smtp_port');
            mail.smtp_timeout = this.config.get('config_mail_smtp_timeout');

            const subject = this.language.get('text_token_expired_subject');
            const message = this.language.get('text_token_expired_message');

            mail.setTo(this.config.get('config_email'));
            mail.setFrom(this.config.get('config_email'));
            mail.setSender(this.config.get('config_name'));
            mail.setSubject(html_entity_decode(subject));
            mail.setText(strip_tags(message));
            mail.setHtml(message);

            await mail.send();
        }

        async tokenRevokedEmail() {
            if (!this.mailResendPeriodExpired('token_revoked')) {
                return;
            }

            const mail = new Mail();

            mail.protocol = this.config.get('config_mail_protocol');
            mail.parameter = this.config.get('config_mail_parameter');

            mail.smtp_hostname = this.config.get('config_mail_smtp_hostname');
            mail.smtp_username = this.config.get('config_mail_smtp_username');
            mail.smtp_password = html_entity_decode(this.config.get('config_mail_smtp_password'));
            mail.smtp_port = this.config.get('config_mail_smtp_port');
            mail.smtp_timeout = this.config.get('config_mail_smtp_timeout');

            const subject = this.language.get('text_token_revoked_subject');
            const message = this.language.get('text_token_revoked_message');

            mail.setTo(this.config.get('config_email'));
            mail.setFrom(this.config.get('config_email'));
            mail.setSender(this.config.get('config_name'));
            mail.setSubject(html_entity_decode(subject));
            mail.setText(strip_tags(message));
            mail.setHtml(message);

            await mail.send();
        }

        async cronEmail(result) {
            const mail = new Mail();

            mail.protocol = this.config.get('config_mail_protocol');
            mail.parameter = this.config.get('config_mail_parameter');

            mail.smtp_hostname = this.config.get('config_mail_smtp_hostname');
            mail.smtp_username = this.config.get('config_mail_smtp_username');
            mail.smtp_password = html_entity_decode(this.config.get('config_mail_smtp_password'));
            mail.smtp_port = this.config.get('config_mail_smtp_port');
            mail.smtp_timeout = this.config.get('config_mail_smtp_timeout');

            const br = '<br />';

            const subject = this.language.get('text_cron_subject');

            let message = this.language.get('text_cron_message') + br + br;

            message += '<strong>' + this.language.get('text_cron_summary_token_heading') + '</strong>' + br;

            if (result['token_update_error']) {
                message += result['token_update_error'] + br + br;
            } else {
                message += this.language.get('text_cron_summary_token_updated') + br + br;
            }

            if ((result['transaction_error'])) {
                message += '<strong>' + this.language.get('text_cron_summary_error_heading') + '</strong>' + br;

                message += implode(br, result['transaction_error']) + br + br;
            }

            if ((result['transaction_fail'])) {
                message += '<strong>' + this.language.get('text_cron_summary_fail_heading') + '</strong>' + br;

                for (let [order_recurring_id, amount] of Object.entries(result['transaction_fail'])) {
                    message += sprintf(this.language.get('text_cron_fail_charge'), order_recurring_id, amount) + br;
                }
            }

            if ((result['transaction_success'])) {
                message += '<strong>' + this.language.get('text_cron_summary_success_heading') + '</strong>' + br;

                for (let [order_recurring_id, amount] of Object.entries(result['transaction_success'])) {
                    message += sprintf(this.language.get('text_cron_success_charge'), order_recurring_id, amount) + br;
                }
            }

            mail.setTo(this.config.get('payment_squareup_cron_email'));
            mail.setFrom(this.config.get('config_email'));
            mail.setSender(this.config.get('config_name'));
            mail.setSubject(html_entity_decode(subject));
            mail.setText(strip_tags(message));
            mail.setHtml(message);
            await mail.send();
        }

        async recurringPayments() {
            return this.config.get('payment_squareup_recurring_status');
        }

        async createRecurring(recurring, order_id, description, reference) {
            await this.db.query("INSERT INTO `" + DB_PREFIX + "order_recurring` SET `order_id` = '" + order_id + "', `date_added` = NOW(), `status` = '" + this.RECURRING_ACTIVE + "', `product_id` = '" + recurring['product_id'] + "', `product_name` = '" + this.db.escape(recurring['name']) + "', `product_quantity` = '" + this.db.escape(recurring['quantity']) + "', `recurring_id` = '" + recurring['recurring']['recurring_id'] + "', `recurring_name` = '" + this.db.escape(recurring['recurring']['name']) + "', `recurring_description` = '" + this.db.escape(description) + "', `recurring_frequency` = '" + this.db.escape(recurring['recurring']['frequency']) + "', `recurring_cycle` = '" + recurring['recurring']['cycle'] + "', `recurring_duration` = '" + recurring['recurring']['duration'] + "', `recurring_price` = '" + recurring['recurring']['price'] + "', `trial` = '" + recurring['recurring']['trial'] + "', `trial_frequency` = '" + this.db.escape(recurring['recurring']['trial_frequency']) + "', `trial_cycle` = '" + recurring['recurring']['trial_cycle'] + "', `trial_duration` = '" + recurring['recurring']['trial_duration'] + "', `trial_price` = '" + recurring['recurring']['trial_price'] + "', `reference` = '" + this.db.escape(reference) + "'");

            return this.db.getLastId();
        }

        async validateCRON() {
            if (!Number(this.config.get('payment_squareup_status')) || !Number(this.config.get('payment_squareup_recurring_status'))) {
                return false;
            }

            if ((this.request.get['cron_token']) && this.request.get['cron_token'] == this.config.get('payment_squareup_cron_token')) {
                return true;
            }

            if (defined('SQUAREUP_ROUTE')) {
                return true;
            }

            return false;
        }

        async updateToken() {
            try {
                let response = await this.squareup.refreshToken();

                if (!(response['access_token']) || !(response['token_type']) || !(response['expires_at']) || !(response['merchant_id']) || response['merchant_id'] != this.config.get('payment_squareup_merchant_id')) {
                    return this.language.get('error_squareup_cron_token');
                } else {
                    await this.editTokenSetting({
                        'payment_squareup_access_token': response['access_token'],
                        'payment_squareup_access_token_expires': response['expires_at']
                    });
                }
            } catch (e) {
                return e.message;
            }

            return '';
        }

        async nextRecurringPayments() {
            const payments = [];

            this.load.library('squareup');

            let recurring_sql = "SELECT * FROM `" + DB_PREFIX + "order_recurring` `or` INNER JOIN `" + DB_PREFIX + "squareup_transaction` st ON (st.transaction_id = `or`.reference) WHERE `or`.status='" + this.RECURRING_ACTIVE + "'";

            this.load.model('checkout/order', this);

            for (let recurring of (await this.db.query(recurring_sql)).rows) {
                if (!await this.paymentIsDue(recurring['order_recurring_id'])) {
                    continue;
                }

                const order_info = await this.model_checkout_order.getOrder(recurring['order_id']);

                const billing_address = {
                    'first_name': order_info['payment_firstname'],
                    'last_name': order_info['payment_lastname'],
                    'address_line_1': recurring['billing_address_street_1'],
                    'address_line_2': recurring['billing_address_street_2'],
                    'locality': recurring['billing_address_city'],
                    'sublocality': recurring['billing_address_province'],
                    'postal_code': recurring['billing_address_postcode'],
                    'country': recurring['billing_address_country'],
                    'organization': recurring['billing_address_company']
                };

                const transaction_tenders = JSON.parse(recurring['tenders']);

                const price = (recurring['trial'] ? recurring['trial_price'] : recurring['recurring_price']);

                const transaction = {
                    'idempotency_key': uniqid(),
                    'amount_money': {
                        'amount': this.squareup.lowestDenomination(price * recurring['product_quantity'], recurring['transaction_currency']),
                        'currency': recurring['transaction_currency']
                    },
                    'billing_address': billing_address,
                    'buyer_email_address': order_info['email'],
                    'delay_capture': false,
                    'customer_id': transaction_tenders[0]['customer_id'],
                    'customer_card_id': transaction_tenders[0]['card_details']['card']['id'],
                    'integration_id': this.squareup.SQUARE_INTEGRATION_ID
                };

                payments.push({
                    'is_free': price == 0,
                    'order_id': recurring['order_id'],
                    'order_recurring_id': recurring['order_recurring_id'],
                    'billing_address': billing_address,
                    'transaction': transaction
                });
            }

            return payments;
        }

        async addRecurringTransaction(order_recurring_id, reference, amount, status) {
            let type = this.TRANSACTION_FAILED;
            if (status) {
                type = this.TRANSACTION_PAYMENT;
            }

            await this.db.query("INSERT INTO `" + DB_PREFIX + "order_recurring_transaction` SET order_recurring_id='" + order_recurring_id + "', reference='" + this.db.escape(reference) + "', type='" + type + "', amount='" + amount + "', date_added=NOW()");
        }

        async updateRecurringExpired(order_recurring_id) {
            const recurring_info = await this.getRecurring(order_recurring_id);
            // If we are not in trial, we need to check if the recurring will end at some point
            let expirable = recurring_info['recurring_duration'];
            if (recurring_info['trial']) {
                // If we are in trial, we need to check if the trial will end at some point
                expirable = recurring_info['trial_duration'];
            }

            // If recurring payment can expire (trial_duration > 0 AND recurring_duration > 0)
            if (expirable) {
                const number_of_successful_payments = await this.getTotalSuccessfulPayments(order_recurring_id);

                const total_duration = recurring_info['trial_duration'] + recurring_info['recurring_duration'];

                // If successful payments exceed total_duration
                if (number_of_successful_payments >= total_duration) {
                    await this.db.query("UPDATE `" + DB_PREFIX + "order_recurring` SET status='" + this.RECURRING_EXPIRED + "' WHERE order_recurring_id='" + order_recurring_id + "'");

                    return true;
                }
            }

            return false;
        }

        async updateRecurringTrial(order_recurring_id) {
            const recurring_info = await this.getRecurring(order_recurring_id);

            // If recurring payment is in trial and can expire (trial_duration > 0)
            if (recurring_info['trial'] && recurring_info['trial_duration']) {
                const number_of_successful_payments = await this.getTotalSuccessfulPayments(order_recurring_id);

                // If successful payments exceed trial_duration
                if (number_of_successful_payments >= recurring_info['trial_duration']) {
                    await this.db.query("UPDATE `" + DB_PREFIX + "order_recurring` SET trial='0' WHERE order_recurring_id='" + order_recurring_id + "'");

                    return true;
                }
            }

            return false;
        }

        async suspendRecurringProfile(order_recurring_id) {
            await this.db.query("UPDATE `" + DB_PREFIX + "order_recurring` SET status='" + this.RECURRING_SUSPENDED + "' WHERE order_recurring_id='" + order_recurring_id + "'");

            return true;
        }

        async getLastSuccessfulRecurringPaymentDate(order_recurring_id) {
            return (await this.db.query("SELECT date_added FROM `" + DB_PREFIX + "order_recurring_transaction` WHERE order_recurring_id='" + order_recurring_id + "' AND type='" + this.TRANSACTION_PAYMENT + "' ORDER BY date_added DESC LIMIT 0,1")).row['date_added'];
        }

        async getRecurring(order_recurring_id) {
            const recurring_sql = "SELECT * FROM `" + DB_PREFIX + "order_recurring` WHERE order_recurring_id='" + order_recurring_id + "'";

            return (await this.db.query(recurring_sql)).row;
        }

        async getTotalSuccessfulPayments(order_recurring_id) {
            return (await this.db.query("SELECT COUNT(*) as total FROM `" + DB_PREFIX + "order_recurring_transaction` WHERE order_recurring_id='" + order_recurring_id + "' AND type='" + this.TRANSACTION_PAYMENT + "'")).row['total'];
        }

        async paymentIsDue(order_recurring_id) {
            // We know the recurring profile is active.
            const recurring_info = await this.getRecurring(order_recurring_id);
            let frequency = '', cycle = '';
            if (recurring_info['trial']) {
                frequency = recurring_info['trial_frequency'];
                cycle = recurring_info['trial_cycle'];
            } else {
                frequency = recurring_info['recurring_frequency'];
                cycle = recurring_info['recurring_cycle'];
            }
            // Find date of last payment
            let previous_time;
            if (!this.getTotalSuccessfulPayments(order_recurring_id)) {
                previous_time = new Date(recurring_info['date_added']).getTime();
            } else {
                previous_time = new Date(await this.getLastSuccessfulRecurringPaymentDate(order_recurring_id)).getTime();
            }
            let time_interval = 0;
            switch (frequency) {
                case 'day': time_interval = 24 * 3600 * 1000; break;
                case 'week': time_interval = 7 * 24 * 3600 * 1000; break;
                case 'semi_month': time_interval = 15 * 24 * 3600 * 1000; break;
                case 'month': time_interval = 30 * 24 * 3600 * 1000; break;
                case 'year': time_interval = 365 * 24 * 3600 * 1000; break;
            }

            const due_date = new Date(previous_time + (time_interval * cycle));

            const this_date = new Date();

            return this_date >= due_date;
        }

        async editTokenSetting(settings) {
            for (let [key, value] of Object.entries(settings)) {
                await this.db.query("DELETE FROM `" + DB_PREFIX + "setting` WHERE `code`='payment_squareup' AND `key`='" + key + "'");

                await this.db.query("INSERT INTO `" + DB_PREFIX + "setting` SET `code`='payment_squareup', `key`='" + key + "', `value`='" + this.db.escape(value) + "', serialized=0, store_id=0");
            }
        }

        async mailResendPeriodExpired(key) {
            let result = await this.cache.get('squareup.' + key);

            if (!result) {
                // No result, therefore this is the first e-mail and the re-send period should be regarded as expired.
                await this.cache.set('squareup.' + key, new Date().getTime());
            } else {
                // There is an entry in the cache. We will calculate the time difference (delta)
                let delta = new Date().getTime() - Number(result);

                if (delta >= 15 * 60 * 1000) {
                    // More than 15 minutes have passed, therefore the re-send period has expired.
                    await this.cache.set('squareup.' + key, new Date().getTime());
                } else {
                    // Less than 15 minutes have passed before the last e-mail, therefore the re-send period has not expired.
                    return false;
                }
            }

            // In all other cases, the re-send period has expired.
            return true;
        }
    }
