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
// console.log("UsfmJs\n", JSON.stringify(usfmJsJson, null, 2));
test(`perf=>usfmJs (${testGroup})`, t => {
    t.plan(23);
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
        // HEADERS
        t.ok(output.usfmJs.headers);
        const idHeader = output.usfmJs.headers.filter(h => h.tag === "id")[0];
        t.ok(idHeader);
        t.ok(idHeader.content.startsWith('TIT'));
        // CHAPTER STRUCTURE
        t.ok(output.usfmJs.chapters);
        t.ok(output.usfmJs.chapters["1"]);
        t.ok(output.usfmJs.chapters["1"]["1"]);
        t.ok(output.usfmJs.chapters["1"]["1"].verseObjects);
        t.ok(output.usfmJs.chapters["1"]["1"].verseObjects[0]);
        // SINGLE MILESTONE
        t.ok(output.usfmJs.chapters["1"]["1"].verseObjects[0].type === "milestone");
        t.ok(output.usfmJs.chapters["1"]["1"].verseObjects[0].tag === "zaln");
        t.ok(output.usfmJs.chapters["1"]["1"].verseObjects[0].lemma === "Παῦλος");
        t.ok(output.usfmJs.chapters["1"]["1"].verseObjects[0].children.length === 2);
        t.ok(output.usfmJs.chapters["1"]["1"].verseObjects[0].children[0].tag === "w");
        t.ok(output.usfmJs.chapters["1"]["1"].verseObjects[0].children[0].text.startsWith("Paul"));
        // NESTED MILESTONES
        const nestedMilestone = output.usfmJs.chapters["1"]["1"].verseObjects.filter(m => m.strong === "G35880")[0];
        t.ok(nestedMilestone);
        t.ok(nestedMilestone.content === 'τῆς');
        const nestedMilestone2 = nestedMilestone.children[0];
        t.ok(nestedMilestone2.content === 'κατ’');
        const nestedMilestone3 = nestedMilestone2.children[0];
        t.ok(nestedMilestone3.content === 'εὐσέβειαν');
        t.ok(nestedMilestone3.children.filter(c => c.tag === "w").length === 5);
        t.ok(nestedMilestone3.children.filter(c => c.type === "text").length === 4);
        t.ok(nestedMilestone3.children[0].occurrence);
        // console.log("Proskomma\n", JSON.stringify(output.usfmJs, null, 2));
        // console.log(usfmJsPackage.toUSFM(output.usfmJs));
    } catch (err) {
        console.log(err);
        t.fail('perfToUsfmJsPipeline throws on valid perf');
    }
});
