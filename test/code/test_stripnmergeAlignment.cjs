const { PipelineHandler } = require('../../src/index');
const { Validator } = require('../../src/');
const { Proskomma } = require('proskomma');
const fse = require('fs-extra');
const path = require('path');
const test = require('tape');

const testGroup = 'strip and merge';


const perfContent = fse.readFileSync(path.resolve(__dirname, '../test_data/perfs/MARK_titus_aligned_eng.json')).toString();

const proskomma = new Proskomma([
    {
        name: 'org',
        type: 'string',
        regex: '^[^\\s]+$'
    },
    {
        name: 'lang',
        type: 'string',
        regex: '^[^\\s]+$'
    },
    {
        name: 'abbr',
        type: 'string',
        regex: '^[A-za-z0-9_-]+$'
    }
]);
const pipelineH = new PipelineHandler({ proskomma: proskomma, verbose: false });

let reportStrip = null;
let outputStrip = null;
let output = null;

test(`strip alignment (${testGroup})`, async (t) => {
    t.plan(3);
    try {
        output = await pipelineH.runPipeline('stripAlignmentPipeline', {
            perf: JSON.parse(perfContent),
        });
        // console.log(JSON.stringify(output.perf, '  ', 4));
        outputStrip = output.perf;
        reportStrip = output.strippedAlignment;
        const validator = new Validator();
        let validation = validator.validate(
            'constraint',
            'perfDocument',
            '0.3.0',
            outputStrip
        );
        t.equal(validation.errors, null);
        t.ok(outputStrip, 'perf alignment stripped');
        t.ok(reportStrip, 'perf report alignement');
        // await saveFile(JSON.stringify(output.perf, null, 2), 'test/outputs/STRIP_perf_titus_stripped_eng.json');
        // await saveFile(JSON.stringify(output.strippedAlignment, null, 2), 'test/outputs/STRIP_strippedAlignment_stripped_eng.json');
    } catch (err) {
        console.log(err);
        t.fail('stripAlignmentPipeline throws on valid perf');
    }
});

test(`merge alignment (${testGroup})`, async (t) => {
    t.plan(3);
    try {
        output = await pipelineH.runPipeline('mergeAlignmentPipeline', {
            perf: outputStrip,
            strippedAlignment: reportStrip,
        });
        t.ok(output, 'perf alignment stripped');
        // console.log(JSON.stringify(perfContent, ' ', 4));
        t.same(output.perf, JSON.parse(perfContent));
        const validator = new Validator();
        let validation = validator.validate(
            'constraint',
            'perfDocument',
            '0.3.0',
            output.perf
        );
        t.equal(validation.errors, null);
        // await saveFile(JSON.stringify(output.perf, null, 2), 'test/outputs/STRIP_perf_titus_merged_align_eng.json');
    } catch (err) {
        console.log(err);
        t.fail('mergeAlignmentPipeline throws on valid perf');
    }
});


//TESTING GRAFT ERRORS:

const usfmContent = fse.readFileSync(path.resolve(__dirname, "../test_data/usfms/dcs-en-rut.usfm")).toString();

test(`Does not add wrappers to footnotes (${testGroup})`, async (t) => {
    try {
        t.plan(3);
        let {perf} = await pipelineH.runPipeline("usfmToPerfPipeline", {
            usfm: usfmContent,
            selectors: {org: "dcs", "lang": "en", "abbr": "ult"}
        });
        const validator = new Validator();
        const validatorResult = validator.validate('constraint','perfDocument','0.2.1', perf);
        if (!validatorResult.isValid) {
            t.fail("usfm=>perf throws on valid usfm");
            throw `usfm=>perf, PERF file is not valid. \n${JSON.stringify(validatorResult,null,2)}`;
        } else {
            t.ok(validatorResult.isValid);
        }
        const getFootnotes = (sequences) =>
            Object.keys(sequences).filter(id => sequences[id].type === 'footnote').map(id => sequences[id]);

        const footnotes = getFootnotes(perf.sequences);

        const {perf: strippedPerf,strippedAlignment} = await pipelineH.runPipeline("stripAlignmentPipeline", {
            perf
        });
        t.same(footnotes,getFootnotes(strippedPerf.sequences))
        const {perf: mergedPerf} = await pipelineH.runPipeline("mergeAlignmentPipeline", {
            perf: strippedPerf,
            strippedAlignment,
        });
        t.same(footnotes,getFootnotes(mergedPerf.sequences))
    } catch (err) {
        console.log(err);
        t.fail("usfm2perfPipeline throws on valid perf");
    }
    t.end()
});
