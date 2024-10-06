module.exports = class UserModel extends Model {
    constructor(registry) {
        super(registry);
    }
    /**
     * @param data
     *
     * @return int
     */
    async addUser(data) {
        await this.db.query("INSERT INTO `" + DB_PREFIX + "user` SET `username` = '" + this.db.escape(data['username']) + "', `user_group_id` = '" + data['user_group_id'] + "', `password` = '" + this.db.escape(password_hash(html_entity_decode(data['password'], ENT_QUOTES, 'UTF-8'), PASSWORD_DEFAULT)) + "', `firstname` = " + this.db.escape(data['firstname']) + ", `lastname` = " + this.db.escape(data['lastname']) + ", `email` = " + this.db.escape(data['email']) + ", `image` = '" + this.db.escape(data['image']) + "', `status` = '" + (data['status'] ? data['status'] : 0) + "', `date_added` = NOW()");
        return this.db.getLastId();
    }

    /**
     * @param   user_id
     * @param data
     *
     * @return void
     */
    async editUser(user_id, data) {
        await this.db.query("UPDATE `" + DB_PREFIX + "user` SET `username` = '" + this.db.escape(data['username']) + "', `user_group_id` = '" + data['user_group_id'] + "', `firstname` = " + this.db.escape(data['firstname']) + ", `lastname` = " + this.db.escape(data['lastname']) + ", `email` = " + this.db.escape(data['email']) + ", `image` = '" + this.db.escape(data['image']) + "', `status` = '" + (data['status'] ? data['status'] : 0) + "' WHERE `user_id` = '" + user_id + "'");

        if (data['password']) {
            await this.db.query("UPDATE `" + DB_PREFIX + "user` SET `password` = '" + this.db.escape(password_hash(data['password'], PASSWORD_DEFAULT)) + "' WHERE `user_id` = '" + user_id + "'");
        }
    }

    /**
     * @param user_id
     * @param     password
     *
     * @return void
     */
    async editPassword(user_id, password) {
        await this.db.query("UPDATE `" + DB_PREFIX + "user` SET `password` = '" + this.db.escape(password_hash(password)) + "', `code` = '' WHERE `user_id` = '" + user_id + "'");
    }

    /**
     * @param email
     * @param code
     *
     * @return void
     */
    async editCode(email, code) {
        await this.db.query("UPDATE `" + DB_PREFIX + "user` SET `code` = '" + this.db.escape(code) + "' WHERE LCASE(`email`) = '" + this.db.escape(oc_strtolower(email)) + "'");
    }

    /**
     * @param user_id
     *
     * @return void
     */
    async deleteUser(user_id) {
        await this.db.query("DELETE FROM `" + DB_PREFIX + "user` WHERE `user_id` = '" + user_id + "'");
        await this.db.query("DELETE FROM `" + DB_PREFIX + "user_history` WHERE `user_id` = '" + user_id + "'");
        await this.db.query("DELETE FROM `" + DB_PREFIX + "user_history` WHERE `user_id` = '" + user_id + "'");
    }

    /**
     * @param user_id
     *
     * @return array
     */
    async getUser(user_id) {
        let query = await this.db.query("SELECT *, (SELECT ug+`name` FROM `" + DB_PREFIX + "user_group` ug WHERE ug+`user_group_id` = u+`user_group_id`) AS user_group FROM `" + DB_PREFIX + "user` u WHERE u+`user_id` = '" + user_id + "'");
        return query.row;
    }

    /**
     * @param username
     *
     * @return array
     */
    async getUserByUsername(username) {
        let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "user` WHERE `username` = '" + this.db.escape(username) + "'");

        return query.row;
    }

    /**
     * @param email
     *
     * @return array
     */
    async getUserByEmail(email) {
        query = await this.db.query("SELECT DISTINCT * FROM `" + DB_PREFIX + "user` WHERE LCASE(`email`) = '" + this.db.escape(oc_strtolower(email)) + "'");

        return query.row;
    }

    /**
     * @param code
     *
     * @return array
     */
    async getUserByCode(code) {
        let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "user` WHERE `code` = '" + this.db.escape(code) + "' AND `code` != ''");

        return query.row;
    }

    /**
     * @param data
     *
     * @return array
     */
    async getUsers(data = {}) {
        let sql = "SELECT * FROM `" + DB_PREFIX + "user`";

        let sort_data = [
            'username',
            'status',
            'date_added'
        ];

        if (data['sort'] && sort_data.includes(data['sort'])) {
            sql += " ORDER BY " + data['sort'];
        } else {
            sql += " ORDER BY `username`";
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

        query = await this.db.query(sql);

        return query.rows;
    }

    /**
     * @return int
     */
    async getTotalUsers() {
        let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "user`");

        return query.row['total'];
    }

    /**
     * @param user_group_id
     *
     * @return int
     */
    async getTotalUsersByGroupId(user_group_id) {
        let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "user` WHERE `user_group_id` = '" + user_group_id + "'");

        return query.row['total'];
    }

    /**
     * @param email
     *
     * @return int
     */
    async getTotalUsersByEmail(email) {
        let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "user` WHERE LCASE(`email`) = '" + this.db.escape(oc_strtolower(email)) + "'");

        return query.row['total'];
    }

    /**
     * @param   user_id
     * @param data
     *
     * @return void
     */
    async addLogin(user_id, data) {
        await this.db.query("INSERT INTO `" + DB_PREFIX + "user_login` SET `user_id` = '" + user_id + "', `ip` = " + this.db.escape(data['ip']) + ", `user_agent` = " + this.db.escape(data['user_agent']) + ", `date_added` = NOW()");
    }

    /**
     * @param user_id
     * @param start
     * @param limit
     *
     * @return array
     */
    async getLogins(user_id, start = 0, limit = 10) {
        if (start < 0) {
            start = 0;
        }

        if (limit < 1) {
            limit = 10;
        }

        let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "user_login` WHERE `user_id` = '" + user_id + "' LIMIT " + start + "," + limit);

        if (query.num_rows) {
            return query.rows;
        } else {
            return [];
        }
    }

    /**
     * @param user_id
     *
     * @return int
     */
    async getTotalLogins(user_id) {
        let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "user_login` WHERE `user_id` = '" + user_id + "'");

        if (query.num_rows) {
            return query.row['total'];
        } else {
            return 0;
        }
    }

    /**
     * @param   user_id
     * @param data
     *
     * @return void
     */
    async addAuthorize(user_id, data) {
        await this.db.query("INSERT INTO `" + DB_PREFIX + "user_authorize` SET `user_id` = '" + user_id + "', `token` = '" + this.db.escape(data['token']) + "', `ip` = '" + this.db.escape(data['ip']) + "', `user_agent` = '" + this.db.escape(data['user_agent']) + "', `date_added` = NOW()");
    }

    /**
     * @param  user_authorize_id
     * @param bool status
     *
     * @return void
     */
    async editAuthorizeStatus(user_authorize_id, status) {
        await this.db.query("UPDATE `" + DB_PREFIX + "user_authorize` SET `status` = '" + status + "' WHERE `user_authorize_id` = '" + user_authorize_id + "'");
    }

    /**
     * @param user_authorize_id
     * @param total
     *
     * @return void
     */
    async editAuthorizeTotal(user_authorize_id, total) {
        await this.db.query("UPDATE `" + DB_PREFIX + "user_authorize` SET `total` = '" + total + "' WHERE `user_authorize_id` = '" + user_authorize_id + "'");
    }

    /**
     * @param user_authorize_id
     *
     * @return void
     */
    async deleteAuthorize(user_authorize_id) {
        await this.db.query("DELETE FROM `" + DB_PREFIX + "user_authorize` WHERE `user_authorize_id` = '" + user_authorize_id + "'");
    }

    /**
     * @param    user_id
     * @param token
     *
     * @return array
     */
    async getAuthorizeByToken(user_id, token) {
        let query = await this.db.query("SELECT *, (SELECT SUM(total) FROM `" + DB_PREFIX + "user_authorize` WHERE `user_id` = '" + user_id + "') AS `attempts` FROM `" + DB_PREFIX + "user_authorize` WHERE `user_id` = '" + user_id + "' AND `token` = '" + this.db.escape(token) + "'");

        return query.row;
    }

    /**
     * @param user_id
     *
     * @return void
     */
    async resetAuthorizes(user_id) {
        await this.db.query("UPDATE `" + DB_PREFIX + "user_authorize` SET `total` = '0' WHERE `user_id` = '" + user_id + "'");
    }

    /**
     * @param user_id
     * @param start
     * @param limit
     *
     * @return array
     */
    async getAuthorizes(user_id, start = 0, limit = 10) {
        if (start < 0) {
            start = 0;
        }

        if (limit < 1) {
            limit = 10;
        }

        let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "user_authorize` WHERE `user_id` = '" + user_id + "' LIMIT " + start + "," + limit);

        if (query.num_rows) {
            return query.rows;
        } else {
            return [];
        }
    }

    /**
     * @param user_id
     *
     * @return int
     */
    async getTotalAuthorizes(user_id) {
        let query = await this.db.query("SELECT COUNT(*) AS total FROM `" + DB_PREFIX + "user_authorize` WHERE `user_id` = '" + user_id + "'");

        if (query.num_rows) {
            return query.row['total'];
        } else {
            return 0;
        }
    }
}