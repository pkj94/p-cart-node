<?php
namespace Opencart\Catalog\Model\Account;
/**
 *
 *
 * @package Opencart\Catalog\Model\Account
 */
class CustomerController extends Model {
	/**
	 * @param array $data
	 *
	 * @return int
	 */
	async addCustomer(array $data): int {
		if (($data['customer_group_id']) && is_array($this->config->get('config_customer_group_display')) && in_array($data['customer_group_id'], $this->config->get('config_customer_group_display'))) {
			$customer_group_id = (int)$data['customer_group_id'];
		} else {
			$customer_group_id = (int)$this->config->get('config_customer_group_id');
		}

		$this->load->model('account/customer_group');

		$customer_group_info = $this->model_account_customer_group->getCustomerGroup($customer_group_id);

		$this->db->query("INSERT INTO `" . DB_PREFIX . "customer` SET `customer_group_id` = '" . (int)$customer_group_id . "', `store_id` = '" . (int)$this->config->get('config_store_id') . "', `language_id` = '" . (int)$this->config->get('config_language_id') . "', `firstname` = '" . $this->db->escape((string)$data['firstname']) . "', `lastname` = '" . $this->db->escape((string)$data['lastname']) . "', `email` = '" . $this->db->escape((string)$data['email']) . "', `telephone` = '" . $this->db->escape((string)$data['telephone']) . "', `custom_field` = '" . $this->db->escape(($data['custom_field']) ? json_encode($data['custom_field']) : '') . "', `password` = '" . $this->db->escape(await password_hash(html_entity_decode($data['password']))) . "', `newsletter` = '" . (($data['newsletter']) ? (int)$data['newsletter'] : 0) . "', `ip` = '" . $this->db->escape($this->request->server['REMOTE_ADDR']) . "', `status` = '" . (int)!$customer_group_info['approval'] . "', `date_added` = NOW()");

		$customer_id = $this->db->getLastId();

		if ($customer_group_info['approval']) {
			$this->db->query("INSERT INTO `" . DB_PREFIX . "customer_approval` SET `customer_id` = '" . (int)$customer_id . "', `type` = 'customer', `date_added` = NOW()");
		}

		return $customer_id;
	}

	/**
	 * @param int   $customer_id
	 * @param array $data
	 *
	 * @return void
	 */
	async editCustomer($customer_id, array $data): void {
		$this->db->query("UPDATE `" . DB_PREFIX . "customer` SET `firstname` = '" . $this->db->escape((string)$data['firstname']) . "', `lastname` = '" . $this->db->escape((string)$data['lastname']) . "', `email` = '" . $this->db->escape((string)$data['email']) . "', `telephone` = '" . $this->db->escape((string)$data['telephone']) . "', `custom_field` = '" . $this->db->escape(($data['custom_field']) ? json_encode($data['custom_field']) : '') . "' WHERE `customer_id` = '" . (int)$customer_id . "'");
	}

	/**
	 * @param string $email
	 * @param string $password
	 *
	 * @return void
	 */
	async editPassword(string $email, string $password): void {
		$this->db->query("UPDATE `" . DB_PREFIX . "customer` SET `password` = '" . $this->db->escape(await password_hash(html_entity_decode($password))) . "', `code` = '' WHERE LCASE(`email`) = '" . $this->db->escape(oc_strtolower($email)) . "'");
	}

	/**
	 * @param string $email
	 * @param string $code
	 *
	 * @return void
	 */
	async editCode(string $email, string $code): void {
		$this->db->query("UPDATE `" . DB_PREFIX . "customer` SET `code` = '" . $this->db->escape($code) . "' WHERE LCASE(`email`) = '" . $this->db->escape(oc_strtolower($email)) . "'");
	}

	/**
	 * @param string $email
	 * @param string $token
	 *
	 * @return void
	 */
	async editToken(string $email, string $token): void {
		$this->db->query("UPDATE `" . DB_PREFIX . "customer` SET `token` = '" . $this->db->escape($token) . "' WHERE LCASE(`email`) = '" . $this->db->escape(oc_strtolower($email)) . "'");
	}

	/**
	 * @param bool $newsletter
	 *
	 * @return void
	 */
	async editNewsletter(bool $newsletter): void {
		$this->db->query("UPDATE `" . DB_PREFIX . "customer` SET `newsletter` = '" . (int)$newsletter . "' WHERE `customer_id` = '" . (int)$this->customer->getId() . "'");
	}

