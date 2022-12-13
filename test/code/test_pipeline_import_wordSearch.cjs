const { PipelineHandler, testPipelines, testTransforms } = require('../../dist/index');
// const { testPipelines, testTransforms } = require('../../dist/test_pipelines_transforms');
const test = require('tape');
const { Proskomma } = require('proskomma');
const fse = require('fs-extra');
const path = require('path');

const testGroup = 'wordSearch';


const pipelineH = new PipelineHandler({
    pipelines: testPipelines,
    transforms: testTransforms,
    proskomma:new Proskomma(),
    verbose:false
});

const perfContent = fse.readJsonSync(path.resolve(__dirname, '../test_data/perfs/titus_aligned_eng.json'));

test(`returns output with valid args (${testGroup})`, (t) => {
    t.plan(6);
    try {
        t.doesNotThrow(async () => {
            let output = await pipelineH.runPipeline('wordSearchPipeline', {
                perf: perfContent,
                searchString: 'God',
                ignoreCase: '0',
                asRegex: '0',
                logic: 'A',
                asPartial: '0'
            });

            t.ok('matches' in output);
            t.ok('searchTerms' in output.matches);
            t.equal(output.matches.matches[0].chapter, '1');
            t.equal(output.matches.matches[0].verses, '1');
            t.equal(output.matches.matches.length, 12);
            // await saveFile(output.usfm);
        })
    } catch (err) {
        console.log(err);
        t.fail('perf2usfmPipeline throws on valid perf');
    }
});