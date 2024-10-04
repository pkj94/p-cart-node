module.exports = class LengthLibrary {
    constructor(registry) {
        this.db = registry.get('db');
        this.config = registry.get('config');
        this.lengths = [];
        this.init();
    }
    async init() {
        const lengthClassQuery = await this.db.query(`SELECT * FROM ${DB_PREFIX}length_class mc LEFT JOIN ${DB_PREFIX}length_class_description mcd ON (mc.length_class_id = mcd.length_class_id) WHERE mcd.language_id = ${this.config.get('config_language_id')}`);

        lengthClassQuery.rows.forEach(result => {
            this.lengths[result.length_class_id] = {
                length_class_id: result.length_class_id,
                title: result.title,
                unit: result.unit,
                value: result.value
            };
        });
    }
    convert(value, from, to) {
        if (from === to) {
            return value;
        }

        const fromValue = this.lengths[from] ? this.lengths[from].value : 1;
        const toValue = this.lengths[to] ? this.lengths[to].value : 1;

        return value * (toValue / fromValue);
    }

    format(value, length_class_id, decimal_point = '.', thousand_point = ',') {
        if (this.lengths[length_class_id]) {
            return `${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace('.', decimal_point).replace(/(\d)(?=(\d{3})+\.)/g, `$1${thousand_point}`)} ${this.lengths[length_class_id].unit}`;
        }
        return `${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace('.', decimal_point).replace(/(\d)(?=(\d{3})+\.)/g, `$1${thousand_point}`)}`;
    }

    getUnit(length_class_id) {
        if (this.lengths[length_class_id]) {
            return this.lengths[length_class_id].unit;
        }
        return '';
    }
}

