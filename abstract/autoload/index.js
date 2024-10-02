module.exports = class Autoload {
    constructor(databases) {
        this.databases = databases;
    }
    async loadConfigs() {
        let config = {};
        // console.log(JSON.stringify(Object.keys(schemas)));
        let setting = await schemas.schema_setting.find({ method: 'GET', params: {}, query: { limit: 0, storeId: null } });
        let languages = await schemas.schema_language.find({ method: 'GET', params: {}, query: { limit: 0 } });
        // console.log(languages.data)
        if (setting.data.length)
            for (let i = 0; i < setting.data.length; i++) {
                let a = setting.data[i];
                // console.log('-------',a)
                config[a.key] = a.stringify ? (a.value ? JSON.parse(a.value) : '') : a.value;
                if (a.key === 'config_language' || a.key == 'config_language_admin') {
                    let lang = languages.data.find(itm => itm.code == a.value);

                    // console.log(a.key,a.value,lang)
                    config[a.key + '_id'] = lang._id || '';
                    config[a.key + '_detail'] = lang || {}
                }
                if (a.key == 'config_currency') {
                    let curreincy = await schemas.schema_currency.find({ method: 'GET', params: {}, query: { code: a.value } });
                    config[a.key + '_id'] = curreincy.data[0]._id || ''
                    config[a.key + '_detail'] = curreincy.data[0] || {}
                }
            }
        global.config = config;
    }
}