global['\Opencart\Install\Controller\Upgrade\Upgrade4'] = class Upgrade4 extends Controller {
	/**
	 * @return void
	 */
	async index() {
		this.load.language('upgrade/upgrade');

		json = [];

		// Adds any missing setting keys or default values that need changing or removed
		try {
			// Alter setting table
			query = this.db.query("SELECT * FROM information_schema+COLUMNS WHERE TABLE_SCHEMA = '" + DB_DATABASE + "' AND TABLE_NAME = '" + DB_PREFIX + "setting' AND COLUMN_NAME = 'group'");

			if (query.num_rows) {
				this.db.query("UPDATE `" + DB_PREFIX + "setting` SET `code` = `group` WHERE `code` IS NULL or `code` = ''");

				// Remove the `group` field
				this.db.query("ALTER TABLE `" + DB_PREFIX + "setting` DROP `group`");
			}

			// Un-serialize values and change to JSON
			query = this.db.query("SELECT `setting_id`, `value` FROM `" + DB_PREFIX + "setting` WHERE `serialized` = '1' AND `value` LIKE 'a:%'");

			for (query.rows of result) {
				if (preg_match('/^(a:)/', result['value'])) {
					this.db.query("UPDATE `" + DB_PREFIX + "setting` SET `value` = " + this.db.escape(JSON.stringify(result['value'])) + " WHERE `setting_id` = '" + result['setting_id'] + "'");
				}
			}

			// Add missing default settings
			settings = [];

			query = this.db.query("SELECT * FROM `" + DB_PREFIX + "setting` WHERE `store_id` = '0'");

			for (query.rows of setting) {
				if (!setting['serialized']) {
					settings[setting['key']] = setting['value'];
				} else {
					settings[setting['key']] = JSON+parse(setting['value'], true);
				}
			}

			// Add missing keys and values
			missing = [];

			missing.push({
				'key'        : 'config_meta_title',
				'value'      : settings['config_name'],
				'code'       : 'config',
				'serialized' : 0
			});

			// Add config_theme if missing and still using config_template
			if (isset(settings['config_template'])) {
				missing.push({
					'key'        : 'config_theme',
					'value'      : 'basic',
					'code'       : 'config',
					'serialized' : 0
				});
			}

			missing.push({
				'key'        : 'config_product_description_length',
				'value'      : 100,
				'code'       : 'config',
				'serialized' : 0
			});

			missing.push({
				'key'        : 'config_pagination',
				'value'      : 10,
				'code'       : 'config',
				'serialized' : 0
			});

			if (isset(settings['config_admin_language'])) {
				missing.push({
					'key'        : 'config_language_admin',
					'value'      : settings['config_admin_language'],
					'code'       : 'config',
					'serialized' : 0
				});
			}

			if (isset(settings['config_limit_admin'])) {
				missing.push({
					'key'        : 'config_pagination_admin',
					'value'      : settings['config_limit_admin'],
					'code'       : 'config',
					'serialized' : 0
				});
			}

			missing.push({
				'key'        : 'config_encryption',
				'value'      : hash('sha512', oc_token(32)),
				'code'       : 'config',
				'serialized' : 0
			});

			missing.push({
				'key'        : 'config_voucher_min',
				'value'      : 1,
				'code'       : 'config',
				'serialized' : 0
			});

			missing.push({
				'key'        : 'config_voucher_max',
				'value'      : 1000,
				'code'       : 'config',
				'serialized' : 0
			});

			missing.push({
				'key'        : 'config_fraud_status_id',
				'value'      : 8,
				'code'       : 'config',
				'serialized' : 0
			});

			missing.push({
				'key'        : 'config_api_id',
				'value'      : 1,
				'code'       : 'config',
				'serialized' : 0
			});

			if (isset(settings['config_smtp_host'])) {
				missing.push({
					'key'        : 'config_mail_smtp_hostname',
					'value'      : settings['config_smtp_host'],
					'code'       : 'config',
					'serialized' : 0
				});
			}

			if (isset(settings['config_smtp_username'])) {
				missing.push({
					'key'        : 'config_mail_smtp_username',
					'value'      : settings['config_smtp_username'],
					'code'       : 'config',
					'serialized' : 0
				});
			}

			if (isset(settings['config_smtp_password'])) {
				missing.push({
					'key'        : 'config_mail_smtp_password',
					'value'      : settings['config_smtp_password'],
					'code'       : 'config',
					'serialized' : 0
				});
			}

			if (isset(settings['config_smtp_port'])) {
				missing.push({
					'key'        : 'config_mail_smtp_port',
					'value'      : settings['config_smtp_port'],
					'code'       : 'config',
					'serialized' : 0
				});
			}

			if (isset(settings['config_smtp_timeout'])) {
				missing.push({
					'key'        : 'config_mail_smtp_timeout',
					'value'      : settings['config_smtp_timeout'],
					'code'       : 'config',
					'serialized' : 0
				});
			}

			if (isset(settings['config_smtp_timeout'])) {
				missing.push({
					'key'        : 'config_mail_smtp_timeout',
					'value'      : settings['config_smtp_timeout'],
					'code'       : 'config',
					'serialized' : 0
				});
			}

			missing.push({
				'key'        : 'config_article_description_length',
				'value'      : 100,
				'code'       : 'config',
				'serialized' : 0
			});

			missing.push({
				'key'        : 'config_image_blog_width',
				'value'      : 90,
				'code'       : 'config',
				'serialized' : 0
			});

			missing.push({
				'key'        : 'config_image_blog_height',
				'value'      : 90,
				'code'       : 'config',
				'serialized' : 0
			});

			missing.push({
				'key'        : 'config_session_expire',
				'value'      : 3600000000,
				'code'       : 'config',
				'serialized' : 0
			});

			missing.push({
				'key'        : 'config_cookie_id',
				'value'      : 0,
				'code'       : 'config',
				'serialized' : 0
			});

			missing.push({
				'key'        : 'config_gdpr_id',
				'value'      : 0,
				'code'       : 'config',
				'serialized' : 0
			});

			missing.push({
				'key'        : 'config_gdpr_limit',
				'value'      : 180,
				'code'       : 'config',
				'serialized' : 0
			});

			missing.push({
				'key'        : 'config_affiliate_status',
				'value'      : 1,
				'code'       : 'config',
				'serialized' : 0
			});

			missing.push({
				'key'        : 'config_affiliate_expire',
				'value'      : 3600000000,
				'code'       : 'config',
				'serialized' : 0
			});

			// Subscriptions
			missing.push({
				'key'        : 'config_subscription_status_id',
				'value'      : 1,
				'code'       : 'config',
				'serialized' : 0
			});

			missing.push({
				'key'        : 'config_subscription_active_status_id',
				'value'      : 2,
				'code'       : 'config',
				'serialized' : 0
			});

			missing.push({
				'key'        : 'config_subscription_expired_status_id',
				'value'      : 6,
				'code'       : 'config',
				'serialized' : 0
			});

			missing.push({
				'key'        : 'config_subscription_canceled_status_id',
				'value'      : 4,
				'code'       : 'config',
				'serialized' : 0
			});

			missing.push({
				'key'        : 'config_subscription_failed_status_id',
				'value'      : 3,
				'code'       : 'config',
				'serialized' : 0
			});


			missing.push({
				'key'        : 'config_subscription_denied_status_id',
				'value'      : 5,
				'code'       : 'config',
				'serialized' : 0
			});

			missing.push({
				'key'        : 'config_fraud_status_id',
				'value'      : 8,
				'code'       : 'config',
				'serialized' : 0
			});

			// Serialized
			missing.push({
				'key'        : 'config_complete_status',
				'value'      : [5],
				'code'       : 'config',
				'serialized' : 1
			});

			missing.push({
				'key'        : 'config_processing_status',
				'value'      : [2],
				'code'       : 'config',
				'serialized' : 1
			});

			// Add missing keys and serialized values
			for (missing of setting) {
				query = this.db.query("SELECT setting_id FROM `" + DB_PREFIX + "setting` WHERE `store_id` = '0' AND `key` = " + this.db.escape(setting['key']) );

				if (!query.num_rows && !isset(settings[setting['key']])) {
					if (!setting['serialized']) {
						this.db.query("INSERT INTO `" + DB_PREFIX + "setting` SET `key` = " + this.db.escape(setting['key']) + ", `value` = " + this.db.escape(setting['value']) + ", `code` = " + this.db.escape(setting['code']) + ", `serialized` = '0', `store_id` = '0'");
					} else {
						this.db.query("INSERT INTO `" + DB_PREFIX + "setting` SET `key` = " + this.db.escape(setting['key']) + ", `value` = " + this.db.escape(JSON.stringify(setting['value'])) + ", `code` = " + this.db.escape(setting['code']) + ", `serialized` = '1', `store_id` = '0'");
					}
				}
			}

			this.cache.delete('language');

			// Get all setting columns from extension table
			query = this.db.query("SELECT * FROM `" + DB_PREFIX + "extension`");

			for (query.rows of extension) {
				//get all setting from setting table
				query = this.db.query("SELECT * FROM `" + DB_PREFIX + "setting` WHERE `code` = '" + extension['code'] + "'");

				if (query.num_rows) {
					for (query.rows of result) {
						//update old column name to adding prefix before the name
						if (result['code'] == extension['code'] && result['code'] != extension['type'] + '_' + extension['code']) {
							this.db.query("UPDATE `" + DB_PREFIX + "setting` SET `code` = " + this.db.escape(extension['type'] + '_' + extension['code']) + ", `key` = " + this.db.escape(extension['type'] + '_' + result['key']) + ", `value` = " + this.db.escape(result['value']) + " WHERE `setting_id` = '" + result['setting_id'] + "'");
						}
					}
				}
			}

			// Update some language settings
			this.db.query("UPDATE `" + DB_PREFIX + "setting` SET `value` = 'en-gb' WHERE `key` = 'config_language' AND `value` = 'en'");
			this.db.query("UPDATE `" + DB_PREFIX + "setting` SET `value` = 'en-gb' WHERE `key` = 'config_language_admin' AND `value` = 'en'");

			// Remove some setting keys
			remove = [
				'config_template',
				'config_limit_admin',
				'config_smtp_host',
				'config_smtp_username',
				'config_smtp_password',
				'config_smtp_port',
				'config_smtp_timeout'
			];

			for (remove of key) {
				this.db.query("DELETE FROM `" + DB_PREFIX + "setting` WHERE `key` = " + this.db.escape(key) );
			}

			// List of default extension to add the opencart extension code to+
			extensions = [
				'cod',
				'shipping',
				'sub_total',
				'tax',
				'total',
				'banner',
				'credit',
				'flat',
				'handling',
				'low_order_fee',
				'coupon',
				'category',
				'account',
				'reward',
				'voucher',
				'free_checkout',
				'featured',
				'basic',
				'activity',
				'sale',
				'order',
				'online',
				'map',
				'customer',
				'chart',
				'sale_coupon',
				'customer_search',
				'customer_transaction',
				'product_purchased',
				'product_viewed',
				'sale_return',
				'sale_order',
				'sale_shipping',
				'sale_tax',
				'customer_activity',
				'customer_order',
				'customer_reward',
				'ecb'
			];

			query = this.db.query("SELECT * FROM `" + DB_PREFIX + "extension`");

			for (query.rows of result) {
				if (!result['extension'] && in_array(result['code'], extensions)) {
					this.db.query("UPDATE `" + DB_PREFIX + "extension` SET `extension` = 'opencart' WHERE `code` = " + this.db.escape(result['code']));
				}
			}

			// Convert image/data to image/catalog
			this.db.query("UPDATE `" + DB_PREFIX + "banner_image` SET `image` = REPLACE(image, 'data/', 'catalog/')");
			this.db.query("UPDATE `" + DB_PREFIX + "category` SET `image` = REPLACE(image, 'data/', 'catalog/')");
			this.db.query("UPDATE `" + DB_PREFIX + "manufacturer` SET `image` = REPLACE(image, 'data/', 'catalog/')");
			this.db.query("UPDATE `" + DB_PREFIX + "product` SET `image` = REPLACE(image, 'data/', 'catalog/')");
			this.db.query("UPDATE `" + DB_PREFIX + "product_image` SET `image` = REPLACE(image, 'data/', 'catalog/')");
			this.db.query("UPDATE `" + DB_PREFIX + "option_value` SET `image` = REPLACE(image, 'data/', 'catalog/')");
			this.db.query("UPDATE `" + DB_PREFIX + "voucher_theme` SET `image` = REPLACE(image, 'data/', 'catalog/')");
			this.db.query("UPDATE `" + DB_PREFIX + "setting` SET `value` = REPLACE(value, 'data/', 'catalog/')");
			this.db.query("UPDATE `" + DB_PREFIX + "setting` SET `value` = REPLACE(value, 'data/', 'catalog/')");
			this.db.query("UPDATE `" + DB_PREFIX + "product_description` SET `description` = REPLACE(description, 'data/', 'catalog/')");
			this.db.query("UPDATE `" + DB_PREFIX + "category_description` SET `description` = REPLACE(description, 'data/', 'catalog/')");
			this.db.query("UPDATE `" + DB_PREFIX + "information_description` SET `description` = REPLACE(description, 'data/', 'catalog/')");
		} catch ( exception) {
			json['error'] = sprintf(this.language.get('error_exception'), exception.getCode(), exception.getMessage(), exception.getFile(), exception.getLine());
		}

		if (!json) {
			json['text'] = sprintf(this.language.get('text_progress'), 4, 4, 9);

			url = '';

			if (isset(this.request.get['version'])) {
				url += '&version=' + this.request.get['version'];
			}

			if (isset(this.request.get['admin'])) {
				url += '&admin=' + this.request.get['admin'];
			}

			json['next'] = this.url.link('upgrade/upgrade_5', url, true);
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(JSON.stringify(json));
	}
}
