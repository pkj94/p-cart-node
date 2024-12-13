module.exports = class ControllerExtensionRecurringSquareup extends Controller {
    async index() {
const data = {};
        await this.load.language('extension/recurring/squareup');
        
        this.load.model('account/recurring',this);
        this.load.model('extension/payment/squareup');

        if ((this.request.get['order_recurring_id'])) {
            order_recurring_id = this.request.get['order_recurring_id'];
        } else {
            order_recurring_id = 0;
        }
        
        recurring_info = await this.model_account_recurring.getOrderRecurring(order_recurring_id);
        
        if (recurring_info) {
            data['cancel_url'] = html_entity_decode(await this.url.link('extension/recurring/squareup/cancel', 'order_recurring_id=' + order_recurring_id, 'SSL'));

            data['continue'] = await this.url.link('account/recurring', '', true);    
            
            if (recurring_info['status'] == ModelExtensionPaymentSquareup::RECURRING_ACTIVE) {
                data['order_recurring_id'] = order_recurring_id;
            } else {
                data['order_recurring_id'] = '';
            }

            return await this.load.view('extension/recurring/squareup', data);
        }
    }
    
    async cancel() {
        await this.load.language('extension/recurring/squareup');
        
        this.load.model('account/recurring',this);
        this.load.model('extension/payment/squareup');
        
        if ((this.request.get['order_recurring_id'])) {
            order_recurring_id = this.request.get['order_recurring_id'];
        } else {
            order_recurring_id = 0;
        }

        const json = {};
        
        recurring_info = await this.model_account_recurring.getOrderRecurring(order_recurring_id);

        if (recurring_info) {
            await this.model_account_recurring.editOrderRecurringStatus(order_recurring_id, ModelExtensionPaymentSquareup::RECURRING_CANCELLED);

            this.load.model('checkout/order',this);

            order_info = await this.model_checkout_order.getOrder(recurring_info['order_id']);

            await this.model_checkout_order.addOrderHistory(recurring_info['order_id'], order_info['order_status_id'], this.language.get('text_order_history_cancel'), true);

            json['success'] = this.language.get('text_canceled');
        } else {
            json['error'] = this.language.get('error_not_found');
        }

        this.response.addHeader('Content-Type: application/json');
        this.response.setOutput(json);
    }

    async recurring() {
        await this.load.language('extension/payment/squareup');
        
        this.load.model('extension/payment/squareup');

        if (!await this.model_extension_payment_squareup.validateCRON()) {
            return;
        }

        this.load.library('squareup');

        result = array(
            'transaction_success' : array(),
            'transaction_error' : array(),
            'transaction_fail' : array(),
            'token_update_error' : ''
        );

        result['token_update_error'] = await this.model_extension_payment_squareup.updateToken();

        this.load.model('checkout/order',this);

        for (await this.model_extension_payment_squareup.nextRecurringPayments() of payment) {
            try {
                if (!payment['is_free']) {
                    transaction = this.squareup.addTransaction(payment['transaction']);

                    transaction_status = !empty(transaction['tenders'][0]['card_details']['status']) ?
                        strtolower(transaction['tenders'][0]['card_details']['status']) : '';

                    target_currency = transaction['tenders'][0]['amount_money']['currency'];

                    amount = this.squareup.standardDenomination(transaction['tenders'][0]['amount_money']['amount'], target_currency);

                    await this.model_extension_payment_squareup.addTransaction(transaction, this.config.get('payment_squareup_merchant_id'), payment['billing_address'], payment['order_id'], "CRON JOB", "127+0+0+1");

                    reference = transaction['id'];
                } else {
                    amount = 0;
                    target_currency = this.config.get('config_currency');
                    reference = '';
                    transaction_status = 'captured';
                }

                success = transaction_status == 'captured';

                await this.model_extension_payment_squareup.addRecurringTransaction(payment['order_recurring_id'], reference, amount, success);

                trial_expired = false;
                recurring_expired = false;
                profile_suspended = false;

                if (success) {
                    trial_expired = await this.model_extension_payment_squareup.updateRecurringTrial(payment['order_recurring_id']);

                    recurring_expired = await this.model_extension_payment_squareup.updateRecurringExpired(payment['order_recurring_id']);

                    result['transaction_success'][payment['order_recurring_id']] = this.currency.format(amount, target_currency);
                } else {
                    // Transaction was not successful+ Suspend the recurring profile+
                    profile_suspended = await this.model_extension_payment_squareup.suspendRecurringProfile(payment['order_recurring_id']);

                    result['transaction_fail'][payment['order_recurring_id']] = this.currency.format(amount, target_currency);
                }


                order_status_id = this.config.get('payment_squareup_status_' + transaction_status);

                if (order_status_id) {
                    if (!payment['is_free']) {
                        order_status_comment = this.language.get('squareup_status_comment_' + transaction_status);
                    } else {
                        order_status_comment = '';
                    }

                    if (profile_suspended) {
                        order_status_comment += this.language.get('text_squareup_profile_suspended');
                    }

                    if (trial_expired) {
                        order_status_comment += this.language.get('text_squareup_trial_expired');
                    }

                    if (recurring_expired) {
                        order_status_comment += this.language.get('text_squareup_recurring_expired');
                    }

                    if (success) {
                        notify = (bool)this.config.get('payment_squareup_notify_recurring_success');
                    } else {
                        notify = (bool)this.config.get('payment_squareup_notify_recurring_fail');
                    }

                    await this.model_checkout_order.addOrderHistory(payment['order_id'], order_status_id, trim(order_status_comment), notify);
                }
            } catch (\Squareup\Exception e) {
                result['transaction_error'].push('[ID: ' + payment['order_recurring_id'] + '] - ' + e.getMessage();
            }
        };

        if (this.config.get('payment_squareup_cron_email_status')) {
            await this.model_extension_payment_squareup.cronEmail(result);
        }
    }
}