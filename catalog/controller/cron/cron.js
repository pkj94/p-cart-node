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
	async index(): void {
		time = time();

		this->load->model('setting/cron');

		results = this->model_setting_cron->getCrons();

		foreach (results as result) {
			if (result['status'] && (strtotime('+1 ' . result['cycle'], new Date(result['date_modified'])) < (time + 10))) {
				this->load->controller(result['action'], result['cron_id'], result['code'], result['cycle'], result['date_added'], result['date_modified']);

				this->model_setting_cron->editCron(result['cron_id']);
			}
		}
	}
}