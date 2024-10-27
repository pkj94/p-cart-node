
module.exports = class TaxLibrary {
    constructor(registry) {
        this.db = registry.get('db');
        this.config = registry.get('config');
        this.tax_rates = {};
    }

    async setShippingAddress(country_id, zone_id) {
        const query = `SELECT tr1.tax_class_id, tr2.tax_rate_id, tr2.name, tr2.rate, tr2.type, tr1.priority 
                       FROM ${DB_PREFIX}tax_rule tr1 
                       LEFT JOIN ${DB_PREFIX}tax_rate tr2 ON (tr1.tax_rate_id = tr2.tax_rate_id) 
                       INNER JOIN ${DB_PREFIX}tax_rate_to_customer_group tr2cg ON (tr2.tax_rate_id = tr2cg.tax_rate_id) 
                       LEFT JOIN ${DB_PREFIX}zone_to_geo_zone z2gz ON (tr2.geo_zone_id = z2gz.geo_zone_id) 
                       LEFT JOIN ${DB_PREFIX}geo_zone gz ON (tr2.geo_zone_id = gz.geo_zone_id) 
                       WHERE tr1.based = 'shipping' 
                       AND tr2cg.customer_group_id = ${this.config.get('config_customer_group_id')} 
                       AND z2gz.country_id = ${country_id} 
                       AND (z2gz.zone_id = '0' OR z2gz.zone_id = ${zone_id}) 
                       ORDER BY tr1.priority ASC`;

        const tax = await this.db.query(query);

        for (const result of tax.rows) {
            if (!this.tax_rates[result.tax_class_id]) {
                this.tax_rates[result.tax_class_id] = {};
            }
            this.tax_rates[result.tax_class_id][result.tax_rate_id] = {
                tax_rate_id: result.tax_rate_id,
                name: result.name,
                rate: result.rate,
                type: result.type,
                priority: result.priority
            };
        }
    }

    async setPaymentAddress(country_id, zone_id) {
        const query = `SELECT tr1.tax_class_id, tr2.tax_rate_id, tr2.name, tr2.rate, tr2.type, tr1.priority 
                       FROM ${DB_PREFIX}tax_rule tr1 
                       LEFT JOIN ${DB_PREFIX}tax_rate tr2 ON (tr1.tax_rate_id = tr2.tax_rate_id) 
                       INNER JOIN ${DB_PREFIX}tax_rate_to_customer_group tr2cg ON (tr2.tax_rate_id = tr2cg.tax_rate_id) 
                       LEFT JOIN ${DB_PREFIX}zone_to_geo_zone z2gz ON (tr2.geo_zone_id = z2gz.geo_zone_id) 
                       LEFT JOIN ${DB_PREFIX}geo_zone gz ON (tr2.geo_zone_id = gz.geo_zone_id) 
                       WHERE tr1.based = 'payment' 
                       AND tr2cg.customer_group_id = ${this.config.get('config_customer_group_id')} 
                       AND z2gz.country_id = ${country_id} 
                       AND (z2gz.zone_id = '0' OR z2gz.zone_id = ${zone_id}) 
                       ORDER BY tr1.priority ASC`;

        const tax = await this.db.query(query);

        for (const result of tax.rows) {
            if (!this.tax_rates[result.tax_class_id]) {
                this.tax_rates[result.tax_class_id] = {};
            }
            this.tax_rates[result.tax_class_id][result.tax_rate_id] = {
                tax_rate_id: result.tax_rate_id,
                name: result.name,
                rate: result.rate,
                type: result.type,
                priority: result.priority
            };
        }
    }

    async setStoreAddress(country_id, zone_id) {
        const query = `SELECT tr1.tax_class_id, tr2.tax_rate_id, tr2.name, tr2.rate, tr2.type, tr1.priority 
                       FROM ${DB_PREFIX}tax_rule tr1 
                       LEFT JOIN ${DB_PREFIX}tax_rate tr2 ON (tr1.tax_rate_id = tr2.tax_rate_id) 
                       INNER JOIN ${DB_PREFIX}tax_rate_to_customer_group tr2cg ON (tr2.tax_rate_id = tr2cg.tax_rate_id) 
                       LEFT JOIN ${DB_PREFIX}zone_to_geo_zone z2gz ON (tr2.geo_zone_id = z2gz.geo_zone_id) 
                       LEFT JOIN ${DB_PREFIX}geo_zone gz ON (tr2.geo_zone_id = gz.geo_zone_id) 
                       WHERE tr1.based = 'store' 
                       AND tr2cg.customer_group_id = ${this.config.get('config_customer_group_id')} 
                       AND z2gz.country_id = ${country_id} 
                       AND (z2gz.zone_id = '0' OR z2gz.zone_id = ${zone_id}) 
                       ORDER BY tr1.priority ASC`;

        const tax = await this.db.query(query);

        for (const result of tax.rows) {
            if (!this.tax_rates[result.tax_class_id]) {
                this.tax_rates[result.tax_class_id] = {};
            }
            this.tax_rates[result.tax_class_id][result.tax_rate_id] = {
                tax_rate_id: result.tax_rate_id,
                name: result.name,
                rate: result.rate,
                type: result.type,
                priority: result.priority
            };
        }
    }

    calculate(value, tax_class_id, calculate = true) {
        value = Number(value);
        if (tax_class_id && calculate) {
            let amount = 0;
            const tax_rates = this.getRates(value, tax_class_id);
            for (const tax_rate of tax_rates) {
                if (calculate !== 'P' && calculate !== 'F') {
                    amount = amount + tax_rate.amount;
                } else if (tax_rate.type === calculate) {
                    amount = amount + tax_rate.amount;
                }
            }
            return value + amount;
        } else {
            return value;
        }
    }

    getTax(value, tax_class_id) {
        let amount = 0;
        const tax_rates = this.getRates(value, tax_class_id);
        for (const tax_rate of tax_rates) {
            amount = amount + tax_rate.amount;
        }
        return amount;
    }

    async getRateName(tax_rate_id) {
        const query = `SELECT name FROM ${DB_PREFIX}tax_rate WHERE tax_rate_id = ` + tax_rate_id;
        const tax_rate = await this.db.query(query);
        if (tax_rate.rows.length > 0) {
            return tax_rate.rows[0].name;
        } else {
            return false;
        }
    }

    getRates(value, tax_class_id) {
        const tax_rate_data = {};
        if (this.tax_rates[tax_class_id]) {
            for (const tax_rate of Object.values(this.tax_rates[tax_class_id])) {
                let amount = tax_rate_data[tax_rate.tax_rate_id] ? tax_rate_data[tax_rate.tax_rate_id].amount : 0;

                if (tax_rate.type === 'F') {
                    amount = amount + tax_rate.rate;
                } else if (tax_rate.type === 'P') {
                    amount = amount + (value / 100 * tax_rate.rate);
                }

                tax_rate_data[tax_rate.tax_rate_id] = {
                    tax_rate_id: tax_rate.tax_rate_id,
                    name: tax_rate.name,
                    rate: tax_rate.rate,
                    type: tax_rate.type,
                    amount: amount
                };
            }
        }
        return Object.values(tax_rate_data);
    }

    clear() {
        this.tax_rates = {};
    }
}

