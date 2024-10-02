const httpStatus = require('../../httpStatusCodes');
const Repository = require('../base');

module.exports = class Postgres extends Repository {
    constructor(schema, database) {
        super(schema, database);
    }

    getMappedObject(obj) {
        var self = this;
        var mappedObj = {};
        Object.keys(self.schemaModel).forEach((key) => {
            if (typeof obj[key] != 'undefined') {
                if(typeof obj[key] == 'string')
                    mappedObj[self.schemaModel[key]["mappedTo"]] = obj[key].trim();
                if(typeof  obj[key] == 'object' && Array.isArray(obj[key]) && obj[key].length > 0 && typeof  obj[key][0] == 'object') {
                    mappedObj[self.schemaModel[key]["mappedTo"]] = JSON.stringify(obj[key]);
                }
                else 
                    mappedObj[self.schemaModel[key]["mappedTo"]] = obj[key];
            }
        })
        return mappedObj;
    }

    _generateFieldsQuery(fieldList) {
        return fieldList.join(',');
    }

    getFields(fields) {
        const fieldList = [];
        if(!fields) {
            fields = this.defaultFields;
        }
        Object.keys(this.schemaModel).forEach((key) => {
            const index = fields.indexOf(this.schemaModel[key]["mappedTo"]);
            if(index != -1) {
                fieldList.push(this.schemaModel[key]["mappedTo"]);
            }
        });
        if(fields && Array.isArray(fields)) {
            fields.forEach(field => {
                if(field.indexOf('as') != -1) {
                    fieldList.push(field);
                }
            })
        }
        return this._generateFieldsQuery(fieldList);
    }

    getMappedResult(obj) {
        var self = this;
        if (Array.isArray(obj)) {
            var finalResult = [];
            obj.forEach(item => {
                let arrayObj = {};
                Object.keys(self.schemaModel).forEach((key) => {
                    if (typeof item[self.schemaModel[key]["mappedTo"]] != 'undefined') {
                        arrayObj[key] = (item[self.schemaModel[key]["mappedTo"]]);
                        if(typeof arrayObj[key] == 'string')
                            arrayObj[key] = arrayObj[key].trim();
                    }
                })
                finalResult.push(arrayObj);
            });
            return finalResult;
        } else {
            var finalResult = {};
            Object.keys(self.schemaModel).forEach((key) => {
                if (typeof obj[self.schemaModel[key]["mappedTo"]] != 'undefined') {
                    finalResult[key] = (obj[self.schemaModel[key]["mappedTo"]]);
                    if(typeof  finalResult[key] == 'string')
                        finalResult[key] =  finalResult[key].trim();
                }
            });
            return finalResult;
        }
    }

    _insert(data) {
        if (data == null) data = {};
        var self = this;
        var bodyObj = {};
        data.updated_at = new Date();
        data.created_at = new Date();
        Object.keys(self.schemaModel).forEach((key) => {
            if (typeof data[key] != 'undefined') {
                if(typeof  data[key] == 'string')
                    bodyObj[self.schemaModel[key]["mappedTo"]] = data[key].trim();
                if(typeof  data[key] == 'object' && Array.isArray(data[key]) && data[key].length > 0 && typeof  data[key][0] == 'object') {
                    bodyObj[self.schemaModel[key]["mappedTo"]] = JSON.stringify(data[key]);
                }
                else
                    bodyObj[self.schemaModel[key]["mappedTo"]] = data[key];
            } else if (typeof self.schemaModel[key].default == 'string') {
                bodyObj[self.schemaModel[key]["mappedTo"]] = self.schemaModel[key].default;
            }
        })
        // console.log("body:", bodyObj);
        return new Promise((resolve, reject) => {
            return this.model.insert(bodyObj)
                .then(result => {
                    resolve({ data: self.getMappedResult(result), status: httpStatus.ok, message: self.schema + ' record created successfully' });
                }).catch(error => {
                    // console.log(error);
                    reject({ error: error, status: httpStatus.bad_request, message: "Error occurred" });
                });
        })
    }

    _find(queryString, pagination) {
        var self = this;
        var queryObj = this.getMappedObject(queryString);
        return new Promise((resolve, reject) => {
            this.model.find(queryObj, pagination)
                .then(result => {
                    resolve({ data: self.getMappedResult(result), status: httpStatus.ok, message: self.schema + '\'s record found successfully' });
                })
                .catch(error => {
                    reject({ error: error, status: httpStatus.bad_request, message: "Error occurred" });
                });
        });
    }

    _count(query) {
        var self = this;
        var queryObj = this.getMappedObject(query);
        return new Promise((resolve, reject) => {
            self.model.count(queryObj)
                .then(result => {
                    resolve({ data: result, status: httpStatus.ok });
                })
                .catch(error => {
                    reject({ error: error, status: httpStatus.bad_request, message: 'Error occurred' });
                });
        });
    }

    _findOne(queryString) {
        var self = this;
        var queryObj = this.getMappedObject(queryString);
        return new Promise((resolve, reject) => {
            self.model.findOne(queryObj)
                .then(result => {
                    resolve({ data: self.getMappedResult(result || {}), status: httpStatus.ok });
                })
                .catch(error => {
                    reject({ error: error, status: httpStatus.bad_request, message: 'Error occurred' });
                });
        });
    }

    _findById(_id) {
        var self = this;
        return new Promise((resolve, reject) => {
            self.model.findOne(_id)
                .then(result => {
                    resolve({ data: self.getMappedResult(result), status: httpStatus.ok });
                })
                .catch(error => {
                    reject({ error: error, status: httpStatus.bad_request, message: 'Error occurred' });
                });
        });
    }

    _findByIdAndUpdate(_id, update) {
        var self = this;
        update.lastUpdatedDate = new Date();
        var updateObj = this.getMappedObject(update);
        return new Promise((resolve, reject) => {
            self.model.update(_id, updateObj)
                .then(result => {
                    resolve({ data: self.getMappedResult(result), status: httpStatus.ok });
                })
                .catch(error => {
                    reject({ error: error, status: httpStatus.bad_request, message: 'Error occurred' });
                });
        });
    }

    _findOneAndUpdate(findQuery, update) {
        var self = this;
        update.lastUpdatedDate = new Date();
        var findObj = this.getMappedObject(findQuery);
        var updateObj = this.getMappedObject(update);
        return new Promise((resolve, reject) => {
            self.model.update(findObj, updateObj, { build: true })
                .then(result => {
                    resolve({ data: self.getMappedResult(result), status: httpStatus.ok });
                })
                .catch(error => {
                    reject({ error: error, status: httpStatus.bad_request, message: 'Error occurred' });
                });;
        });
    }

    // _findAndUpdate(findQuery, update) {
    //     var self = this;
    //     var findObj = this.getMappedObject(findQuery);
    //     var updateObj =  this.getMappedObject(update);
    //     return new Promise((resolve, reject) => {
    //         self.model.update(findObj, updateObj, { build: true})
    //         .then(result => {
    //             resolve({ data :result, status : httpStatus.ok});
    //         })
    //         .catch(error => {
    //             reject({ error : error, status : httpStatus.bad_request, message : 'Error occurred'});
    //         });
    //     });
    // }

    _findAndUpdate(findQuery, update) {
        var self = this;
        var findObj = this.getMappedObject(findQuery);
        var updateObj = this.getMappedObject(update);
        if(updateObj.updated_at) {
            updateObj.updated_at = updateObj.updated_at.toISOString();
        }
        return new Promise((resolve, reject) => {
            let rawQuery = "update public." + self.schema + " set ";
            var count = 0;
            var body = Object.keys(updateObj);
            body.forEach((key) => {
                if (typeof updateObj[key] != "boolean")
                    rawQuery += key + "='" + updateObj[key] + "' ";
                else
                    rawQuery += key + "=" + updateObj[key] + " ";
                if (body.length != count + 1)
                    rawQuery += ", ";
                count++;
            });

            var count = 0;
            var query = Object.keys(findObj);
            query.forEach((key) => {
                if (count == 0) {
                    rawQuery += " where "
                }
                if (typeof findObj[key] != "boolean")
                    rawQuery += key + "='" + findObj[key] + "' ";
                else
                    rawQuery += key + "=" + findObj[key] + " ";
                if (query.length != count + 1)
                    rawQuery += " and ";
                count++;
            });
            return self.query(rawQuery)
                .then(result => {
                    resolve({ data: self.getMappedResult(result), status: httpStatus.ok });
                })
                .catch(error => {
                    reject({ error: error, status: httpStatus.bad_request, message: 'Error occurred' });
                });
        });
    }

    remove(findQuery) {
        var self = this;
        var findObj = this.getMappedObject(findQuery);
        return new Promise((resolve, reject) => {
            self.model.destroy(findObj, { only: true })
                .then(result => {
                    resolve({ data: self.getMappedResult(result), status: httpStatus.ok });
                })
                .catch(error => {
                    reject({ error: error, status: httpStatus.bad_request, message: 'Error occurred' });
                });
        });
    }

    _removeById(_id) {
        var self = this;
        return new Promise((resolve, reject) => {
            self.model.destroy(_id)
                .then(result => {
                    resolve({ data: self.getMappedResult(result), status: httpStatus.ok, message: self.schema + ' deleted successfully' });
                })
                .catch(error => {
                    reject({ error: error, status: httpStatus.bad_request, message: 'Error occurred' });
                });
        });
    }

    query(rawQuery) {
        return new Promise(async (resolve, reject) => {
            try {
                let result = await this.database.db_connection.query(rawQuery);
                resolve({ data: result, status: httpStatus.ok });
            } catch(err) {
                reject({ error: err, status: httpStatus.bad_request, message: 'Error occurred' });
            }
            
        });
    }

    execStoredProcedure(name, args) {
        var self = this;
        var storedProcedure = "self.database.db_connection[name](";
        args.forEach((arg, index)=> {
            storedProcedure += `'${arg}'`;
            if(index == args.length-1) storedProcedure += ')'
            else storedProcedure += ','
        })
        return new Promise(async (resolve, reject) => {
            let result = await eval(storedProcedure);
            resolve({ data: result, status: httpStatus.ok });
        });
    }
}