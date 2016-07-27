'use strict';

const Code = require('code');
const Operators = require('../lib/operator.js');
const Lab = require('lab');

// Fixtures


// Set-up lab
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const expect = Code.expect;


describe('operator', () => {

    it('should test basic functionality of $set with simple objects', (done) => {

        const original = {
            hello: 'world'
        };

        const operator = {
            $set: {
                hello: 'goodbye',
                world: 'hello'
            }
        };

        const results = Operators(original, operator);
        expect(results).to.equal({ hello: 'goodbye', world: 'hello' });
        done();

    });

    it('should test basic functionality of $unset with simple objects', (done) => {

        const original = {
            hello: 'world',
            key: 'value',
            nested: {
                key: 'value'
            }
        };

        const operator = {
            $unset: {
                hello: 1,
                nested: 1
            }
        };

        const results = Operators(original, operator);
        expect(results).to.equal({ key: 'value' });
        done();

    });

    it('should ignore invalid operator object and not modify original', (done) => {

        const original = {
            hello: 'world',
            key: 'value'
        };

        const operator = {
            hello: 1
        };

        const results = Operators(original, operator);
        expect(results).to.equal(original);
        done();

    });

    it('should ignore undefined fields when modifying', (done) => {

        const original = {
            hello: 'world',
            key: 'value'
        };

        const operator = {
            $set: {
                hello: undefined
            },
            $unset: {
                key: undefined
            }
        };

        const results = Operators(original, operator);
        expect(results).to.equal(original);
        done();

    });

});
