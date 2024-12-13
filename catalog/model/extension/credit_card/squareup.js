module.exports = 
class ModelExtensionCreditCardSquareup extends Model {
    async addCustomer(data) {
        await this.db.query("INSERT INTO `" + DB_PREFIX + "squareup_customer` SET customer_id='" + data['customer_id'] + "', sandbox='" + data['sandbox'] + "', square_customer_id='" + this.db.escape(data['square_customer_id']) + "'");
    }

    async getCustomer(customer_id, sandbox) {
        return await this.db.query("SELECT * FROM `" + DB_PREFIX + "squareup_customer` WHERE customer_id = '" + customer_id + "' AND sandbox='" + sandbox + "'").row;
    }

    async addCard(customer_id, sandbox, data) {
        await this.db.query("INSERT INTO `" + DB_PREFIX + "squareup_token` SET customer_id='" + customer_id + "', sandbox='" + sandbox + "', token='" + this.db.escape(data['id']) + "', brand='" + this.db.escape(data['card_brand']) + "', ends_in='" + data['last_4'] + "', date_added=NOW()");
    }

    async getCard(squareup_token_id) {
        return await this.db.query("SELECT * FROM `" + DB_PREFIX + "squareup_token` WHERE squareup_token_id='" + squareup_token_id + "'").row;
    }
    
    async getCards(customer_id, sandbox) {
        return await this.db.query("SELECT * FROM `" + DB_PREFIX + "squareup_token` WHERE customer_id='" + customer_id + "' AND sandbox='" + sandbox + "'").rows;
    }

    async cardExists(customer_id, data) {
        return await this.db.query("SELECT * FROM `" + DB_PREFIX + "squareup_token` WHERE customer_id='" + customer_id + "' AND brand='" + this.db.escape(data['card_brand']) + "' AND ends_in='" + data['last_4'] + "'").num_rows > 0;
    }

    async verifyCardCustomer(squareup_token_id, customer_id) {
        return await this.db.query("SELECT * FROM `" + DB_PREFIX + "squareup_token` WHERE squareup_token_id='" + squareup_token_id + "' AND customer_id='" + customer_id + "'").num_rows > 0;
    }

    async deleteCard(squareup_token_id) {
        await this.db.query("DELETE FROM `" + DB_PREFIX + "squareup_token` WHERE squareup_token_id='" + squareup_token_id + "'");
    }
}