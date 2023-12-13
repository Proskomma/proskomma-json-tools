const {PipelineHandler} = require('../../dist/index');
const test = require('tape');
const {Proskomma} = require('proskomma');
const fse = require('fs-extra');
const path = require('path');

const testGroup = 'Perf 2 usfmJs';

const pipelineH = new PipelineHandler({proskomma: new Proskomma(), verbose: false});

const perfContent = fse.readJsonSync(path.resolve(__dirname, '../test_data/perfs/titus_aligned_eng.json'));

test(`perf=>usfmJs (${testGroup})`, t => {
    t.plan(2);
    let output;
    try {
        t.doesNotThrow(async () => {
            output = pipelineH.runPipeline(
                'perfToUsfmJsPipeline', {
                    perf: perfContent
                }
            );
        });
        t.ok(output.usfmJs);
    } catch (err) {
        console.log(err);
        t.fail('perfToUsfmJsPipeline throws on valid perf');
    }
});
