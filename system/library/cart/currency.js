module.exports = class CurrencyLibrary {
    constructor(registry) {
        this.db = registry.get('db');
        this.language = registry.get('language');
        this.currencies = [];
        this.init();

    }
    async init() {
        const query = await this.db.query(`SELECT * FROM ${DB_PREFIX}currency`);

        query.rows.forEach(result => {
            this.currencies[result.code] = {
                currency_id: result.currency_id,
                title: result.title,
                symbol_left: result.symbol_left,
                symbol_right: result.symbol_right,
                decimal_place: result.decimal_place,
                value: result.value
            };
        });
    }
    format(number, currency, value = 0, format = true) {
        if (!this.currencies[currency]) {
            return '';
        }

        const { symbol_left, symbol_right, decimal_place } = this.currencies[currency];

        value = value || this.currencies[currency].value;
        let amount = value ? number * value : number;
        amount = parseFloat(amount.toFixed(decimal_place));

        if (!format) {
            return amount;
        }

        let string = '';

        if (symbol_left) {
            string += symbol_left;
        }

        string += amount.toLocaleString(undefined, { minimumFractionDigits: decimal_place, maximumFractionDigits: decimal_place }).replace('.', this.language.get('decimal_point')).replace(/(\d)(?=(\d{3})+\b)/g, `$1${this.language.get('thousand_point')}`);

        if (symbol_right) {
            string += symbol_right;
        }

        return string;
    }

    convert(value, from, to) {
        const fromValue = this.currencies[from] ? this.currencies[from].value : 1;
        const toValue = this.currencies[to] ? this.currencies[to].value : 1;

        return value * (toValue / fromValue);
    }

    getId(currency) {
        return this.currencies[currency] ? this.currencies[currency].currency_id : 0;
    }

    getSymbolLeft(currency) {
        return this.currencies[currency] ? this.currencies[currency].symbol_left : '';
    }

    getSymbolRight(currency) {
        return this.currencies[currency] ? this.currencies[currency].symbol_right : '';
    }

    getDecimalPlace(currency) {
        return this.currencies[currency] ? this.currencies[currency].decimal_place : 0;
    }

    getValue(currency) {
        return this.currencies[currency] ? this.currencies[currency].value : 0;
    }

    has(currency) {
        return !!this.currencies[currency];
    }
}

