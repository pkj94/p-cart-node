<?php
namespace Opencart\Admin\Model\Catalog;
/**
 * Class Subscription Plan
 *
 * @package Opencart\Admin\Model\Catalog
 */
class SubscriptionPlanModel  extends Model {
	constructor(registry){
		super(registry)
	}
	/**
	 * @param data
	 *
	 * @return int
	 */
	async addSubscriptionPlan(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "subscription_plan` SET `trial_frequency` = '" + this.db.escape(data['trial_frequency']) + "', `trial_duration` = '" + data['trial_duration'] + "', `trial_cycle` = '" + data['trial_cycle'] + "', `trial_status` = '" + data['trial_status'] + "', `frequency` = '" + this.db.escape(data['frequency']) + "', `duration` = '" + data['duration'] + "', `cycle` = '" + data['cycle'] + "', `status` = '" + (data['status'] ? data['status'] : 0) + "', `sort_order` = '" + data['sort_order'] + "'");

		subscription_plan_id = this.db.getLastId();

		for (data['subscription_plan_description'] of language_id : subscription_plan_description) {
			await this.db.query("INSERT INTO `" + DB_PREFIX + "subscription_plan_description` SET `subscription_plan_id` = '" + subscription_plan_id + "', `language_id` = '" + language_id + "', `name` = '" + this.db.escape(subscription_plan_description['name']) + "'");
		}

		return subscription_plan_id;
	}

	/**
	 * @param   subscription_plan_id
	 * @param data
	 *
	 * @return void
	 */
	async editSubscriptionPlan(subscription_plan_id, data) {
		await this.db.query("UPDATE `" + DB_PREFIX + "subscription_plan` SET  `trial_frequency` = '" + this.db.escape(data['trial_frequency']) + "', `trial_duration` = '" + data['trial_duration'] + "', `trial_cycle` = '" + data['trial_cycle'] + "', `trial_status` = '" + data['trial_status'] + "', `frequency` = '" + this.db.escape(data['frequency']) + "', `duration` = '" + data['duration'] + "', `cycle` = '" + data['cycle'] + "', `status` = '" + (data['status'] ? data['status'] : 0) + "', `sort_order` = '" + data['sort_order'] + "' WHERE `subscription_plan_id` = '" + subscription_plan_id + "'");

		await this.db.query("DELETE FROM `" + DB_PREFIX + "subscription_plan_description` WHERE `subscription_plan_id` = '" + subscription_plan_id + "'");

		for (data['subscription_plan_description'] of language_id : subscription_plan_description) {
			await this.db.query("INSERT INTO `" + DB_PREFIX + "subscription_plan_description` SET `subscription_plan_id` = '" + subscription_plan_id + "', `language_id` = '" + language_id + "', `name` = '" + this.db.escape(subscription_plan_description['name']) + "'");
		}
	}

	/**
	 * @param subscription_plan_id
	 *
	 * @return void
	 */
	async copySubscriptionPlan(subscription_plan_id) {
		data = this.getSubscriptionPlan(subscription_plan_id);

		data['subscription_plan_description'] = this.getDescription(subscription_plan_id);

		this.addSubscriptionPlan(data);
	}

	/**
	 * @param subscription_plan_id
	 *
	 * @return void
	 */
	async deleteSubscriptionPlan(subscription_plan_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "subscription_plan` WHERE `subscription_plan_id` = '" + subscription_plan_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "subscription_plan_description` WHERE `subscription_plan_id` = '" + subscription_plan_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "product_subscription` WHERE `subscription_plan_id` = '" + subscription_plan_id + "'");
		await this.db.query("UPDATE `" + DB_PREFIX + "subscription` SET `subscription_plan_id` = '0' WHERE `subscription_plan_id` = '" + subscription_plan_id + "'");
	}

	/**
	 * @param subscription_plan_id
	 *
	 * @return array
	 */
	async getSubscriptionPlan(subscription_plan_id) {
		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "subscription_plan` sp LEFT JOIN `" + DB_PREFIX + "subscription_plan_description` spd ON (sp.`subscription_plan_id` = spd.`subscription_plan_id`) WHERE sp.`subscription_plan_id` = '" + subscription_plan_id + "' AND spd.`language_id` = '" + this.config.get('config_language_id') + "'");

		return query.row;
	}

	/**
	 * @param subscription_plan_id
	 *
	 * @return array
	 */
	async getDescription(subscription_plan_id) {
		subscription_plan_description_data = [];

		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "subscription_plan_description` WHERE `subscription_plan_id` = '" + subscription_plan_id + "'");

		for (query.rows of result) {
			subscription_plan_description_data[result['language_id']] = ['name' : result['name']];
		}

		return subscription_plan_description_data;
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getSubscriptionPlans(data = {}) {
		let sql = "SELECT * FROM `" + DB_PREFIX + "subscription_plan` sp LEFT JOIN `" + DB_PREFIX + "subscription_plan_description` spd ON (sp.`subscription_plan_id` = spd.`subscription_plan_id`) WHERE spd.`language_id` = '" + this.config.get('config_language_id') + "'";

		if (data['filter_name']) {
			sql += " AND spd.`name` LIKE '" + this.db.escape(data['filter_name'] + '%') + "'";
		}

		let sort_data = [
			'spd.name',
			'sp.sort_order'
		];

		if (data['sort'] && sort_data.includes(data['sort'],)) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY `spd`.`name`";
		}

		if (data['order'] && (data['order'] == 'DESC')) {
			sql += " DESC";
		} else {
			sql += " ASC";
		}

		if (data['start'] || data['limit']) {
			if (data['start'] < 0) {
				data['start'] = 0;
			}

			if (data['limit'] < 1) {
				data['limit'] = 20;
			}

			sql += " LIMIT " + data['start'] + "," + data['limit'];
		}

		let query = await this.db.query(sql);

		return query.rows;
	}

	/**
	 * @return int
	 */
	async getTotalSubscriptionPlans() {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "subscription_plan`");

		return query.row['total'];
	}
}
