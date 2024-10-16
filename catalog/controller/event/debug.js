<?php
namespace Opencart\Catalog\Controller\Event;
/**
 *
 *
 * @package Opencart\Catalog\Controller\Event
 */
class DebugController extends Controller {
	/**
	 * @param string route
	 * @param array  args
	 *
	 * @return void
	 */
	async index(string &route, array &args): void {
		//echo route;
	}

	/**
	 * @param string route
	 * @param array  args
	 *
	 * @return void
	 */
	async before(string &route, array &args): void {
		// add the route you want to test
		/*
		if (route == 'common/home') {
			this->session->data['debug'][route] = microtime(true);
		}
		*/
	}

	/**
	 * @param string route
	 * @param array  args
	 * @param mixed  output
	 *
	 * @return void
	 */
	async after(string route, array &args, mixed &output): void {
		// add the route you want to test
		/*
		if (route == 'common/home') {
			if ((this->session->data['debug'][route])) {
				log_data = [
					'route' => route,
					'time'  => microtime(true) - this->session->data['debug'][route]
				];
				
				this->log->write(log_data);
			}
		}
		*/
	}	
}