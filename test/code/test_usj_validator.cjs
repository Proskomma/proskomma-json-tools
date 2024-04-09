import test from "tape";
import fse from "fs-extra";
import path from "path";
import {Validator} from "../../src";

const testGroup = "USJ";
const validator = new Validator();

test(
    `validate Minimal USJ (${testGroup})`,
    async function (t) {
        try {
            t.plan(2);
            const sofria = fse.readJsonSync(
                path.resolve(
                    path.join(__dirname, '..', 'test_data', 'validation', 'usj', 'minimal.json')
                )
            )
            const validation = validator.validate(
                'usj',
                'structure',
                '0.2.4',
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
    `Fail on extra property (${testGroup})`,
    async function (t) {
        try {
            t.plan(2);
            const sofria = fse.readJsonSync(
                path.resolve(
                    path.join(__dirname, '..', 'test_data', 'validation', 'usj', 'extra_property.json')
                )
            )
            const validation = validator.validate(
                'usj',
                'structure',
                '0.2.4',
                sofria
            );
            t.false(validation.isValid);
            t.ok(validation.errors.filter(e => e.params && e.params.additionalProperty === "banana").length === 1);
        } catch (err) {
            console.log(err);
        }
    },
);

test(
    `Fail on bad sid (${testGroup})`,
    async function (t) {
        try {
            t.plan(2);
            const sofria = fse.readJsonSync(
                path.resolve(
                    path.join(__dirname, '..', 'test_data', 'validation', 'usj', 'bad_sid.json')
                )
            )
            const validation = validator.validate(
                'usj',
                'structure',
                '0.2.4',
                sofria
            );
            t.false(validation.isValid);
            t.ok(validation.errors.filter(e => e.schemaPath === "#/properties/sid/pattern").length === 1);
        } catch (err) {
            console.log(err);
        }
    },
);
