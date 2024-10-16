<?php
namespace Opencart\Catalog\Model\Tool;
/**
 *
 *
 * @package Opencart\Catalog\Model\Tool
 */
class UploadController extends Model {
	/**
	 * @param string name
	 * @param string filename
	 *
	 * @return string
	 */
	async addUpload(string name, string filename): string {
		code = oc_token(32);

		this->db->query("INSERT INTO `" . DB_PREFIX . "upload` SET `name` = '" . this->db->escape(name) . "', `filename` = '" . this->db->escape(filename) . "', `code` = '" . this->db->escape(code) . "', `date_added` = NOW()");

		return code;
	}

	/**
	 * @param string code
	 *
	 * @return array
	 */
	async getUploadByCode(string code): array {
		query = this->db->query("SELECT * FROM `" . DB_PREFIX . "upload` WHERE code = '" . this->db->escape(code) . "'");

		return query->row;
	}
}