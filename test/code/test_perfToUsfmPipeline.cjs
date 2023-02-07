const { PipelineHandler } = require('../../src');
const test = require('tape');
const { Proskomma } = require('proskomma');
const fse = require('fs-extra');
const path = require('path');

const testGroup = 'Perf 2 usfm';

const pipelineH = new PipelineHandler({proskomma:new Proskomma(), verbose:false});

const perfContent = fse.readJsonSync(path.resolve(__dirname, '../test_data/perfs/titus_aligned_eng.json'));

test(`perf=>usfm (${testGroup})`, (t) => {
    t.plan(1);
    try {
        t.doesNotThrow(async () => {
            let output = await pipelineH.runPipeline('perfToUsfmPipeline', {
                perf: perfContent
            });
            // await saveFile(output.usfm);
        })
    } catch (err) {
        console.log(err);
        t.fail('perfToUsfmPipeline throws on valid perf');
    }
});
