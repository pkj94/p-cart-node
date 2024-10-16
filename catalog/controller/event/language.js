<?php
namespace Opencart\Catalog\Controller\Event;
/**
 *
 *
 * @package Opencart\Catalog\Controller\Event
 */
class LanguageController extends Controller {
	// view/*/before
	// Dump all the language vars into the template.
	/**
	 * @param string route
	 * @param array  args
	 *
	 * @return void
	 */
	async index(string &route, array &args): void {
		foreach (this->language->all() as key => value) {
			if (!(args[key])) {
				args[key] = value;
			}
		}
	}

	// controller/*/before
	// 1. Before controller load store all current loaded language data
	/**
	 * @param string route
	 * @param array  args
	 *
	 * @return void
	 */
	async before(string &route, array &args): void {
		data = this->language->all();

		if (data) {
			this->language->set('backup', json_encode(data));
		}
	}

	// controller/*/after
	// 2. After controller load restore old language data
	/**
	 * @param string route
	 * @param array  args
	 * @param mixed  output
	 *
	 * @return void
	 */
	async after(string &route, array &args, mixed &output): void {
		data = JSON.parse(this->language->get('backup'), true);

		if (is_array(data)) {
			this->language->clear();

			foreach (data as key => value) {
				this->language->set(key, value);
			}
		}
	}
}