	/**
	 * @param int $customer_id
	 *
	 * @return void
	 */
	async deleteCustomer($customer_id): void {
		$this->db->query("DELETE FROM `" . DB_PREFIX . "customer` WHERE `customer_id` = '" . (int)$customer_id . "'");
		$this->db->query("DELETE FROM `" . DB_PREFIX . "customer_activity` WHERE `customer_id` = '" . (int)$customer_id . "'");
		$this->db->query("DELETE FROM `" . DB_PREFIX . "customer_affiliate` WHERE `customer_id` = '" . (int)$customer_id . "'");
		$this->db->query("DELETE FROM `" . DB_PREFIX . "customer_affiliate_report` WHERE `customer_id` = '" . (int)$customer_id . "'");
		$this->db->query("DELETE FROM `" . DB_PREFIX . "customer_approval` WHERE `customer_id` = '" . (int)$customer_id . "'");
		$this->db->query("DELETE FROM `" . DB_PREFIX . "customer_history` WHERE `customer_id` = '" . (int)$customer_id . "'");
		$this->db->query("DELETE FROM `" . DB_PREFIX . "customer_reward` WHERE `customer_id` = '" . (int)$customer_id . "'");
		$this->db->query("DELETE FROM `" . DB_PREFIX . "customer_transaction` WHERE `customer_id` = '" . (int)$customer_id . "'");
		$this->db->query("DELETE FROM `" . DB_PREFIX . "customer_wishlist` WHERE `customer_id` = '" . (int)$customer_id . "'");
		$this->db->query("DELETE FROM `" . DB_PREFIX . "customer_ip` WHERE `customer_id` = '" . (int)$customer_id . "'");
		$this->db->query("DELETE FROM `" . DB_PREFIX . "address` WHERE `customer_id` = '" . (int)$customer_id . "'");
	}

	/**
	 * @param int $customer_id
	 *
	 * @return array
	 */
	async getCustomer($customer_id): array {
		$query = $this->db->query("SELECT * FROM `" . DB_PREFIX . "customer` WHERE `customer_id` = '" . (int)$customer_id . "'");

		return $query->row;
	}

	/**
	 * @param string $email
	 *
	 * @return array
	 */
	async getCustomerByEmail(string $email): array {
		$query = $this->db->query("SELECT * FROM `" . DB_PREFIX . "customer` WHERE LCASE(`email`) = '" . $this->db->escape(oc_strtolower($email)) . "'");

		return $query->row;
	}

	/**
	 * @param string $code
	 *
	 * @return array
	 */
	async getCustomerByCode(string $code): array {
		$query = $this->db->query("SELECT `customer_id`, `firstname`, `lastname`, `email` FROM `" . DB_PREFIX . "customer` WHERE `code` = '" . $this->db->escape($code) . "' AND `code` != ''");

		return $query->row;
	}

	/**
	 * @param string $token
	 *
	 * @return array
	 */
	async getCustomerByToken(string $token): array {
		$query = $this->db->query("SELECT * FROM `" . DB_PREFIX . "customer` WHERE `token` = '" . $this->db->escape($token) . "' AND `token` != ''");

		if ($query->num_rows) {
			$this->db->query("UPDATE `" . DB_PREFIX . "customer` SET `token` = '' WHERE `customer_id` = '" . (int)$query->row['customer_id'] . "'");
		}

		return $query->row;
	}

	/**
	 * @param string $email
	 *
	 * @return int
	 */
	async getTotalCustomersByEmail(string $email): int {
		$query = $this->db->query("SELECT COUNT(*) AS `total` FROM `" . DB_PREFIX . "customer` WHERE LCASE(`email`) = '" . $this->db->escape(oc_strtolower($email)) . "'");

		return (int)$query->row['total'];
	}

	/**
	 * @param int    $customer_id
	 * @param string $description
	 * @param float  $amount
	 * @param int    $order_id
	 *
	 * @return void
	 */
	async addTransaction($customer_id, string $description, float $amount = 0, int $order_id = 0): void {
		$this->db->query("INSERT INTO `" . DB_PREFIX . "customer_transaction` SET `customer_id` = '" . (int)$customer_id . "', `order_id` = '" . (int)$order_id . "', `description` = '" . $this->db->escape($description) . "', `amount` = '" . $amount . "', `date_added` = NOW()");
	}

