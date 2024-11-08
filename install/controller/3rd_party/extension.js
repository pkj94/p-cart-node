const axios = require('axios');

module.exports = class Controller3rdPartyExtension {
    constructor(response) {
        this.response = response;
    }

    async index(req, res) {
        try {
            const response = await axios.post('https://www.opencart.com/index.php?route=extension/json/extensions', {}, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.1) Gecko/20061204 Firefox/2.0.0.1'
                },
                timeout: 30000,
                httpsAgent: new (require('https')).Agent({
                    rejectUnauthorized: false
                })
            });

            res.setHeader('Content-Type', 'application/json');
            res.send(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            res.status(500).send('Internal Server Error');
        }
    }
}
