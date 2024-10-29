const strtotime = require("locutus/php/datetime/strtotime");

module.exports = class Cron extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		let time = new Date();

		this.load.model('setting/cron', this);

		const results = await this.model_setting_cron.getCrons();

		for (let result of results) {
			if (result['status'] && (new Date(Date.parse(result.date_modified) + 1 * this.__getMilliseconds(result.cycle)) < (time + 10))) {
				await this.load.controller(result['action'], result['cron_id'], result['code'], result['cycle'], result['date_added'], result['date_modified']);

				await this.model_setting_cron.editCron(result['cron_id']);
			}
		}
	}
	__getMilliseconds(cycle) {
		switch (cycle) {
			case 'minute':
				return 60 * 1000;
			case 'hour':
				return 60 * 60 * 1000;
			case 'day':
				return 24 * 60 * 60 * 1000;
			case 'week':
				return 7 * 24 * 60 * 60 * 1000;
			case 'month':
				return 30 * 24 * 60 * 60 * 1000;
			case 'year':
				return 365 * 24 * 60 * 60 * 1000;
			default: throw new Error('Invalid cycle');
		}
	}
}