
const Config = require('../system/engine/config');
module.exports = function () {
    const loadAdminControllers = async (req, res, next) => {
        // console.log(req.params)
        require('./config');
        // console.log(typeof DIR_APPLICATION == 'undefined')
        if (typeof DIR_APPLICATION == 'undefined')
            return res.redirect('/install')
        
        // Config
        let config = new Config();
        registry.set('config', config);
        config.addPath(DIR_CONFIG);


    };
    // loadAdminControllers();
    app.all('/admin', loadAdminControllers);
    app.all('/admin/:controller', loadAdminControllers);
    app.all('/admin/:controller/:method', loadAdminControllers);
}