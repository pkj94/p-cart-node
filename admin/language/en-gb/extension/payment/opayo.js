module.exports = {
    // Heading
    heading_title: 'Opayo',

    // Text
    text_opayo: '<img src="view/image/payment/opayo.png" alt="Opayo" title="Opayo" />',
    text_extensions: 'Extensions',
    text_edit: 'Edit Opayo',
    text_tab_general: 'General',
    text_tab_cron: 'Cron',
    text_test: 'Test',
    text_live: 'Live',
    text_defered: 'Defered',
    text_authenticate: 'Authenticate',
    text_payment: 'Payment',
    text_payment_info: 'Payment information',
    text_release_status: 'Payment released',
    text_void_status: 'Payment voided',
    text_rebate_status: 'Payment rebated',
    text_order_ref: 'Order ref',
    text_order_total: 'Total authorised',
    text_total_released: 'Total released',
    text_transactions: 'Transactions',
    text_column_amount: 'Amount',
    text_column_type: 'Type',
    text_column_date_added: 'Created',
    text_confirm_void: 'Are you sure you want to void the payment?',
    text_confirm_release: 'Are you sure you want to release the payment?',
    text_confirm_rebate: 'Are you sure you want to rebate the payment?',

    // Entry
    entry_vendor: 'Vendor',
    entry_environment: 'Environment',
    entry_transaction_method: 'Transaction Method',
    entry_total: 'Total',
    entry_order_status: 'Order Status',
    entry_geo_zone: 'Geo Zone',
    entry_status: 'Status',
    entry_sort_order: 'Sort Order',
    entry_debug: 'Debug logging',
    entry_card_save: 'Store Cards',
    entry_cron_token: 'Secret Token',
    entry_cron_url: 'URL',
    entry_cron_last_run: 'Last run time:',

    // Help
    help_total: 'The checkout total the order must reach before this payment method becomes active.',
    help_debug: 'Enabling debug will write sensitive data to a log file. You should always disable unless instructed otherwise.',
    help_transaction_method: 'Transaction method MUST be set to Payment to allow subscription payments.',
    help_card_save: 'In order for buyer can save card details for subsequent payments, MID TOKEN must be subscribed. You will need to contact Opayo customer support to discuss enabling the token system for your account.',
    help_cron_token: 'Make this long and hard to guess.',
    help_cron_url: 'Set a cron to call this URL.',

    // Button
    button_release: 'Release',
    button_rebate: 'Rebate / refund',
    button_void: 'Void',
    button_enable_recurring: 'Enable Recurring',
    button_disable_recurring: 'Disable Recurring',

    // Success
    success_save: 'Success: You have modified Opayo!',
    success_release_ok: 'Success: Release was successful!',
    success_release_ok_order: 'Success: Release was successful, order status updated to success - settled!',
    success_rebate_ok: 'Success: Rebate was successful!',
    success_rebate_ok_order: 'Success: Rebate was successful, order status updated to rebated!',
    success_void_ok: 'Success: Void was successful, order status updated to voided!',
    success_enable_recurring: 'Success: Recurring payment was enabled!',
    success_disable_recurring: 'Success: Recurring payment was disabled!',

    // Error
    error_warning: 'Warning: Please check the form carefully for errors!',
    error_permission: 'Warning: You do not have permission to modify payment Opayo!',
    error_vendor: 'Vendor ID Required!',
}