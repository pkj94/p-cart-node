
const ERR_CODE_ACCESS_TOKEN_REVOKED = 'ACCESS_TOKEN_REVOKED';
const ERR_CODE_ACCESS_TOKEN_EXPIRED = 'ACCESS_TOKEN_EXPIRED';
module.exports = class Exception {


    config;
    log;
    language;
    errors;
    isCurlError;

    overrideFields = [
        'billing_address.country',
        'shipping_address.country',
        'email_address',
        'phone_number'
    ];

    constructor(registry, errors, is_curl_error = false) {
        this.errors = errors;
        this.isCurlError = is_curl_error;
        this.config = registry.get('config');
        this.log = registry.get('log');
        this.language = registry.get('language');

        let message = this.concatErrors();

        if (this.config.get('config_error_log')) {
            this.log.write(message);
        }

    }

    isCurlError() {
        return this.isCurlError;
    }

    isAccessTokenRevoked() {
        return this.errorCodeExists(ERR_CODE_ACCESS_TOKEN_REVOKED);
    }

    isAccessTokenExpired() {
        return this.errorCodeExists(ERR_CODE_ACCESS_TOKEN_EXPIRED);
    }

    errorCodeExists(code) {
        if (Array.isArray(this.errors)) {
            for (let error of this.errors) {
                if (error['code'] == code) {
                    return true;
                }
            }
        }

        return false;
    }

    overrideError(field) {
        return this.language.get('squareup_override_error_' + field);
    }

    parseError(error) {
        if (error['field'] && in_array(error['field'], this.overrideFields)) {
            return this.overrideError(error['field']);
        }

        let message = error['detail'];

        if (error['field']) {
            message += sprintf(this.language.get('squareup_error_field'), error['field']);
        }

        return message;
    }

    concatErrors() {
        let messages = [];

        if (Array.isArray(this.errors)) {
            for (let error of this.errors) {
                messages.push(this.parseError(error));
            }
        } else {
            messages.push(this.errors);
        }

        return messages.join(' ');
    }
}