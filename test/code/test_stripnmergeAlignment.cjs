const { PipelineHandler } = require('../../dist/index');
import { Validator } from '../../dist/';
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