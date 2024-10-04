module.exports = class WeightLibrary {
    constructor(registry) {
        this.db = registry.get('db');
        this.config = registry.get('config');
        this.weights = {};

        this.initializeWeights();
    }

    async initializeWeights() {
        const weightClassQuery = await this.db.query(
            `SELECT * FROM ${DB_PREFIX}weight_class wc
        LEFT JOIN ${DB_PREFIX}weight_class_description wcd
        ON wc.weight_class_id = wcd.weight_class_id
        WHERE wcd.language_id = ${parseInt(this.config.get('config_language_id'))}`
        );

        weightClassQuery.rows.forEach(result => {
            this.weights[result.weight_class_id] = {
                weight_class_id: result.weight_class_id,
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

        const fromValue = this.weights[from] ? this.weights[from].value : 1;
        const toValue = this.weights[to] ? this.weights[to].value : 1;

        return value * (toValue / fromValue);
    }

    format(value, weight_class_id, decimal_point = '.', thousand_point = ',') {
        const unit = this.weights[weight_class_id] ? this.weights[weight_class_id].unit : '';
        return `${Number(value).toFixed(2).replace('.', decimal_point).replace(/\B(?=(\d{3})+(?!\d))/g, thousand_point)}${unit}`;
    }

    getUnit(weight_class_id) {
        return this.weights[weight_class_id] ? this.weights[weight_class_id].unit : '';
    }
}

