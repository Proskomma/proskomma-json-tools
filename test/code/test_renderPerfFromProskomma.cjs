import test from 'tape';

const fse = require('fs-extra');
const render = require('../../dist/render');
import PerfRenderFromProskomma from '../../dist/render/renderers/PerfRenderFromProskomma';
import PerfRenderFromJson from '../../dist/render/renderers/PerfRenderFromJson';
import { Proskomma } from 'proskomma-core';
import { Validator } from "../../dist/";
import path from "path";
const testGroup = 'Render PERF from Proskomma';

const pk = new Proskomma();

test(
    `Instantiate class (${testGroup})`,
    async function (t) {
        try {
            t.plan(1);
            t.doesNotThrow(() => new PerfRenderFromProskomma({ proskomma: pk }));
        } catch (err) {
            console.log(err);
        }
    },
);

test(
    `Render PERF via identity actions (${testGroup})`,
    async function (t) {
        try {
            t.plan(3);

            const usfm = fse.readFileSync(path.resolve(path.join('test', 'test_data', 'usfms', 'webbe_mrk.usfm'))).toString();
            pk.importDocument({ 'lang': 'eng', 'abbr': "web" }, "usfm", usfm);
            const cl = new PerfRenderFromProskomma({ proskomma: pk, actions: render.perfToPerf.renderActions.identityActions });
            const docId = pk.gqlQuerySync('{documents { id } }').data.documents[0].id;
            const output = {};
            t.doesNotThrow(() => cl.renderDocument({ docId, config: {}, output }));
            // bd is not wrapping w
            // const bdOb = Object.values(output.perf.sequences)[0].blocks[1].content[2];
            // t.ok(bdOb.content.length > 0);
            const validator = new Validator();
            const validation = validator.validate(
                'constraint',
                'perfDocument',
                '0.4.0',
                output.perf
            );
            t.ok(validation.isValid);
            t.equal(validation.errors, null);
        } catch (err) {
            console.log(err);
        }
    },
);

test(
    `Render PERF with atts via identity actions (${testGroup})`,
    async function (t) {
        try {
            t.plan(3);
            const pk2 = new Proskomma();
            const usfm = fse.readFileSync(path.resolve(path.join('test', 'test_data', 'usfms', 'webbe_mrk.usfm'))).toString();
            pk2.importDocument({ 'lang': 'eng', 'abbr': "web" }, "usfm", usfm);
            const docId = pk2.gqlQuerySync('{documents { id } }').data.documents[0].id;
            const cl = new PerfRenderFromProskomma({ proskomma: pk2, actions: render.perfToPerf.renderActions.identityActions });
            const output = {};
            t.doesNotThrow(() => cl.renderDocument({ docId, config: {}, output }));
            const validator = new Validator();
            const validation = validator.validate(
                'constraint',
                'perfDocument',
                '0.4.0',
                output.perf
            );
            t.ok(validation.isValid);
            t.equal(validation.errors, null);
        } catch (err) {
            console.log(err);
        }
    },
);

test(
    `Check for xrefs, wj and nested wrappers in PERF (${testGroup})`,
    async function (t) {
        try {
            t.plan(5);
            const pk3 = new Proskomma();
            const usfm = fse.readFileSync(path.resolve(path.join('test', 'test_data', 'usfms', 'webbe_mrk.usfm'))).toString();
            pk3.importDocument({ 'lang': 'eng', 'abbr': "web" }, "usfm", usfm);
            const docId = pk3.gqlQuerySync('{documents { id } }').data.documents[0].id;
            const cl = new PerfRenderFromProskomma({ proskomma: pk3, actions: render.perfToPerf.renderActions.identityActions });
            const output = {};
            t.doesNotThrow(
                () => cl.renderDocument(
                    { docId, config: {}, output }
                )
            );
            // console.log(JSON.stringify(output.perf, null, 2));
            const validator = new Validator();
            const validation = validator.validate(
                'constraint',
                'perfDocument',
                '0.4.0',
                output.perf
            );
            t.ok(validation.isValid);
            t.equal(validation.errors, null);
            const perfString = JSON.stringify(output.perf);
            //console.log(perfString.substring(0, 1000))
            t.ok(perfString.includes('footnote'));
            t.ok(perfString.includes('usfm:wj'));
        } catch (err) {
            console.log(err);
        }
    },);

