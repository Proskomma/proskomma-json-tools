const path = require('path');
const fse = require('fs-extra');
const test = require('tape');
const {Proskomma} = require('proskomma');
const {PipelineHandler} = require('../../dist/index');
const usfmJsPackage = require('usfm-js');
const testGroup = 'Perf 2 usfmJs';

const pipelineH = new PipelineHandler({
    proskomma: new Proskomma(),
    verbose: true
});

const usfm = fse.readFileSync(path.resolve(__dirname, '../test_data/usfms/titus_aligned.usfm')).toString();
const pk = new Proskomma();
pk.importDocument({lang: "fra", abbr: "lsg"}, "usfm", usfm);
const perfContent = JSON.parse(pk.gqlQuerySync("{documents {perf}}").data.documents[0].perf);
const usfmJsJson = usfmJsPackage.toJSON(usfm);
// console.log("UsfmJs\n", JSON.stringify(usfmJsJson.chapters, null, 2));
test(`perf=>usfmJs (${testGroup})`, t => {
    t.plan(10);
    let output;
    try {
        t.doesNotThrow(async () => {
            output = pipelineH.runPipeline(
                'perfToUsfmJsPipeline', {
                    perf: perfContent
                }
            );
        });
        // console.log("Output", output.usfmJs.chapters["1"]["front"])
        t.ok(output.usfmJs);
        t.ok(output.usfmJs.headers);
        const idHeader = output.usfmJs.headers.filter(h => h.tag === "id")[0];
        t.ok(idHeader);
        t.ok(idHeader.content.startsWith('TIT'));
        t.ok(output.usfmJs.chapters);
        t.ok(output.usfmJs.chapters["1"]);
        t.ok(output.usfmJs.chapters["1"]["1"]);
        t.ok(output.usfmJs.chapters["1"]["1"].verseObjects);
        t.ok(output.usfmJs.chapters["1"]["1"].verseObjects[0]);
        // t.ok(output.usfmJs.chapters["1"]["1"].verseObjects[0].type === "text");
        // t.ok(output.usfmJs.chapters["1"]["1"].verseObjects[0].text.startsWith("Paul, serviteur de Dieu"));
        console.log("Proskomma\n", JSON.stringify(output.usfmJs, null, 2));
        // console.log(usfmJsPackage.toUSFM(output.usfmJs));
    } catch (err) {
        console.log(err);
        t.fail('perfToUsfmJsPipeline throws on valid perf');
    }
});
