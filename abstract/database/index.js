const { default: mongoose } = require('mongoose');

global.ObjectId = mongoose.Schema.Types.ObjectId;

//TODO:This needs to refactored later
module.exports = class database {
    constructor(options) {
    }

    getDatabases() {
        var dbs = {};
        return new Promise(async (resolve) => {
            switch (DB_DRIVER) {
                case 'mongo': {
                    let mongo = require('./mongo');
                    let mongoInstance = new mongo();
                    await mongoInstance.createConnection();
                    dbs['mongo'] = mongoInstance;

                    break;
                }
                case 'postgres': {
                    let postgres = require('./postgres');
                    let postgresInstance = new postgres();
                    await postgresInstance.createConnection();
                    dbs['postgres'] = postgresInstance;
                    if (connections.length == (Object.keys(dbs).length)) return resolve(dbs);
                    break;
                }
            }
            resolve(dbs);
        })
    }
    
}