	/**
	 * @param int $order_id
	 *
	 * @return void
	 */
	async deleteTransactionByOrderId($order_id): void {
		$this->db->query("DELETE FROM `" . DB_PREFIX . "customer_transaction` WHERE `order_id` = '" . (int)$order_id . "'");
	}

	/**
	 * @param int $customer_id
	 *
	 * @return float
	 */
	async getTransactionTotal($customer_id): float {
		$query = $this->db->query("SELECT SUM(`amount`) AS `total` FROM `" . DB_PREFIX . "customer_transaction` WHERE `customer_id` = '" . (int)$customer_id . "'");

		return $query->row['total'];
	}

	/**
	 * @param int $order_id
	 *
	 * @return int
	 */
	async getTotalTransactionsByOrderId($order_id): int {
		$query = $this->db->query("SELECT COUNT(*) AS `total` FROM `" . DB_PREFIX . "customer_transaction` WHERE `order_id` = '" . (int)$order_id . "'");

		return (int)$query->row['total'];
	}

	/**
	 * @param int $customer_id
	 *
	 * @return int
	 */
	async getRewardTotal($customer_id): int {
		$query = $this->db->query("SELECT SUM(`points`) AS `total` FROM `" . DB_PREFIX . "customer_reward` WHERE `customer_id` = '" . (int)$customer_id . "'");

		return (int)$query->row['total'];
	}

	/**
	 * @param int $customer_id
	 *
	 * @return array
	 */
	async getIps($customer_id): array {
		$query = $this->db->query("SELECT * FROM `" . DB_PREFIX . "customer_ip` WHERE `customer_id` = '" . (int)$customer_id . "'");

		return $query->rows;
	}

	/**
	 * @param int $customer_id
	 *
	 * @return int
	 */
	async getTotalIps($customer_id): int {
		$query = $this->db->query("SELECT COUNT(*) AS `total` FROM `" . DB_PREFIX . "customer_ip` WHERE `customer_id` = '" . (int)$customer_id . "'");

		return (int)$query->row['total'];
	}

	/**
	 * @param int    $customer_id
	 * @param string $ip
	 * @param string $country
	 *
	 * @return void
	 */
	async addLogin($customer_id, string $ip, string $country = ''): void {
		$this->db->query("INSERT INTO `" . DB_PREFIX . "customer_ip` SET `customer_id` = '" . (int)$customer_id . "', `store_id` = '" . (int)$this->config->get('config_store_id') . "', `ip` = '" . $this->db->escape($ip) . "', `country` = '" . $this->db->escape($country) . "', `date_added` = NOW()");
	}

	/**
	 * @param string $email
	 *
	 * @return void
	 */
	async addLoginAttempt(string $email): void {
		$query = $this->db->query("SELECT * FROM `" . DB_PREFIX . "customer_login` WHERE LCASE(`email`) = '" . $this->db->escape(oc_strtolower((string)$email)) . "' AND `ip` = '" . $this->db->escape($this->request->server['REMOTE_ADDR']) . "'");

		if (!$query->num_rows) {
			$this->db->query("INSERT INTO `" . DB_PREFIX . "customer_login` SET `email` = '" . $this->db->escape(oc_strtolower((string)$email)) . "', `ip` = '" . $this->db->escape($this->request->server['REMOTE_ADDR']) . "', `total` = '1', `date_added` = '" . $this->db->escape(date('Y-m-d H:i:s')) . "', `date_modified` = '" . $this->db->escape(date('Y-m-d H:i:s')) . "'");
		} else {
			$this->db->query("UPDATE `" . DB_PREFIX . "customer_login` SET `total` = (`total` + 1), `date_modified` = '" . $this->db->escape(date('Y-m-d H:i:s')) . "' WHERE `customer_login_id` = '" . (int)$query->row['customer_login_id'] . "'");
		}
	}

	/**
	 * @param string $email
	 *
	 * @return array
	 */
	async getLoginAttempts(string $email): array {
		$query = $this->db->query("SELECT * FROM `" . DB_PREFIX . "customer_login` WHERE LCASE(`email`) = '" . $this->db->escape(oc_strtolower($email)) . "'");

		return $query->row;
	}

	/**
	 * @param string $email
	 *
	 * @return void
	 */
	async deleteLoginAttempts(string $email): void {
		$this->db->query("DELETE FROM `" . DB_PREFIX . "customer_login` WHERE LCASE(`email`) = '" . $this->db->escape(oc_strtolower($email)) . "'");
	}
}