test(
    `Handle alternative chapter/verse for PERF (${testGroup})`,
    async function (t) {
        try {
            const usxLeaves = ["sofria_ca"];
            t.plan(usxLeaves.length * 6);
            for (const usxLeaf of usxLeaves) {
                const pk5 = new Proskomma();
                const usx = fse.readFileSync(path.resolve(path.join('test', 'test_data', 'sofria_export_usx', `${usxLeaf}.usx`))).toString();
                pk5.importDocument({ 'lang': 'eng', 'abbr': "foo" }, "usx", usx);
                const docId = pk5.gqlQuerySync('{documents { id } }').data.documents[0].id;
                // console.log(pk5.gqlQuerySync(`{ document(id: "${docId}") { mainSequence { blocks { dump } } } }`).data.document.mainSequence);
                const cl = new PerfRenderFromProskomma({ proskomma: pk5, actions: render.perfToPerf.renderActions.identityActions, debugLevel: 0 });
                const output = {};
                t.doesNotThrow(
                    () => {
                        cl.renderDocument(
                            { docId, config: {}, output }
                        );
                        // console.log(JSON.stringify(output.perf, null, 2));
                    }
                );
                const validator = new Validator();
                const validation = validator.validate(
                    'constraint',
                    'perfDocument',
                    '0.4.0',
                    output.perf
                );
                t.ok(validation.isValid);
                t.equal(validation.errors, null);
                const perfString = JSON.stringify(output.perf);
                t.ok(perfString.includes('alt_chapter'));
                t.ok(perfString.includes('alt_verse'));
                t.ok(perfString.includes('pub_verse'));
            }
        } catch (err) {
            console.log(err);
        }
    },
);

test(
    `Render francl PERF via identity actions (${testGroup})`,
    async function (t) {
        try {
            t.plan(4);
            const pk6 = new Proskomma();
            const usfm = fse.readFileSync(path.resolve(path.join('test', 'test_data', 'usfms', 'eng_francl_mrk.usfm'))).toString();
            pk6.importDocument({ 'lang': 'eng', 'abbr': 'francl' }, 'usfm', usfm);
            const docId = pk6.gqlQuerySync('{documents { id } }').data.documents[0].id;
            const cl = new PerfRenderFromProskomma({ proskomma: pk6, actions: render.perfToPerf.renderActions.identityActions });
            const output = {};
            t.doesNotThrow(
                () => cl.renderDocument(
                    { docId, config: {}, output }
                )
            );
            const validator = new Validator();
            const validation = validator.validate(
                'constraint',
                'perfDocument',
                '0.4.0',
                output.perf
            );
            t.ok(validation.isValid);
            t.equal(validation.errors, null);
            const cl2 = new PerfRenderFromJson({ srcJson: output.perf, actions: render.perfToPerf.renderActions.identityActions });
            const output2 = {};
            t.doesNotThrow(() => cl2.renderDocument({ docId: "", config: {}, output: output2 }));
        } catch (err) {
            console.log(err);
        }
    },
);
test(
    `Render tr/tc/th via Proskomma (${testGroup})`,
    async function (t) {
        try {
            t.plan(5);
            const pk = new Proskomma();
            const usfm = fse.readFileSync(path.resolve(path.join('test', 'test_data', 'usfms', 'table.usfm'))).toString();
            pk.importDocument({ 'lang': 'eng', 'abbr': 'web' }, 'usfm', usfm);
            const docId = pk.gqlQuerySync('{documents { id } }').data.documents[0].id;
            const cl = new PerfRenderFromProskomma({ proskomma: pk, actions: render.perfToPerf.renderActions.identityActions, debugLevel: 0 });
            const output = {};
            t.doesNotThrow(
                () => cl.renderDocument(
                    { docId, config: {}, output }
                )
            );
            const mainSequenceId = output.perf.main_sequence_id;

            const numberOfRows = 5;
            const numberOfCells = 2;
            t.equal(output.perf.sequences[mainSequenceId].blocks.filter(b => b.type === 'row').length, numberOfRows, `The number of row is not ${numberOfRows}`);
            t.equal(output.perf.sequences[mainSequenceId].blocks.filter(b => b.type === 'row')[2].content.filter(c => c.subtype === 'cell').length, numberOfCells, `The number of cells render in the 2th row is ${numberOfCells} `);
            const validator = new Validator();
            const validation = validator.validate(
                'constraint',
                'sofriaDocument',
                '0.4.0',
                output.perf
            );
            t.ok(validation.isValid);
            t.equal(validation.errors, null);
        } catch (err) {
            console.log(err);
        }
    },
);
