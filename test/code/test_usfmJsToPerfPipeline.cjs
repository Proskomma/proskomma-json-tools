const path = require('path');
const fse = require('fs-extra');
const test = require('tape');
const {Proskomma} = require('proskomma');
const {PipelineHandler, usfmJsHelps} = require('../../dist/index');

const testGroup = 'UsfmJs to Perf';

const pipelineH = new PipelineHandler({
    proskomma: new Proskomma(),
    verbose: false
});

const perfContent = fse.readJsonSync(path.resolve(__dirname, '../test_data/validation/titus_aligned.json'));
const usfmJs = fse.readJsonSync(path.resolve(__dirname, '../test_data/usfmJs/titus_aligned.json'));

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

test(`Make alignment lookup from UsfmJs (${testGroup})`, t => {
    t.plan(6);
    try {
        const alignments = usfmJsHelps.alignmentLookupFromUsfmJs(usfmJs);
        t.ok(alignments);
        const verseAlignments = alignments["1"]["1"];
        t.ok("qui_1" in verseAlignments.before);
        t.equal(verseAlignments.before["qui_1"].length, 3);
        t.ok("piété_1" in verseAlignments.after);
        t.equal(verseAlignments.after["piété_1"].length, 3);
        t.equal(verseAlignments.before["qui_1"][0].content, verseAlignments.after["piété_1"][2].content);
        // console.log(alignments["1"]["1"].before);
    } catch (err) {
        console.log(err);
    }
});

test(`Strip and merge pipeline (${testGroup})`, t => {
    t.plan(8);
    let output;
    try {
        const usfmJs = fse.readJsonSync(path.resolve(__dirname, '../test_data/usfmJs/titus_aligned.json'));
        t.doesNotThrow(async () => {
            output = pipelineH.runPipeline(
                'mergeUwAlignmentPipeline', {
                    perf: perfContent,
                    usfmJs: usfmJs
                }
            );
        });
        t.ok(output.occurrences);
        t.ok(output.perf);
        const mainContent = Object.values(output.perf.sequences)[0].blocks[1].content;
        t.equal(mainContent[4].type, "start_milestone");
        t.equal(mainContent[4].atts["x-lemma"][0], "δοῦλος");
        t.equal(mainContent[5].subtype, "usfm:w");
        t.equal(mainContent[5].content[0], "serviteur");
        t.equal(mainContent[6].type, "end_milestone");
    } catch (err) {
        console.log(err);
        t.fail('mergeUwAlignmentPipeline throws on valid perf');
    }
});
