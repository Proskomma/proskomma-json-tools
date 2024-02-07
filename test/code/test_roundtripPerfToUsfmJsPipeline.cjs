const path = require('path');
const fse = require('fs-extra');
const test = require('tape');
const {Proskomma} = require('proskomma');
const {PipelineHandler} = require('../../dist/index');
const testGroup = 'Roundtrip Perf <=> UsfmJs';

const pipelineH = new PipelineHandler({
    proskomma: new Proskomma(),
    verbose: false
});

const perf = fse.readJsonSync(path.resolve(__dirname, '../test_data/validation/titus_aligned.json'));

test(`perf <=> usfmJs (${testGroup})`, t => {
    t.plan(10);
    let output;
    try {
        t.doesNotThrow(async () => {
            output = pipelineH.runPipeline(
                'perfToUsfmJsPipeline', {
                    perf: perf
                }
            );
        });
        t.ok(output.usfmJs);
        const usfmJs = output.usfmJs;
        output = {};
        t.doesNotThrow(async () => {
            output = pipelineH.runPipeline(
                'mergeUwAlignmentPipeline', {
                    perf: perf,
                    usfmJs: usfmJs
                }
            );
        });
        t.ok(output.occurrences);
        t.ok(output.perf);
        const mainContent = Object.values(output.perf.sequences)[0].blocks[1].content.slice(0,20);
        console.log(JSON.stringify(mainContent, null, 2));
        t.equal(mainContent[4].type, "start_milestone");
        t.equal(mainContent[4].atts["x-lemma"][0], "δοῦλος");
        t.equal(mainContent[5].subtype, "usfm:w");
        t.equal(mainContent[5].content[0], "serviteur");
        t.equal(mainContent[6].type, "end_milestone");
    } catch (err) {
        console.log(err);
        t.fail('perfToUsfmJsPipeline throws on valid perf');
    }
});
