const requireAll = require("require-all");

module.exports = class MongoDBLibrary {
    constructor(hostname, username, password, database, port = '27017') {
        this.connect(hostname, username, password, database, port);
    }

    async connect(hostname, username, password, database, port = '27017') {
        let dbController = new DatabaseController();
        let databases = await dbController.getDatabases(hostname, username, password, database, port);
        // console.log('databases',Object.keys(databases).length)
        this = requireAll({
            dirname: DIR_SYSTEM + '/schema',
            filter: /(.+)\.js/,
            resolve: function (Model) {
                return new AbstractController(Model, databases);
            },
            map: (name, path) => {
                // console.log(name,path)
                return name;
            }
        });
    }

}

