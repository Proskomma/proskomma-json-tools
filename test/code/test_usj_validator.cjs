import test from "tape";
import fse from "fs-extra";
import path from "path";
import {Validator} from "../../src";

const testGroup = "USJ";
const validator = new Validator();

test(
    `validate USJ test examples (${testGroup})`,
    async function (t) {
        try {
            const goodExamples = fse.readdirSync(path.resolve(
                path.join(__dirname, '..', 'test_data', 'validation', 'usj', 'good')
            ));
            t.plan(2 * goodExamples.length);
            for (const file of goodExamples) {
                // console.log("***", file, "***");
                const usj = fse.readJsonSync(
                    path.resolve(
                        path.join(__dirname, '..', 'test_data', 'validation', 'usj', 'good', file)
                    )
                )
                const validation = validator.validate(
                    'usj',
                    'structure',
                    '0.2.4',
                    usj
                );
                t.ok(validation.isValid);
                t.equal(validation.errors, null);
            }
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
            const usj = fse.readJsonSync(
                path.resolve(
                    path.join(__dirname, '..', 'test_data', 'validation', 'usj', 'bad', 'extra_property.json')
                )
            )
            const validation = validator.validate(
                'usj',
                'structure',
                '0.2.4',
                usj
            );
            t.false(validation.isValid);
            t.ok(validation.errors.filter(e => e.params && e.params.additionalProperty === "banana").length === 1);
        } catch (err) {
            console.log(err);
        }
    },
);
