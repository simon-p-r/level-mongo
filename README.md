# level-mongo [![Build Status](https://travis-ci.org/simon-p-r/level-mongo.svg?branch=master)](https://travis-ci.org/simon-p-r/level-mongo)


A basic mongo query interface for leveldb backend, future version will try to allow more advanced querying and partial & full updates



# Install

 ```bash
 $ npm install level-mongo --save
 ```

# Usage

Valid options for constructor object exposed by module are shown below

`options`:

 * `collections` object with keys being name of collection (sublevel-level) to create
    * `key` unique identifier for each json record within collection
 * `location` string required to define base directory where leveldb is persisted on disk
 * `config` object with the following keys
   * `keyEncoding` string, valid options are one of 'hex', 'utf8', 'ascii', 'binary', 'base64', 'ucs2', 'utf16le'
   * `createIfMissing` boolean, default true.  Create db if missing
   * `errorIfExists` boolean, default false.  Error if db already exists
   * `compression` boolean, default true.  Set to true to use snappy compression end for leveldb files
   * `cacheSize` number, default 8 x 1024 x 1024.  LRU cache for leveldb


 ```js

'use strict';

const LevelMongo = require('level-mongo');

const db = new LevelMongo({
    config: {
        keyEncoding: 'ascii',
        compression: false,
        cacheSize: 4 * 1024 * 1024
    },
    collections: {
        users: {
            key: '_id'
        }
    },
    location: './db'
});

db.open((err) => {

    db.collections.users.findOne({ _id: 'abcd'}, (err, doc) => {

        console.log(err, doc);

        db.close((err) => {

            console.log(err);

        });
    });

});
```

Mongo methods partially implemented on each collection object

* findOne - find record by key

* find - return all records within collection

* insertOne - insert record, unique key must be embedded within object being inserted

* insertMany - batch insert operation

* deleteOne - find and delete one record by key

* deleteMany - deletes all records within collection

* count - return number of records in collection

* getKeys - returns all keys stored within collection

##### TODO

- improve supported queries
- make attempt to enable indexing - in memory only
- add schema option to define data shape
- updateOne and updateMany methods, plus any other possible methods