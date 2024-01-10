import test from 'tape';
import path from 'path';
import fse from 'fs-extra';
import {Validator} from '../../src';
import {Proskomma} from 'proskomma';

const testGroup = 'Validator';

const pk = new Proskomma();

test(
    `schemaInfo (${testGroup})`,
    async function (t) {
        try {
            t.plan(7);
            const validatorInfo = new Validator().schemaInfo();
            t.ok('structure' in validatorInfo);
            t.ok('constraint' in validatorInfo);
            t.ok('perfSequence' in validatorInfo.constraint);
            t.ok('0.3.0' in validatorInfo.constraint.perfSequence);
            t.equal(validatorInfo.constraint.perfSequence['0.3.0'].length, 2);
            t.equal(validatorInfo.constraint.perfSequence['0.3.0'][0], 'Sequence Structure');
            t.equal(validatorInfo.constraint.perfSequence['0.3.0'][1], 'PERF Sequence');
         } catch (err) {
            console.log(err);
        }
    },
);

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
            t.doesNotThrow(() => validator.validate('structure', 'document', '0.3.0', {}));
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
                    path.join(__dirname, '..', 'test_data', 'validation', 'valid_flat_document.json')
                )
            )
            const validator = new Validator();
            const validation = validator.validate(
                'structure',
                'document',
                '0.3.0',
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
                    path.join(__dirname, '..', 'test_data', 'validation', 'valid_flat_sequence.json')
                )
            )
            const validator = new Validator();
            const validation = validator.validate(
                'structure',
                'sequence',
                '0.3.0',
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
                    path.join(__dirname, '..', 'test_data', 'validation', 'valid_flat_sequence.json')
                )
            )
            const validator = new Validator();
            const validation = validator.validate(
                'constraint',
                'perfSequence',
                '0.3.0',
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
    `validate PERF document (${testGroup})`,
    async function (t) {
        try {
            t.plan(2);
            const perf = fse.readJsonSync(
                path.resolve(
                    path.join(__dirname, '..', 'test_data', 'validation', 'valid_flat_document.json')
                )
            )
            const validator = new Validator();
            const validation = validator.validate(
                'constraint',
                'perfDocument',
                '0.3.0',
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
    `Stop on first error (${testGroup})`,
    async function (t) {
        try {
            t.plan(4);
            const validator = new Validator();
            let perf = fse.readJsonSync(
                path.resolve(
                    path.join(__dirname, '..', 'test_data', 'validation', 'structure_invalid_flat_sequence.json')
                )
            )
            let validation = validator.validate(
                'constraint',
                'perfSequence',
                '0.3.0',
                perf
            );
            t.notOk(validation.isValid);
            t.equal(validation.lastSchema, 'Sequence Structure');
            perf = fse.readJsonSync(
                path.resolve(
                    path.join(__dirname, '..', 'test_data', 'validation', 'perf_invalid_flat_sequence.json')
                )
            )
            validation = validator.validate(
                'constraint',
                'perfSequence',
                '0.3.0',
                perf
            );
            t.notOk(validation.isValid);
            t.equal(validation.lastSchema, 'PERF Sequence');
        } catch (err) {
            console.log(err);
        }
    },
);

test(
    `validate structure of SOFRIA document (${testGroup})`,
    async function (t) {
        try {
            t.plan(2);
            const sofria = fse.readJsonSync(
                path.resolve(
                    path.join(__dirname, '..', 'test_data', 'perfs', 'fra_lsg_mrk_sofria_doc.json')
                )
            )
            const validator = new Validator();
            const validation = validator.validate(
                'structure',
                'document',
                '0.3.0',
                sofria
            );
            t.ok(validation.isValid);
            t.equal(validation.errors, null);
        } catch (err) {
            console.log(err);
        }
    },
);

test(
    `validate constraints of SOFRIA document (${testGroup})`,
    async function (t) {
        try {
            t.plan(2);
            const sofria = fse.readJsonSync(
                path.resolve(
                    path.join(__dirname, '..', 'test_data', 'perfs', 'fra_lsg_mrk_sofria_doc.json')
                )
            )
            const validator = new Validator();
            const validation = validator.validate(
                'constraint',
                'sofriaDocument',
                '0.3.0',
                sofria
            );
            t.ok(validation.isValid);
            t.equal(validation.errors, null);
        } catch (err) {
            console.log(err);
        }
    },
);

test(
    `validate constraints of succinct JSON (${testGroup})`,
    async function (t) {
        try {
            t.plan(2);
            const usfm = fse.readFileSync(path.resolve(path.join(__dirname, '..', 'test_data', 'usfms', 'webbe_mrk.usfm'))).toString();
            const pk = new Proskomma();
            pk.importDocument({'lang': 'eng', 'abbr': 'web'}, 'usfm', usfm);
            const succinct = pk.serializeSuccinct('eng_web')
            const validator = new Validator();
            const validation = validator.validate(
                'proskomma',
                'succinct',
                '0.2.0',
                succinct
            );
            t.ok(validation.isValid);
            t.equal(validation.errors, null);
        } catch (err) {
            console.log(err);
        }
    },
);

test(
    `validate hooks (${testGroup})`,
    async function (t) {
        try {
            t.plan(2);
            const perf = fse.readJsonSync(path.resolve(path.join(__dirname, '..', 'test_data', 'validation', 'hook_perf.json')));
            const validator = new Validator();
            const validation = validator.validate(
                'structure',
                'document',
                '0.3.0',
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
    `fail on invalid hooks (${testGroup})`,
    async function (t) {
        try {
            const tests = [['three_hook_values_perf', '2 items'], ['odd_hook_values_perf', 'allowed values']]
            t.plan(2 * tests.length);
            for (const [test_file, test_error] of tests) {
                const perf = fse.readJsonSync(path.resolve(path.join(__dirname, '..', 'test_data', 'validation', `${test_file}.json`)));
                const validator = new Validator();
                const validation = validator.validate(
                    'structure',
                    'document',
                    '0.3.0',
                    perf
                );
                t.notOk(validation.isValid);
                t.ok(validation.errors[0].message.includes(test_error));
            }
        } catch (err) {
            console.log(err);
        }
    },
);

test(
    `validate non-para PERF block types (${testGroup})`,
    async function (t) {
        try {
            t.plan(2);
            const perf = fse.readJsonSync(
                path.resolve(
                    path.join(__dirname, '..', 'test_data', 'validation', 'all_block_types_perf.json')
                )
            )
            const validator = new Validator();
            const validation = validator.validate(
                'constraint',
                'perfDocument',
                '0.3.0',
                perf
            );
            t.ok(validation.isValid);
            t.equal(validation.errors, null);
        } catch (err) {
            console.log(err);
        }
    },
);
