'use strict';

const Async = require('neo-async');
const Hoek = require('hoek');

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
            return cb(err, null);
        // $lab:coverage:on$
        });

        cursor.on('end', () => {

            return cb(null, records);
        });

    };

    findOne(query, cb) {

        const keyName = this._settings.key;

        if (typeof cb !== 'function') {
            throw new TypeError('Callback is not a function');
        }

        if (typeof query !== 'object') {
            return cb(new TypeError('Query must be an object with index field as key and value the unique value'), null);
        }

        const key = query[keyName];
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
            throw new TypeError('Callback is not a function');
        }

        if (typeof query !== 'object') {
            return cb(new TypeError('Query must be an object with index field as key and value the unique value'), null);
        }

        const key = query[keyName];
        this._db.get(key, (err, doc) => {

            if (err) {
                return cb(err, null);
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

                return { type: 'del', key: key };
            });

            return this._db.batch(batch, (err, results) => {

                return cb(err, { deleted: keys });
            });
        });


    };

    insertOne(doc, cb) {

        const keyName = this._settings.key;
        const key = doc[keyName];
        this.getKeys((err, keys) => {

            // $lab:coverage:off$
            if (err) {
                return cb(err, null);
            }
            // $lab:coverage:on$

            if (~keys.indexOf(key)) {
                return cb(new Error(`Unique key violation, key "${key}" is already in use`), null);
            }

            this._db.put(key, doc, (err) => {

                return cb(err, doc);
            });

        });

    };

    insertMany(recs, cb) {

        const keyName = this._settings.key;

        this.getKeys((err, keys) => {

            // $lab:coverage:off$
            if (err) {
                return cb(err, null);
            }
            // $lab:coverage:on$

            const iterator = (rec, next) => {

                const key = rec[keyName];

                if (~keys.indexOf(key)) {
                    return next(new Error(`Unique key violation, key "${key}" is already in use`), null);
                }

                return next(null, { type: 'put', key: key, value: rec });

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
        if (typeof cb !== 'function') {
            throw new TypeError('Callback is not a function');
        }

        if (typeof query !== 'object') {
            return cb(new TypeError('Query must be an object with index field as key and value the unique value'), null);
        }

        if (typeof modifier !== 'object') {
            return cb(new TypeError('Modifier must be an object'), null);
        }

        const key = query[keyName];

        this.findOne(query, (err, found) => {

            // $lab:coverage:off$
            if (err) {
                return cb(err, null);
            }
            // $lab:coverage:on$

            const doc = Hoek.applyToDefaults(found, modifier);

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
            return cb(err, null);
            // $lab:coverage:on$
        });

        cursor.on('end', () => {

            return cb(null, keys);
        });

    }

};
