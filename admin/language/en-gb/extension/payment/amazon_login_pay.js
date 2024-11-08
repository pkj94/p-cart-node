module.exports = {
    //Headings
    heading_title: 'Amazon Pay and Login with Amazon',

    //Text
    text_success: 'Amazon Pay and Login with Amazon module has been updated.',
    text_ipn_url: 'Cron Job\'s URL',
    text_ipn_token: 'Secret Token',
    text_us: 'American English',
    text_de: 'German',
    text_uk: 'English',
    text_fr: 'French',
    text_it: 'Italian',
    text_es: 'Spanish',
    text_us_region: 'United States',
    text_eu_region: 'Euro region',
    text_uk_region: 'United Kingdom',
    text_live: 'Live',
    text_sandbox: 'Sandbox',
    text_auth: 'Authorization',
    text_payment: 'Payment',
    text_account: 'Account',
    text_guest: 'Guest',
    text_no_capture: '--- No Automatic Capture ---',
    text_all_geo_zones: 'All Geo Zones',
    text_button_settings: 'Checkout Button Settings',
    text_colour: 'Colour',
    text_orange: 'Orange',
    text_tan: 'Tan',
    text_white: 'White',
    text_light: 'Light',
    text_dark: 'Dark',
    text_size: 'Size',
    text_medium: 'Medium',
    text_large: 'Large',
    text_x_large: 'Extra large',
    text_background: 'Background',
    text_edit: 'Edit Amazon Pay and Login with Amazon',
    text_amazon_login_pay: 'border: 1px solid #EEEEEE," /></a>',
    text_amazon_join: 'Sign-up to Amazon Pay" > <u>Sign-up to Amazon Pay</u></a> ',
    text_payment_info: 'Payment information',
    text_capture_ok: 'Capture was successful',
    text_capture_ok_order: 'Capture was successful, authorization has been fully captured',
    text_refund_ok: 'Refund was successfully requested',
    text_refund_ok_order: 'Refund was successfully requested, amount fully refunded',
    text_cancel_ok: 'Cancel was successful, order status updated to canceled',
    text_capture_status: 'Payment captured',
    text_cancel_status: 'Payment canceled',
    text_refund_status: 'Payment refunded',
    text_order_ref: 'Order ref',
    text_order_total: 'Total authorized',
    text_total_captured: 'Total captured',
    text_transactions: 'Transactions',
    text_column_authorization_id: 'Amazon Authorization ID',
    text_column_capture_id: 'Amazon Capture ID',
    text_column_refund_id: 'Amazon Refund ID',
    text_column_amount: 'Amount',
    text_column_type: 'Type',
    text_column_status: 'Status',
    text_column_date_added: 'Date added',
    text_confirm_cancel: 'Are you sure you want to cancel the payment?',
    text_confirm_capture: 'Are you sure you want to capture the payment?',
    text_confirm_refund: 'Are you sure you want to refund the payment?',
    text_minimum_total: 'Minimum Order Total',
    text_geo_zone: 'Geo Zone',
    text_buyer_multi_currency: 'Multi-Currency function',
    text_status: 'Status',
    text_declined_codes: 'Test Decline Codes',
    text_sort_order: 'Sort Order',
    text_amazon_invalid: 'InvalidPaymentMethod',
    text_amazon_rejected: 'AmazonRejected',
    text_amazon_timeout: 'TransactionTimedOut',
    text_amazon_no_declined: '--- No Automatic Declined Authorization ---',
    text_amazon_signup: 'Sign-up to Amazon Pay',
    text_credentials: 'Please paste your keys here (in JSON format)',
    text_validate_credentials: 'Validate and Use Credentials',
    text_extension: 'Extensions',
    text_info_ssl: '<strong>Important:</strong> SSL (https://) is a requirement and must be enabled on your website for the Amazon Pay and Login with Amazon buttons to work.',
    text_info_buyer_multi_currencies: '%s">(%s > %s > %s )</b></a>, and then enable the <b>Multi-Currency function</b>',

    // Columns
    column_status: 'Status',

    //entry
    entry_merchant_id: 'Merchant ID',
    entry_access_key: 'Access Key',
    entry_access_secret: 'Secret Key',
    entry_client_id: 'Client ID',
    entry_client_secret: 'Client Secret',
    entry_language: 'Default Language',
    entry_login_pay_test: 'Test mode',
    entry_login_pay_mode: 'Payment mode',
    entry_checkout: 'Checkout mode',
    entry_payment_region: 'Payment Region',
    entry_capture_status: 'Status for automatic capture',
    entry_pending_status: 'Pending Order Status',
    entry_capture_oc_status: 'Capture Order Status',
    entry_ipn_url: 'IPN\'s URL',
    entry_ipn_token: 'Secret Token',
    entry_debug: 'Debug logging',

    // Help
    help_pay_mode: 'Choose Payment if you would like the payment to get captured automatically, or Authorization to capture it manually.',
    help_checkout: 'Should payment button also login customer',
    help_capture_status: 'Choose the order status that will trigger automatic capture of an authorized payment.',
    help_capture_oc_status: 'Choose the order status that the order will get once it is captured in Amazon Seller Central or from the capture function in OpenCart Admin > %s > %s > %s.',
    help_ipn_url: 'Set this of you merhcant URL in Amazon Seller Central',
    help_ipn_token: 'Make this long and hard to guess. The resulting IPN URL must not be longer than 150 characters.',
    help_minimum_total: 'This must be above zero',
    help_debug: 'Enabling debug will write sensitive data to a log file. You should always disable unless instructed otherwise',
    help_declined_codes: 'This is for testing purposes only',
    help_buyer_multi_currency: 'Enable this option if you would like the buyer to shop in any of the Amazon Pay supported currencies available in your on-line store: %s',
    help_buyer_multi_currency_no_available_currency: 'https://pay.amazon.co.uk/help/5BDCWHCUC27485L" > <b>Amazon Pay supported currencies</b></a > available in your on - line store, please add / enable such currencies in order to use this functionality.',

    // Order Info
    tab_order_adjustment: 'Order Adjustment',

    // Errors
    error_permission: 'You do not have permissions to modify this module!',
    error_merchant_id: 'Merchant ID is required',
    error_access_key: 'Access Key is required',
    error_access_secret: 'Secret Key is required',
    error_client_id: 'Client ID is required',
    error_client_secret: 'Client Key is required',
    error_pay_mode: 'Payment is only available for US marketplace',
    error_minimum_total: 'Minimum order total must be above zero',
    error_curreny: 'Your shop must have %s currency installed and enabled',
    error_upload: 'Upload failed',
    error_data_missing: 'Required data is missing',
    error_credentials: 'Please enter the keys in a valid JSON format',
    error_no_supported_currencies: 'There are no supported currencies available in your store, please add/enable Buyer Multi-Currency supported currencies in order to use this feature.',

    // Buttons
    button_capture: 'Capture',
    button_refund: 'Refund',
    button_cancel: 'Cancel',
}