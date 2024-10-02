const axios = require('axios');
module.exports = class Promotion extends Controller {
    constructor(registry) {
        super(registry);
    }
    async index() {
        try {
            const response = await axios.get('https://www.opencart.com/index.php?route=api/install', {
                timeout: 30000, // 30 seconds timeout
                httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }) // for CURLOPT_SSL_VERIFYPEER = 0
            });
            if (response.status === 200) {
                return response.data;
            } else {
                return '';
            }
        } catch (error) {
            return '';
        }
    }
}
