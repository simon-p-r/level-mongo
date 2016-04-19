'use strict';

const Code = require('code');
const DB = require('../lib/index.js');
const Lab = require('lab');
const RmDir = require('rimraf');


// Fixtures
const methods = ['find', 'findOne', 'deleteOne', 'deleteMany', 'insertOne', 'insertMany', 'count'];
const Recs = require('./fixtures/recs');

// Set-up lab
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const afterEach = lab.afterEach;
const expect = Code.expect;


describe('level-mongo', () => {

    afterEach((done) => {

        RmDir('./test/fixtures/level', (err) => {

            expect(err).to.not.exist();
            done();
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

    it('should assert incoming options to constructor function', (done) => {

        const noLocation = {
            collections: {}
        };

        expect(() => {

            return new DB(noLocation);
        }).to.throw(Error);

        done();
    });

    it('should open db with no errors', (done) => {

        const db = new DB(options);

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
                expect(db._settings).to.not.exist();
                done();
            });
        });
    });

    it('should throw or return errors for invalid parameters to findOne method', (done) => {

        const db = new DB(options);

        db.open((err) => {

            expect(err).to.not.exist();

            const func = () => {

                db.collections.users.findOne({ _id: 'a' });
            };

            expect(func).throw(TypeError);


            db.collections.users.findOne('string', (err, doc) => {

                expect(err).to.exist();
                db.close(done);

            });

        });
    });

    it('should have a findOne method', (done) => {

        const db = new DB(options);

        db.open((err) => {

            expect(err).to.not.exist();

            db.collections.users.insertMany(Recs, (err, results) => {

                expect(err).to.not.exist();
                expect(results).to.be.an.array();

                db.collections.users.findOne({ _id: 'a' }, (err, doc) => {

                    expect(err).to.not.exist();
                    expect(doc.test).to.equal(1);

                    db.collections.users.findOne({ _id: 'invalid' }, (err, invalid) => {

                        expect(err).to.exist();
                        expect(invalid).to.equal(null);
                        db.close(done);

                    });

                });

            });

        });
    });

    it('should have a find method', (done) => {

        const db = new DB(options);

        db.open((err) => {

            expect(err).to.not.exist();

            db.collections.users.insertMany(Recs, (err, results) => {

                expect(err).to.not.exist();
                expect(results).to.be.an.array();

                db.collections.users.find((err, docs) => {

                    expect(err).to.not.exist();
                    expect(docs).to.be.an.array().and.have.length(3);
                    db.close(done);

                });

            });

        });
    });

    it('should have a insertOne method', (done) => {

        const db = new DB(options);

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
                        db.close(done);
                    });
                });
            });
        });
    });

    it('should have a insertMany method', (done) => {

        const db = new DB(options);

        db.open((err) => {

            expect(err).to.not.exist();

            db.collections.users.insertOne({ _id: 'a', test: 'value' }, (err, result) => {

                expect(err).to.not.exist();
                expect(result).to.be.an.object();
                expect(result.test).to.equal('value');

                db.collections.users.insertMany(Recs, (err, doc) => {

                    expect(err).to.exist();
                    expect(doc).to.not.exist();
                    db.close(done);

                });
            });
        });
    });

    it('should have a deleteMany method', (done) => {

        const db = new DB(options);

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
                        expect(deleted.deleted).to.deep.equal(['a', 'b', 'c']);
                        db.close(done);

                    });
                });
            });
        });
    });

    it('should have a deleteOne method', (done) => {

        const db = new DB(options);

        db.open((err) => {

            expect(err).to.not.exist();

            db.collections.users.insertOne({ _id: 'test', hello: 'world' }, (err, doc) => {

                expect(err).to.not.exist();
                expect(doc.hello).to.equal('world');

                db.collections.users.deleteOne({ _id: 'test' }, (err, results) => {

                    expect(err).to.not.exist();
                    expect(results.deleted).to.equal('test');
                    db.close(done);

                });
            });
        });
    });

    it('should throw or return errors for invalid parameters to deleteOne method', (done) => {

        const db = new DB(options);

        db.open((err) => {

            expect(err).to.not.exist();

            const func = () => {

                db.collections.users.deleteOne({ _id: 'a' });
            };

            expect(func).throw(TypeError);


            db.collections.users.deleteOne('string', (err, doc) => {

                expect(err).to.exist();

                db.collections.users.deleteOne({ _id: 'invalid' }, (err, deleted) => {

                    expect(err).to.exist();
                    expect(err.message).to.contain('Key not found in database');
                    db.close(done);
                });

            });

        });
    });

    it('should have a updateOne method', (done) => {

        const db = new DB(options);

        db.open((err) => {

            expect(err).to.not.exist();

            const func = () => {

                db.collections.users.updateOne({ _id: 'a' });
            };

            expect(func).throw(TypeError);

            db.collections.users.insertMany(Recs, (err, inserted) => {

                expect(err).to.not.exist();

                db.collections.users.updateOne({ _id: 'a' }, { update: 1 }, (err, updated) => {

                    expect(err).to.not.exist();
                    expect(updated.update).to.equal(1);
                    expect(updated.test).to.equal(1);

                    db.collections.users.updateOne('a', { update: 1 }, (err, fail) => {

                        expect(err).to.exist();
                        db.collections.users.updateOne({ _id: 'a' }, 1, (err, invalid) => {

                            expect(err).to.exist();
                            db.close(done);
                        });
                    });
                });


            });
        });
    });

    it('should have a count method', (done) => {

        const db = new DB(options);

        db.open((err) => {

            expect(err).to.not.exist();

            db.collections.users.insertMany(Recs, (err, inserted) => {

                expect(err).to.not.exist();

                db.collections.users.count((err, recs) => {

                    expect(err).to.not.exist();
                    expect(recs).to.equal(3);
                    db.close(done);
                });


            });
        });
    });

});
