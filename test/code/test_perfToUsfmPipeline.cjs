const { PipelineHandler } = require('../../dist/index');
const test = require('tape');
const { Proskomma } = require('proskomma-core');
const fse = require('fs-extra');
const path = require('path');

const testGroup = 'Perf 2 usfm';

const pipelineH = new PipelineHandler({proskomma:new Proskomma(), verbose:false});

const perfContent = fse.readJsonSync(path.resolve(__dirname, '../test_data/perfs/titus_aligned_eng.json'));

test(`perf=>usfm (${testGroup})`, t => {
    t.plan(1);
    try {
        t.doesNotThrow(async () => {
            let output = pipelineH.runPipeline('perfToUsfmPipeline', {
                perf: perfContent
            });
        })
    } catch (err) {
        console.log(err);
        t.fail('perfToUsfmPipeline throws on valid perf');
    }
});
