const path = require('path');
const fse = require('fs-extra');
const test = require('tape');
const {Proskomma} = require('proskomma');
const {PipelineHandler} = require('../../dist/index');
const testGroup = 'UsfmJs to Perf';

const pipelineH = new PipelineHandler({
    proskomma: new Proskomma(),
    verbose: false
});

const perfContent = fse.readJsonSync(path.resolve(__dirname, '../test_data/validation/titus_aligned.json'));
test(`Strip uW alignment markup (${testGroup})`, t => {
    t.plan(5);
    let output;
    try {
        t.doesNotThrow(async () => {
            output = pipelineH.runPipeline(
                'stripUwAlignmentPipeline', {
                    perf: perfContent
                }
            );
        });
        t.ok(output.perf);
        const nested = Object.values(output.perf.sequences)[0].blocks[1].content[2];
        t.equal(nested.subtype, "usfm:bd");
        t.equal(nested.content.length, 1);
        t.equal(nested.content[0], "Paul");
    } catch (err) {
        console.log(err);
        t.fail('stripUwAlignmentPipeline throws on valid perf');
    }
});
