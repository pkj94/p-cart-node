module.exports = {
    // Text
    text_title: 'Credit or Debit Card',
    text_credit_card: 'Credit Card Details',
    text_wait: 'Please wait!',
    text_store_card: 'Store card details?',

    // Entry
    entry_cc_number: 'Card number',
    entry_cc_name: 'Cardholder name',
    entry_cc_expire_date: 'Card expiry date',
    entry_cc_cvv2: 'Card security code (CVV2)',

    // Help
    help_start_date: '(if available)',
    help_issue: '(for Maestro and Solo cards only)',

    // Text
    text_result: 'Result: ',
    text_approval_code: 'Approval code: ',
    text_reference_number: 'Reference: ',
    text_card_number_ref: 'Card last 4 digits: xxxx ',
    text_card_brand: 'Card brand: ',
    text_response_code: 'Response code: ',
    text_fault: 'Fault message: ',
    text_error: 'Error message: ',
    text_avs: 'Address verification: ',
    text_address_ppx: 'No address data provided or Address not checked by the Card Issuer',
    text_address_yyy: 'Card Issuer confirmed that street and postcode match with their records',
    text_address_yna: 'Card Issuer confirmed that street matches with their records but postcode does not match',
    text_address_nyz: 'Card Issuer confirmed that postcode matches with their records but street does not match',
    text_address_nnn: 'Both street and postcode do not match with the Card Issuer records',
    text_address_ypx: 'Card Issuer confirmed that street matches with their records. The Issuer did not check the postcode',
    text_address_pyx: 'Card Issuer confirmed that postcode matches with their records. The Issuer did not check the street',
    text_address_xxu: 'Card Issuer did not check the AVS information',
    text_card_code_verify: 'Security code: ',
    text_card_code_m: 'Card security code match',
    text_card_code_n: 'Card security code does not match',
    text_card_code_p: 'Not processed',
    text_card_code_s: 'Merchant has indicated that the card security code is not present on the card',
    text_card_code_u: 'Issuer is not certified and/or has not provided encryption keys',
    text_card_code_x: 'No response from the credit card association was received',
    text_card_code_blank: 'A blank response should indicate that no code was sent and that there was no indication that the code was not present on the card.',
    text_card_accepted: 'Accepted cards: ',
    text_card_type_m: 'Mastercard',
    text_card_type_v: 'Visa (Credit/Debit/Electron/Delta)',
    text_card_type_c: 'Diners',
    text_card_type_a: 'American Express',
    text_card_type_ma: 'Maestro',
    text_card_new: 'New card',
    text_response_proc_code: 'Processor code: ',
    text_response_ref: 'Ref number: ',

    // Error
    error_card_number: 'Please check your card number is valid',
    error_card_name: 'Please check the card holder name is valid',
    error_card_cvv: 'Please check the CVV2 is valid',
    error_failed: 'Unable to process your payment, please contact the merchant',
}