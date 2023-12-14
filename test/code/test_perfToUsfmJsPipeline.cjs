const path = require('path');
const fse = require('fs-extra');
const test = require('tape');
const {Proskomma} = require('proskomma');
const {PipelineHandler} = require('../../dist/index');
const usfmJsPackage = require('usfm-js');
const testGroup = 'Perf 2 usfmJs';

const pipelineH = new PipelineHandler({
    proskomma: new Proskomma(),
    verbose: false
});

const usfm = fse.readFileSync(path.resolve(__dirname, '../test_data/usfms/titus_aligned.usfm')).toString();
const pk = new Proskomma();
pk.importDocument({lang: "fra", abbr: "lsg"}, "usfm", usfm);
const perfContent = JSON.parse(pk.gqlQuerySync("{documents {perf}}").data.documents[0].perf);
const usfmJsJson = usfmJsPackage.toJSON(usfm);
// console.log("UsfmJs\n", JSON.stringify(usfmJsJson.headers, null, 2));
test(`perf=>usfmJs (${testGroup})`, t => {
    t.plan(5);
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
        t.ok(output.usfmJs.headers);
        const idHeader = output.usfmJs.headers.filter(h => h.tag === "id")[0];
        t.ok(idHeader);
        t.ok(idHeader.content.startsWith('TIT'));
//        console.log("Proskomma\n", JSON.stringify(output.usfmJs.headers, null, 2));
    } catch (err) {
        console.log(err);
        t.fail('perfToUsfmJsPipeline throws on valid perf');
    }
});
