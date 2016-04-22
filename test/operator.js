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

        expect(Operators(original, operator)).to.deep.equal({ hello: 'goodbye', world: 'hello' });
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

        expect(Operators(original, operator)).to.deep.equal({ key: 'value' });
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

        expect(Operators(original, operator)).to.deep.equal(original);
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
        expect(Operators(original,operator)).to.deep.equal(original);
        done();

    });

});
