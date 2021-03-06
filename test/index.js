'use strict';

const Code = require('code');
const DB = require('../lib/index.js');
const Fs = require('fs');
const Lab = require('lab');
const Path = require('path');


// Fixtures
const methods = ['find', 'findOne', 'deleteOne', 'deleteMany', 'insertOne', 'insertMany', 'count'];
const Recs = require('./fixtures/recs');

// Set-up lab
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const afterEach = lab.afterEach;
const expect = Code.expect;

const rimraf = (dir_path) => {

    if (Fs.existsSync(dir_path)) {
        Fs.readdirSync(dir_path).forEach((entry) => {

            const entry_path = Path.join(dir_path, entry);
            if (Fs.lstatSync(entry_path).isDirectory()) {
                rimraf(entry_path);
            }
            else {
                Fs.unlinkSync(entry_path);
            }
        });
        Fs.rmdirSync(dir_path);
    }
};

const rmDir = (path, cb) => {

    try {
        rimraf('./test/fixtures/level');
    }
    catch (e) {
        return cb(e);
    }

    return cb();
};


describe('level-mongo', () => {

    afterEach(() => {

        return new Promise((resolve, reject) => {

            /* eslint-disable */
            rmDir('./test/fixtures/level', (err) => {

                if (err) {
                    reject(err);
                }
                resolve();
            });
            /* eslint-enable */
        });
    });


    const options = {
        location: './test/fixtures/level',
        collections: {
            users: {
                key: '_id'
            },
            products: {
                key: '_id'
            }
        },
        config: {
            valueEncoding: 'json'
        }
    };

    it('should assert incoming options to constructor function', () => {

        const noLocation = {
            collections: {}
        };

        expect(() => {

            return new DB(noLocation);
        }).to.throw(Error);
    });

    it('should open db with no errors', () => {

        const db = new DB(options);

        return new Promise((resolve) => {

            db.open((err) => {

                expect(err).to.not.exist();
                expect(db._db.isOpen()).to.be.true();
                expect(db.collections.users).to.be.an.object();
                expect(db.collections.products).to.be.an.object();

                methods.forEach((method) => {

                    expect(db.collections.users[method]).to.be.a.function();
                    expect(db.collections.products[method]).to.be.a.function();
                });
                db.close((err) => {

                    expect(err).to.not.exist();
                    expect(db._db).to.be.not.exist();
                    expect(db.collections).to.be.not.exist();
                    resolve();
                });
            });
        });

    });

    it('should throw or return errors for invalid parameters to findOne method', () => {

        const db = new DB(options);

        return new Promise((resolve) => {

            db.open((err) => {

                expect(err).to.not.exist();

                const func = () => {

                    db.collections.users.findOne({ _id: 'a' });
                };

                expect(func).throw(TypeError);


                db.collections.users.findOne('string', (err, doc) => {

                    expect(err).to.exist();

                    db.collections.users.findOne({ invalid: 'key' }, (err, invalid) => {

                        expect(err).to.exist();
                        db.close((err) => {

                            expect(err).to.not.exist();
                            expect(db._db).to.be.not.exist();
                            expect(db.collections).to.be.not.exist();
                            resolve();
                        });
                    });
                });
            });
        });
    });

    it('should have a findOne method', () => {

        const db = new DB(options);

        return new Promise((resolve) => {

            db.open((err) => {

                expect(err).to.not.exist();

                db.collections.users.insertMany(Recs, (err, results) => {

                    expect(err).to.not.exist();
                    expect(results).to.be.an.array();

                    db.collections.users.findOne({ _id: 'a' }, (err, doc) => {

                        expect(err).to.not.exist();
                        expect(doc.test).to.equal(1);

                        db.collections.users.findOne({ _id: 'invalid' }, (err, invalid) => {

                            expect(err).to.not.exist();
                            expect(invalid).to.equal(null);
                            db.close((err) => {

                                expect(err).to.not.exist();
                                expect(db._db).to.be.not.exist();
                                expect(db.collections).to.be.not.exist();
                                resolve();
                            });
                        });
                    });
                });
            });
        });
    });


    it('should have a find method',  () => {

        const db = new DB(options);

        return new Promise((resolve) => {

            db.open((err) => {

                expect(err).to.not.exist();

                db.collections.users.insertMany(Recs, (err, results) => {

                    expect(err).to.not.exist();
                    expect(results).to.be.an.array();

                    db.collections.users.find((err, docs) => {

                        expect(err).to.not.exist();
                        expect(docs).to.be.an.array().and.have.length(3);
                        db.close((err) => {

                            expect(err).to.not.exist();
                            expect(db._db).to.be.not.exist();
                            expect(db.collections).to.be.not.exist();
                            resolve();
                        });
                    });
                });
            });
        });
    });


    it('should have a insertOne method', () => {

        const db = new DB(options);

        return new Promise((resolve) => {

            db.open((err) => {

                expect(err).to.not.exist();

                db.collections.users.insertOne({ _id: 'key', test: 'value' }, (err, result) => {

                    expect(err).to.not.exist();
                    expect(result).to.be.an.object();
                    expect(result.test).to.equal('value');

                    db.collections.users.findOne({ _id: 'key' }, (err, doc) => {

                        expect(err).to.not.exist();
                        expect(doc.test).to.equal('value');

                        db.collections.users.insertOne({ _id: 'key', test: 'value' }, (err, inserted) => {

                            expect(err).to.exist();
                            expect(inserted).to.not.exist();
                            db.close((err) => {

                                expect(err).to.not.exist();
                                expect(db._db).to.be.not.exist();
                                expect(db.collections).to.be.not.exist();
                                resolve();
                            });
                        });
                    });
                });
            });
        });
    });


    it('should check parameters to insertOne method are valid', () => {

        const db = new DB(options);

        return new Promise((resolve) => {

            db.open((err) => {

                expect(err).to.not.exist();

                db.collections.users.insertOne(null, (err, result) => {

                    expect(err).to.exist();

                    const func = () => {

                        db.collections.users.insertOne({ _id: 'key' });
                    };

                    expect(func).throws(TypeError);

                    db.collections.users.insertOne({ invalid: 'key' }, (err, doc) => {

                        expect(err).to.exist();
                        db.close((err) => {

                            expect(err).to.not.exist();
                            expect(db._db).to.be.not.exist();
                            expect(db.collections).to.be.not.exist();
                            resolve();
                        });
                    });
                });
            });
        });
    });

    it('should have a insertMany method', () => {

        const db = new DB(options);

        return new Promise((resolve) => {

            db.open((err) => {

                expect(err).to.not.exist();

                db.collections.users.insertOne({ _id: 'a', test: 'value' }, (err, result) => {

                    expect(err).to.not.exist();
                    expect(result).to.be.an.object();
                    expect(result.test).to.equal('value');

                    db.collections.users.insertMany(Recs, (err, doc) => {

                        expect(err).to.exist();
                        expect(doc).to.not.exist();
                        db.close((err) => {

                            expect(err).to.not.exist();
                            expect(db._db).to.be.not.exist();
                            expect(db.collections).to.be.not.exist();
                            resolve();
                        });
                    });
                });
            });
        });
    });


    it('should check parameters to insertMany method', () => {

        const db = new DB(options);

        return new Promise((resolve) => {

            db.open((err) => {

                expect(err).to.not.exist();

                db.collections.users.insertMany(null, (err, result) => {

                    expect(err).to.exist();

                    const func = () => {

                        db.collections.users.insertMany([{ _id: 'key' }]);
                    };

                    expect(func).throws(TypeError);

                    db.collections.users.insertMany([{ invalid: 'key' }], (err, doc) => {

                        expect(err).to.exist();

                        db.collections.users.insertMany([{ _id: 'key' }, 'key'], (err, invalid) => {

                            expect(err).to.exist();
                            db.close((err) => {

                                expect(err).to.not.exist();
                                expect(db._db).to.be.not.exist();
                                expect(db.collections).to.be.not.exist();
                                resolve();
                            });
                        });
                    });
                });
            });
        });
    });

    it('should have a deleteMany method', () => {

        const db = new DB(options);

        return new Promise((resolve) => {

            db.open((err) => {

                expect(err).to.not.exist();

                db.collections.users.deleteMany((err, results) => {

                    expect(err).to.not.exist();
                    expect(results.deleted).to.equal(0);

                    db.collections.users.insertMany(Recs, (err, inserted) => {

                        expect(err).to.not.exist();

                        db.collections.users.deleteMany((err, deleted) => {

                            expect(err).to.not.exist();
                            expect(results).to.be.an.object();
                            expect(deleted.deleted).to.equal(['a', 'b', 'c']);
                            db.close((err) => {

                                expect(err).to.not.exist();
                                expect(db._db).to.be.not.exist();
                                expect(db.collections).to.be.not.exist();
                                resolve();
                            });
                        });
                    });
                });
            });
        });
    });

    it('should have a deleteOne method', () => {

        const db = new DB(options);

        return new Promise((resolve) => {

            db.open((err) => {

                expect(err).to.not.exist();

                db.collections.users.insertOne({ _id: 'test', hello: 'world' }, (err, doc) => {

                    expect(err).to.not.exist();
                    expect(doc.hello).to.equal('world');

                    db.collections.users.deleteOne({ _id: 'test' }, (err, results) => {

                        expect(err).to.not.exist();
                        expect(results.deleted).to.equal('test');
                        db.close((err) => {

                            expect(err).to.not.exist();
                            expect(db._db).to.be.not.exist();
                            expect(db.collections).to.be.not.exist();
                            resolve();
                        });
                    });
                });
            });
        });
    });


    it('should throw or return errors for invalid parameters to deleteOne method', () => {

        const db = new DB(options);

        return new Promise((resolve) => {

            db.open((err) => {

                expect(err).to.not.exist();

                const func = () => {

                    db.collections.users.deleteOne({ _id: 'a' });
                };

                expect(func).throw(TypeError);


                db.collections.users.deleteOne('string', (err, doc) => {

                    expect(err).to.exist();

                    db.collections.users.deleteOne({ _id: 'invalid' }, (err, deleted) => {

                        expect(err).to.not.exist();
                        expect(deleted).to.equal(null);
                        db.close((err) => {

                            expect(err).to.not.exist();
                            expect(db._db).to.be.not.exist();
                            expect(db.collections).to.be.not.exist();
                            resolve();
                        });
                    });
                });
            });
        });
    });


    it('should have a updateOne method', () => {

        const db = new DB(options);

        return new Promise((resolve) => {

            db.open((err) => {

                expect(err).to.not.exist();

                const func = () => {

                    db.collections.users.updateOne({ _id: 'a' });
                };

                expect(func).throw(TypeError);

                db.collections.users.insertMany(Recs, (err, inserted) => {

                    expect(err).to.not.exist();

                    db.collections.users.updateOne({ _id: 'a' }, { $set: { update: 1 } }, (err, updated) => {

                        expect(err).to.not.exist();
                        expect(updated.update).to.equal(1);
                        expect(updated.test).to.equal(1);

                        db.collections.users.updateOne('a', { $set: { update: 1 } }, (err, fail) => {

                            expect(err).to.exist();
                            db.collections.users.updateOne({ _id: 'invalid' }, { $set: { update: 1 } }, (err, nil) => {

                                expect(err).to.not.exist();
                                expect(nil).to.equal(null);

                                db.collections.users.updateOne({ _id: 'invalid' }, 1, (err, invalid) => {

                                    expect(err).to.exist();
                                    expect(invalid).to.equal(null);

                                    db.collections.users.updateOne({ invalid: 'keys' }, { $set: { update: 1 } }, (err, keyErr) => {

                                        expect(err).to.exist();
                                        expect(keyErr).to.equal(null);
                                        db.close((err) => {

                                            expect(err).to.not.exist();
                                            expect(db._db).to.be.not.exist();
                                            expect(db.collections).to.be.not.exist();
                                            resolve();
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });


    it('should have a count method', () => {

        const db = new DB(options);

        return new Promise((resolve) => {

            db.open((err) => {

                expect(err).to.not.exist();

                db.collections.users.insertMany(Recs, (err, inserted) => {

                    expect(err).to.not.exist();

                    db.collections.users.count((err, recs) => {

                        expect(err).to.not.exist();
                        expect(recs).to.equal(3);
                        db.close((err) => {

                            expect(err).to.not.exist();
                            expect(db._db).to.be.not.exist();
                            expect(db.collections).to.be.not.exist();
                            resolve();
                        });
                    });
                });
            });
        });
    });

});
