module.exports = class ModelCatalogReview extends Model {
	async addReview(product_id, data) {
		await this.db.query("INSERT INTO " + DB_PREFIX + "review SET author = '" + this.db.escape(data['name']) + "', customer_id = '" + await this.customer.getId() + "', product_id = '" + product_id + "', text = '" + this.db.escape(data['text']) + "', rating = '" + data['rating'] + "', date_added = NOW()");

		const review_id = this.db.getLastId();

		if (this.config.get('config_mail_alert').includes('review')) {
			await this.load.language('mail/review');
			this.load.model('catalog/product', this);

			const product_info = await this.model_catalog_product.getProduct(product_id);

			const subject = sprintf(this.language.get('text_subject'), html_entity_decode(this.config.get('config_name')));

			let message = this.language.get('text_waiting') + "\n";
			message += sprintf(this.language.get('text_product'), html_entity_decode(product_info['name'])) + "\n";
			message += sprintf(this.language.get('text_reviewer'), html_entity_decode(data['name'])) + "\n";
			message += sprintf(this.language.get('text_rating'), data['rating']) + "\n";
			message += this.language.get('text_review') + "\n";
			message += html_entity_decode(data['text']) + "\n\n";

			const mail = new Mail(this.config.get('config_mail_engine'));
			mail.parameter = this.config.get('config_mail_parameter');
			mail.smtp_hostname = this.config.get('config_mail_smtp_hostname');
			mail.smtp_username = this.config.get('config_mail_smtp_username');
			mail.smtp_password = html_entity_decode(this.config.get('config_mail_smtp_password'));
			mail.smtp_port = this.config.get('config_mail_smtp_port');
			mail.smtp_timeout = this.config.get('config_mail_smtp_timeout');

			mail.setTo(this.config.get('config_email'));
			mail.setFrom(this.config.get('config_email'));
			mail.setSender(html_entity_decode(this.config.get('config_name')));
			mail.setSubject(subject);
			mail.setText(message);
			await mail.send();

			// Send to additional alert emails
			let emails = this.config.get('config_mail_alert_email').split(',');

			for (let email of emails) {
				if (email && isEmailValid(email)) {
					mail.setTo(email);
					await mail.send();
				}
			}
		}
	}

	async getReviewsByProductId(product_id, start = 0, limit = 20) {
		if (start < 0) {
			start = 0;
		}

		if (limit < 1) {
			limit = 20;
		}

		const query = await this.db.query("SELECT r.review_id, r.author, r.rating, r.text, p.product_id, pd.name, p.price, p.image, r.date_added FROM " + DB_PREFIX + "review r LEFT JOIN " + DB_PREFIX + "product p ON (r.product_id = p.product_id) LEFT JOIN " + DB_PREFIX + "product_description pd ON (p.product_id = pd.product_id) WHERE p.product_id = '" + product_id + "' AND p.date_available <= NOW() AND p.status = '1' AND r.status = '1' AND pd.language_id = '" + this.config.get('config_language_id') + "' ORDER BY r.date_added DESC LIMIT " + start + "," + limit);

		return query.rows;
	}

	async getTotalReviewsByProductId(product_id) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "review r LEFT JOIN " + DB_PREFIX + "product p ON (r.product_id = p.product_id) LEFT JOIN " + DB_PREFIX + "product_description pd ON (p.product_id = pd.product_id) WHERE p.product_id = '" + product_id + "' AND p.date_available <= NOW() AND p.status = '1' AND r.status = '1' AND pd.language_id = '" + this.config.get('config_language_id') + "'");

		return query.row['total'];
	}
}