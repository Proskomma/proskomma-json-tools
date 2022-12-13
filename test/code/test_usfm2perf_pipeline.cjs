const { PipelineHandler, Validator } = require('../../dist/index');
const test = require('tape');
const { Proskomma } = require('proskomma');
const fse = require('fs-extra');
const path = require('path');

const testGroup = 'Usfm 2 perf';

const pipelineH = new PipelineHandler({proskomma:new Proskomma(), verbose:false});

const validator = new Validator();

const usfmContent = fse.readFileSync(path.resolve(__dirname, '../test_data/usfms/titus.usfm')).toString();

const usfmContent2 = fse.readFileSync(path.resolve(__dirname, '../test_data/usfms/ult_tit_misplaced_ts.usfm')).toString();

test(`usfm=>perf : validate the output perf (${testGroup})`, async (t) => {
    t.plan(1);
    try {
        let output = await pipelineH.runPipeline('usfm2perfPipeline', {
            usfm: usfmContent,
            selectors: {'lang': 'fra', 'abbr': 'ust'}
        });

        const validatorResult = validator.validate('constraint','perfDocument','0.2.1', output.perf);
        if (!validatorResult.isValid) {
            t.fail('usfm=>perf throws on valid usfm');
            throw `usfm=>perf, PERF file is not valid. \n${JSON.stringify(validatorResult,null,2)}`;
        } else {
            t.ok(validatorResult.isValid);
        }

        // await saveFile(JSON.stringify(output.perf, null, 2));
    } catch (err) {
        console.log(err);
        t.fail('usfm2perfPipeline throws on valid perf');
    }
});

test(`usfm has premature ts milestone (${testGroup})`, async (t) => {
    t.plan(1);
    try {
        let output = await pipelineH.runPipeline('usfm2perfPipeline', {
            usfm: usfmContent2,
            selectors: {'lang': 'fra', 'abbr': 'ult'}
        });

        // console.log(JSON.stringify(output.perf.sequences, null, 2));

        const validatorResult = validator.validate('constraint','perfDocument','0.2.1', output.perf);
        if (!validatorResult.isValid) {
            t.fail('usfm=>perf throws on valid usfm');
            throw `usfm=>perf, PERF file is not valid. \n${JSON.stringify(validatorResult,null,2)}`;
        } else {
            t.ok(validatorResult.isValid);
        }

        // await saveFile(JSON.stringify(output.perf, null, 2));
    } catch (err) {
        console.log(err);
        t.fail('usfm2perfPipeline throws on valid perf');
    }
});
