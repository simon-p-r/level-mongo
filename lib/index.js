'use strict';

const Collection = require('./collection');
const Joi = require('joi');
const Level = require('level');
const Sublevel = require('level-sublevel');

const internals = {};

internals.defaults = {

    config: {
        keyEncoding: 'utf8',
        valueEncoding: 'json'
    }
};

internals.alphaKeys = new RegExp('^[a-zA-Z]*$');

internals.collections = Joi.object().keys({

    key: Joi.string().required()

}).required();

internals.schema = {

    config: Joi.object().keys({
        keyEncoding: Joi.string().valid(['hex', 'utf8', 'ascii', 'binary', 'base64', 'ucs2', 'utf16le']),
        valueEncoding: Joi.string().valid('json').default('json'),
        createIfMissing: Joi.boolean().default(true),
        errorIfExists: Joi.boolean().default(false),
        compression: Joi.boolean().default(true),
        cacheSize: Joi.number().default(8 * 1024 * 1024)

    }),
    location: Joi.string().required(),
    collections: Joi.object().keys({

    }).pattern(internals.alphaKeys, internals.collections).min(1).required()

};

module.exports = class Db {

    constructor(options) {

        this.collections = {};
        this._settings = Joi.attempt(Hoek.applyToDefaults(internals.defaults, options), internals.schema);

    }

    open(cb) {

        const collections = this._settings.collections;
        const collectionNames = Object.keys(collections);
        const options = this._settings.config;
        const location = this._settings.location;

        return Level(location, options, (err, _db) => {

            // $lab:coverage:off$
            if (err) {
                return cb(err);
            }
            // $lab:coverage:on$

            this._db = _db;
            const db = Sublevel(_db);

            for (let i = 0; i < collectionNames.length; ++i) {

                const name = collectionNames[i];
                const collectionOptions = collections[name];
                this.collections[name] = new Collection(db.sublevel(name), collectionOptions);
            }

            return cb(null);

        });

    }

    close(cb) {

        // $lab:coverage:off$
        if (!this._db) {
            return cb();
        }
        // $lab:coverage:on$

        this._db.close((err) => {

            this._db.removeAllListeners();
            this._db = null;
            this.collections = null;
            return cb(err);
        });

    }

};
