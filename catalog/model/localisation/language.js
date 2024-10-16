<?php
namespace Opencart\Catalog\Model\Localisation;
/**
 *
 *
 * @package Opencart\Catalog\Model\Localisation
 */
class LanguageController extends Model {
	/**
	 * @var array
	 */
	private array data = [];

	/**
	 * @param int language_id
	 *
	 * @return array
	 */
	async getLanguage(language_id): array {
		if ((this->data[language_id])) {
			return this->data[language_id];
		}

		query = this->db->query("SELECT * FROM `" . DB_PREFIX . "language` WHERE `language_id` = '" . (int)language_id . "'");

		language = query->row;

		if (language) {
			language['image'] = HTTP_SERVER;

			if (!language['extension']) {
				language['image'] .= 'catalog/';
			} else {
				language['image'] .= 'extension/' . language['extension'] . '/catalog/';
			}

			language['image'] .= 'language/' . language['code'] . '/' . language['code'] . '.png';
		}

		this->data[language_id] = language;

		return language;
	}

	/**
	 * @param string code
	 *
	 * @return array
	 */
	async getLanguageByCode(string code): array {
		if ((this->data[code])) {
			return this->data[code];
		}

		query = this->db->query("SELECT * FROM `" . DB_PREFIX . "language` WHERE `code` = '" . this->db->escape(code) . "'");

		language = query->row;

		if (language) {
			language['image'] = HTTP_SERVER;

			if (!language['extension']) {
				language['image'] .= 'catalog/';
			} else {
				language['image'] .= 'extension/' . language['extension'] . '/catalog/';
			}

			language['image'] .= 'language/' . language['code'] . '/' . language['code'] . '.png';
		}

		this->data[code] = language;

		return language;
	}

	/**
	 * @return array
	 */
	async getLanguages(): array {
		sql = "SELECT * FROM `" . DB_PREFIX . "language` WHERE `status` = '1' ORDER BY `sort_order`, `name`";

		results = (array)this->cache->get('language.' . md5(sql));

		if (!results) {
			query = this->db->query(sql);

			results = query->rows;

			this->cache->set('language.' . md5(sql), results);
		}

		language_data = [];

		foreach (results as result) {
			image = HTTP_SERVER;

			if (!result['extension']) {
				image .= 'catalog/';
			} else {
				image .= 'extension/' . result['extension'] . '/catalog/';
			}

			language_data[result['code']] = [
				'language_id' => result['language_id'],
				'name'        => result['name'],
				'code'        => result['code'],
				'image'       => image . 'language/' . result['code'] . '/' . result['code'] . '.png',
				'locale'      => result['locale'],
				'extension'   => result['extension'],
				'sort_order'  => result['sort_order'],
				'status'      => result['status']
			];
		}

		return language_data;
	}
}
