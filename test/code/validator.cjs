const test = require('tape');
const path = require('path');
const fse = require('fs-extra');
const {Validator} = require('../../src/index.js');

const testGroup = 'Validator';

test(
    `Fail on bad args (${testGroup})`,
    async function (t) {
        try {
            t.plan(5);
            const validator = new Validator();
            t.throws(() => validator.validate('foo'), /Usage/);
            t.throws(() => validator.validate('banana', 'foo', 'baa', {}), /Schema type/);
            t.throws(() => validator.validate('structure', 'foo', 'baa', {}), /structure schema key/);
            t.throws(() => validator.validate('structure', 'document', 'baa', {}), /Unknown version/);
            t.doesNotThrow(() => validator.validate('structure', 'document', '0.1.0', {}));
        } catch (err) {
            console.log(err);
        }
    },
);

test(
    `validate flat document structure (${testGroup})`,
    async function (t) {
        try {
            t.plan(2);
            const perf = fse.readJsonSync(
                path.resolve(
                    path.join(__dirname, '..', 'test_data', 'validation', 'flat_document.json')
                )
            )
            const validator = new Validator();
            const validation = validator.validate(
                'structure',
                'document',
                '0.1.0',
                perf
            );
            t.ok(validation.isValid);
            t.equal(validation.errors, null);
        } catch (err) {
            console.log(err);
        }
    },
);

test(
    `validate flat sequence structure (${testGroup})`,
    async function (t) {
        try {
            t.plan(2);
            const perf = fse.readJsonSync(
                path.resolve(
                    path.join(__dirname, '..', 'test_data', 'validation', 'flat_sequence.json')
                )
            )
            const validator = new Validator();
            const validation = validator.validate(
                'structure',
                'sequence',
                '0.1.0',
                perf
            );
            t.ok(validation.isValid);
            t.equal(validation.errors, null);
        } catch (err) {
            console.log(err);
        }
    },
);

test(
    `validate PERF sequence (${testGroup})`,
    async function (t) {
        try {
            t.plan(2);
            const perf = fse.readJsonSync(
                path.resolve(
                    path.join(__dirname, '..', 'test_data', 'validation', 'flat_sequence.json')
                )
            )
            const validator = new Validator();
            const validation = validator.validate(
                'constraint',
                'perfSequence',
                '0.1.0',
                perf
            );
            t.ok(validation.isValid);
            t.equal(validation.errors, null);
        } catch (err) {
            console.log(err);
        }
    },
);
