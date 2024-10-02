//Just extend the class and enjoy coding with nodejs and MongoDB, Currently Sql support is not given

const httpStatus = require('./httpStatusCodes');

module.exports = class BaseController {
    constructor(schema, databases) {
        this.models = {};
        this.repositories = {};
        this.httpStatus = httpStatus;
        this.databases = databases;
        // console.log('databases------',databases)
        Object.keys(databases).forEach(async (dbType) => {
            if (schema) {
                var model = databases[dbType].createModel(schema);
                this.models[dbType] = model;
            }
            // dbType = dbType.indexOf('mongo')!=-1?'mongo':dbType;
            let Repo = require('./repository/' + (dbType.indexOf('mongo') != -1 ? 'mongo' : dbType));
            this.repositories[dbType] = new Repo(schema, databases[dbType]);
        });

        this.schema = schema ? schema.name : 'default';
        this.errorMessages = {
            'fieldsMissing': 'Few fields are missing!',
            'typeMismatch': 'Invalid type of data has been sent!',
            'databaseFailure': 'Database Failure'
        }
       
    }

    _getLastThreeQuarters(currentYearAndQuarter) {
        let quarters = [];
        if (currentYearAndQuarter) {
            const year = currentYearAndQuarter.split('.')[0];
            const quarter = currentYearAndQuarter.split('.')[1];
            const quarterNum = quarter.split('Q')[1];
            if (quarterNum == 1) {
                quarters = [`${year - 1}.Q3`, `${year - 1}.Q4`, `${year}.Q1`];
            }
            if (quarterNum == 2) {
                quarters = [`${year - 1}.Q4`, `${year}.Q1`, `${year}.Q2`];
            }
            if (quarterNum == 3) {
                quarters = [`${year}.Q1`, `${year}.Q2`, `${year - 1}.Q3`];
            }
            if (quarterNum == 4) {
                quarters = [`${year}.Q2`, `${year - 1}.Q3`, `${year}.Q4`];
            }
        }
        return quarters;
    }

    _getQuarterWiseData(data, quarters) {
        let quarterWiseData = [];
        quarters.forEach(quarter => {
            const index = data.findIndex(obj => obj.quarter == quarter);
            if (index != -1) {
                quarterWiseData.push(data[index]);
            } else {
                quarterWiseData.push({ "target": 0, "quarter": quarter, "revenue": 0 })
            }
        });
        return quarterWiseData;
    }

    _updateCreatedByAndUpdateBy(req) {
        // let currentDate = new Date();
        // let timestamp = currentDate.toJSON().split('T').join(' ').split('.')[0]
        // req.body["lastUpdatedDate"] = timestamp;
        // req.body["createdDate"] = timestamp;
        // req.body["createdBy"] = req.user._id;
        // req.body["lastUpdatedBy"] = req.user._id;
    }

    isValidMethod(expectedMethod, requestMethod) {
        return new Promise((resolve, reject) => {
            if (expectedMethod == requestMethod)
                resolve({ status: 200 });
            else
                reject({});
        })
    }

    getFields(fields, type = 'mongo') {
        type = global.DATABASE || type;
        return this.repositories[type].getFields(fields);
    }

    _updateResponse(fields, response) {
        if (response && response.data && Array.isArray(response.data)) {
            const final = [];
            if (response.data.length > 0) {
                response.data.forEach(obj => {
                    const newObj = {};
                    fields.forEach(key => {
                        if (obj[key] != undefined) {
                            newObj[key] = obj[key];
                        }
                    });
                    final.push(newObj);
                })
            }
            response.data = final;
            return response;
        } else {
            const final = {};
            if (response && response.data) {
                fields.forEach(key => {
                    if (response.data[key] != undefined) {
                        final[key] = response.data[key];
                    }
                });
            }
            response.data = final;
            return response;
        }
    }

    get(req, type = 'mongo') {
        type = global.DATABASE || type;
        return this.find(req, type);
    }

    _find(req, type = 'mongo') {
        type = global.DATABASE || type;
        var query = req.query;
        return this.repositories[type]._find(query, query.options);
    }

    //TODO: need to refactor
    find(req, type = 'mongo') {
        type = global.DATABASE || type;
        var self = this;
        return this.isValidMethod('GET', req.method)
            .then(result => {
                if (req.params._id)
                    return self.repositories[type]._findById(req.params._id, req.query)
                else {
                    var totalCount = 0;
                    var query = req.query;
                    return self.repositories[type]._count(query)
                        .then(result => {
                            totalCount = result.data;
                            var limit = query.limit;
                            var skip = query.skip;
                            if (isNaN(limit) || typeof limit == 'string') {
                                limit = (limit === undefined) ? 10 : parseInt(limit);
                            }

                            // limit = (limit > 20) ? 20 : limit;

                            if (isNaN(skip) || typeof skip == 'string') {
                                skip = (skip === undefined) ? 0 : parseInt(skip);
                            }
                            return self.repositories[type]._find(query, {
                                offset: skip,
                                limit: limit
                            })
                        }).then(result => {
                            var limit = query.limit;
                            var skip = query.skip;
                            if (isNaN(limit) || typeof limit == 'string') {
                                limit = (limit === undefined) ? 10 : parseInt(limit);
                            }

                            // limit = (limit > 20) ? 20 : limit;

                            if (isNaN(skip) || typeof skip == 'string') {
                                skip = (skip === undefined) ? 0 : parseInt(skip);
                            }

                            var pagination = {
                                from: skip + 1,
                                to: skip + result.data.length
                            };
                            result.totalCount = totalCount;
                            result.count = result.data.length;
                            result.pagination = pagination;
                            return result;
                        });
                }
            });
    }
    aggregate(req, type = 'mongo') {
        type = global.DATABASE || type;
        var self = this;
        return this.isValidMethod('GET', req.method)
            .then(result => {
                if (req.params._id)
                    return self.repositories[type]._findById(req.params._id, req.query)
                else {
                    var query = req.query;
                    return self.repositories[type]._aggrigate(query).then(res => {
                        // console.log(JSON.stringify(res))

                        var result = {};
                        var pagination = {
                            from: Number(query.skip || '0') + 1,
                            to: Number(query.skip || '0') + res.data.data.length
                        };
                        result.totalCount = res.data.totalCount && res.data.totalCount.length ? res.data.totalCount[0].count : res.data.data.length;
                        result.count = res.data.data.length;
                        result.pagination = pagination;
                        result.data = res.data.data
                        return result
                    })
                }
            });
    }
    create(req, type = 'mongo') {
        type = global.DATABASE || type;
        return this.insert(req, type);
    }

    insert(req, type = 'mongo') {
        type = global.DATABASE || type;
        var self = this;
        // console.log(self.repositories, type)
        return this.isValidMethod('POST', req.method)
            .then(result => {
                req.body.createdBy = req.user ? req.user._id : null;
                req.body.updatedBy = req.user ? req.user._id : null;
                return self.repositories[type]._insert(req.body);
            });
        //alerts need to be called here
    }

    count(req, type = 'mongo') {
        type = global.DATABASE || type;
        var self = this;
        return this.isValidMethod('GET', req.method)
            .then(result => {
                return self.repositories[type]._count(req.query);
            });
    }

    findOne(req, type = 'mongo') {
        type = global.DATABASE || type;
        var self = this;
        // console.log(type,global.DATABASE)

        return this.isValidMethod('GET', req.method)
            .then(result => {
                // console.log(req.query, req.method)

                return self.repositories[type]._findOne(req.query);
            });
    }
    sum(req, type = 'mongo') {
        type = global.DATABASE || type;
        var self = this;
        // console.log(type,global.DATABASE)

        return this.isValidMethod('GET', req.method)
            .then(result => {
                // console.log(req.query, req.method)

                return self.repositories[type]._sum(req.query);
            });
    }
    avg(req, type = 'mongo') {
        type = global.DATABASE || type;
        var self = this;
        // console.log(type,global.DATABASE)

        return this.isValidMethod('GET', req.method)
            .then(result => {
                // console.log(req.query, req.method)

                return self.repositories[type]._avg(req.query);
            });
    }
    _findOne(req, type = 'mongo') {
        type = global.DATABASE || type;
        var self = this;
        return self.repositories[type]._findOne(req.query);
    }

    findOneAndUpdate(req, type = 'mongo') {
        type = global.DATABASE || type;
        var self = this;
        return this.isValidMethod('PUT', req.method)
            .then(result => {
                return self.repositories[type]._findOneAndUpdate(req.query, req.body, req);
            });
    }

    update(req, type = 'mongo') {
        type = global.DATABASE || type;
        var self = this;
        if (req.user) {
            req.body.updatedBy = req.user._id;
        }
        req.body.updated_at = new Date();

        return this.isValidMethod('PUT', req.method)
            .then(result => {
                if (req.params && req.params._id)
                    return self.repositories[type]._findByIdAndUpdate(req.params._id, req.body, req);
                else
                    return self.repositories[type]._findAndUpdate(req.query, req.body, req);
            });
    }

    _update(req, type = 'mongo') {
        type = global.DATABASE || type;
        var self = this;
        if (req.user) {
            req.body.updatedBy = req.user._id;
        }
        req.body.updated_at = new Date();

        return this.isValidMethod('PUT', req.method)
            .then(result => {
                if (req.params && req.params._id)
                    return self.repositories[type]._findByIdAndUpdate(req.params._id, req.body, req);
                else
                    return self.repositories[type]._findAndUpdate(req.query, req.body, req);
            });
    }
    replace(req, type = 'mongo') {
        type = global.DATABASE || type;
        var self = this;
        if (req.user) {
            req.body.updatedBy = req.user._id;
        }
        req.body.updated_at = new Date();

        return this.isValidMethod('PUT', req.method)
            .then(result => {
                if (req.params && req.params._id)
                    return self.repositories[type]._findByIdAndReplace(req.params._id, req.body, req);
                else
                    return self.repositories[type]._findAndReplace(req.query, req.body, req);
            });
    }

    remove(req, type = 'mongo') {
        type = global.DATABASE || type;
        var self = this;
        // req.body.updated_by = req.user._id;
        return this.isValidMethod('DELETE', req.method)
            .then(result => {
                if (req.params._id)
                    return self.repositories[type]._removeById(req.params._id);
                else
                    return self.repositories[type].remove(req.query);
            });
    }

    dropDB(req, type = '') {
        return new Promise((resolve, reject) => {
            if (type) {
                var self = this;
                // console.log(self.databases, type, typeof self.databases[type])
                if (self.databases && typeof self.databases[type] == 'object')
                    resolve(self.databases[type].dropDatabase());
                else
                    reject({ message: 'You have already deleted this', ststus: this.httpStatus.bad_request });
            } else {
                reject({ message: 'You have no permission', ststus: this.httpStatus.bad_request });
            }
        });
    }
    query(rawQuery, type = 'mongo') {
        type = global.DATABASE || type;
        return this.repositories[type].query(rawQuery);
        //alerts need to be called here
    }

    getMappedObject(obj, type = 'mongo') {
        type = global.DATABASE || type;
        return this.repositories[type].getMappedObject(obj);
    }

    execStoredProcedure(functionName, ...options) {
        return this.repositories['postgres'].execStoredProcedure(functionName, options);
    }
    objectId(type = 'mongo') {
        return this.repositories[type]._objectId();
    }
}
