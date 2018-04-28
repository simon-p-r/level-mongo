'use strict';

const Async = require('neo-async');
const Operators = require('./operator');
const Utils = require('./utils.js');

module.exports = class Collection {

    constructor(db, options) {

        this._db = db;
        this._settings = options;

    };

    find(cb) {

        const records = [];
        const cursor = this._db.createReadStream();
        cursor.on('data', (data) => {

            records.push(data.value);
        });

        cursor.on('error', (err) => {
            // $lab:coverage:off$
            return process.nextTick(() => {

                cb(err, null);
            });
            // $lab:coverage:on$
        });

        cursor.on('end', () => {

            return process.nextTick(() => {

                cb(null, records);
            });
        });

    };

    findOne(query, cb) {

        const keyName = this._settings.key;

        if (typeof cb !== 'function') {
            throw new TypeError('callback is not a function');
        }

        if (!Utils.isObj(query)) {
            return process.nextTick(() => {

                cb(new TypeError('query must be an object with index field as key and value the unique value'), null);
            });
        }

        const key = query[keyName];

        if (!Utils.isString(key)) {
            return process.nextTick(() => {

                cb(new TypeError('key must be a string'), null);
            });
        }

        return this._db.get(key, (err, rec) => {

            if (err) {
                // $lab:coverage:off$
                if (err.message.match(/[Key not found in database]/gi)) {
                    return cb(null, null);
                }
                return cb(err, null);
                // $lab:coverage:on$
            }

            return cb(null, rec);
        });
    };

    deleteOne(query, cb) {

        // returns just an error, won't return error if db is empty.  TODO check key exists before deleting
        const keyName = this._settings.key;
        if (typeof cb !== 'function') {
            throw new TypeError('callback is not a function');
        }

        if (!Utils.isObj(query)) {
            return process.nextTick(() => {

                cb(new TypeError('query must be an object with index field as key and value the unique value'), null);
            });
        }

        const key = query[keyName];
        this._db.get(key, (err, doc) => {

            if (err) {
                // $lab:coverage:off$
                if (err.message.match(/[Key not found in database]/gi)) {
                    return cb(null, null);
                }
                return cb(err, null);
                // $lab:coverage:on$
            }

            this._db.del(key, (err) => {

                return cb(err, { deleted: key });

            });

        });

    };

    deleteMany(cb) {

        return this.getKeys((err, keys) => {

            // $lab:coverage:off$
            if (err) {
                return cb(err, null);
            }
            // $lab:coverage:on$

            if (!keys.length) {
                return cb(null, { deleted: 0 });
            }

            const batch = keys.map((key) => {

                return { type: 'del', key };
            });

            return this._db.batch(batch, (err, results) => {

                return cb(err, { deleted: keys });
            });
        });


    };

    insertOne(doc, cb) {

        const keyName = this._settings.key;

        if (!Utils.isFunction(cb)) {
            throw new TypeError('callback is not a function');
        }

        if (!Utils.isObj(doc)) {
            return process.nextTick(() => {

                cb(new TypeError('document is not an object'), null);
            });
        }

        const key = doc[keyName];

        if (!Utils.isString(key)) {
            return process.nextTick(() => {

                cb(new TypeError('key must be a string'), null);
            });
        }

        this.getKeys((err, keys) => {

            // $lab:coverage:off$
            if (err) {
                return cb(err, null);
            }
            // $lab:coverage:on$

            if (~keys.indexOf(key)) {
                return process.nextTick(() => {

                    cb(new Error(`unique key violation, key "${key}" is already in use`), null);
                });
            }

            this._db.put(key, doc, (err) => {

                return cb(err, doc);
            });

        });

    };

    insertMany(recs, cb) {

        const keyName = this._settings.key;

        if (!Utils.isFunction(cb)) {
            throw new TypeError('callback is not a function');
        }

        if (!Utils.isArray(recs)) {
            return process.nextTick(() => {

                cb(new TypeError('batch insert must be an array of documents'), null);
            });
        }


        this.getKeys((err, keys) => {

            // $lab:coverage:off$
            if (err) {
                return cb(err, null);
            }
            // $lab:coverage:on$

            const iterator = (rec, next) => {

                const key = rec[keyName];

                if (!Utils.isObj(rec)) {
                    return process.nextTick(() => {

                        next(new TypeError('document is not an object'), null);
                    });
                }

                if (!Utils.isString(key)) {
                    return process.nextTick(() => {

                        next(new TypeError('key must be a string'), null);
                    });
                }

                if (~keys.indexOf(key)) {
                    return process.nextTick(() => {

                        next(new Error(`unique key violation, key "${key}" is already in use`), null);
                    });
                }

                return next(null, { type: 'put', key, value: rec });

            };

            Async.map(recs, iterator, (err, results) => {

                if (err) {
                    return cb(err, null);
                }

                this._db.batch(results, (err) => {

                    return cb(err, results);
                });
            });
        });

    }

    updateOne(query, modifier, cb) {

        const keyName = this._settings.key;
        if (!Utils.isFunction(cb)) {
            throw new TypeError('callback is not a function');
        }

        if (!Utils.isObj(query)) {
            return process.nextTick(() => {

                cb(new TypeError('query must be an object with index field as key and value the unique value'), null);
            });
        }

        if (!Utils.isObj(modifier)) {
            return process.nextTick(() => {

                cb(new TypeError('modifier must be an object'), null);
            });
        }

        const key = query[keyName];

        if (!Utils.isString(key)) {
            return process.nextTick(() => {

                cb(new TypeError('key must be a string'), null);
            });
        }

        this.findOne(query, (err, found) => {

            // $lab:coverage:off$
            if (err) {
                return cb(err, null);
            }
            // $lab:coverage:on$

            if (!found) {
                return cb(null, null);
            }

            const doc = Operators(found, modifier);

            this._db.put(key, doc, (err) => {

                return cb(err, doc);
            });

        });

    };

    count(cb) {

        return this.getKeys((err, keys) => {

            return cb(err, keys.length);
        });

    }

    getKeys(cb) {

        const keys = [];
        const cursor = this._db.createKeyStream();
        cursor.on('data', (key) => {

            keys.push(key);
        });

        cursor.on('error', (err) => {

            // $lab:coverage:off$
            return process.nextTick(() => {

                cb(err, null);
            });
            // $lab:coverage:on$
        });

        cursor.on('end', () => {

            return process.nextTick(() => {

                cb(null, keys);
            });
        });

    }

};
