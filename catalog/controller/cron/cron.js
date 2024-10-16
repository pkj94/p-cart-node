<?php
namespace Opencart\Catalog\Controller\Cron;
/**
 *
 *
 * @package Opencart\Catalog\Controller\Cron
 */
class CronController extends Controller {
	/**
	 * @return void
	 */
	async index() {
const data ={};
		time = new Date();

		this.load.model('setting/cron');

		const results = await this.model_setting_cron.getCrons();

		for (let result of results) {
			if (result['status'] && (strtotime('+1 ' + result['cycle'], new Date(result['date_modified'])) < (time + 10))) {
				this.load.controller(result['action'], result['cron_id'], result['code'], result['cycle'], result['date_added'], result['date_modified']);

				await this.model_setting_cron.editCron(result['cron_id']);
			}
		}
	}
}