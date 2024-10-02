const httpStatus = require('../../httpStatusCodes');
const async = require('async');

module.exports = class Repository {
    constructor(schema, database) {
        this.init(schema, database);
    }

    async init(schema, database) {
        this.database = database;
        // console.log('schema',schema)
        if(schema) {
            this.model = await database.createModel(schema);
            this.schemaModel = schema.schema;
            this.defaultFields = schema.defaultFields;
        }
        this.schema = schema ? schema.name : 'default';
        this.errorMessages = {
            'fieldsMissing'   : 'Few fields are missing!',
            'typeMismatch'    : 'Invalid type of data has been sent!',
            'databaseFailure' : 'Database Failure'
        }
    }

    _checkRequired(params, body) {
        var params = params;
        return new Promise((resolve, reject) => {
            async.each(params, (param, callback) => {
                if (!body[param]) {
                    callback(new Error("Parameter `" + param  +"` is Missing"));
                }
                callback();
            }, (err) => {
                if (err) {
                    return reject({ error: true, message: err.message, status:  httpStatus.bad_request });
                } else {
                    resolve({data:'continue'});
                }
            })
        });
    }

    validateObjectId(_id){
        // var objectID = require('mongodb').ObjectID;
        // return objectID.isValid(_id);
        return new RegExp("^[0-9a-fA-F]{24}$").test(_id)
    }

}