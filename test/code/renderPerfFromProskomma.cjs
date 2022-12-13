import test from 'tape';

const fse = require('fs-extra');
import PerfRenderFromProskomma from '../../dist/PerfRenderFromProskomma';
import {Proskomma} from 'proskomma';
import {Validator} from "../../dist/";
import identityActions from '../../dist/transforms/perf2perf/identityActions';
import path from "path";
const testGroup = 'Render PERF from Proskomma';

const pk = new Proskomma();

test(
    `Instantiate class (${testGroup})`,
    async function (t) {
        try {
            t.plan(1);
            t.doesNotThrow(() => new PerfRenderFromProskomma({proskomma: pk}));
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

            // await thaw(pk, nt_ebible_4book);
            const usfm = fse.readFileSync(path.resolve(path.join('test', 'test_data', 'usfms', 'webbe_mrk.usfm'))).toString();
            pk.importDocument({'lang': 'eng', 'abbr': "web"}, "usfm", usfm);
            const cl = new PerfRenderFromProskomma({proskomma: pk, actions: identityActions});
            const docId = pk.gqlQuerySync('{documents { id } }').data.documents[0].id;
            const output = {};
            t.doesNotThrow(() => cl.renderDocument({docId, config: {}, output}));
            // console.log(JSON.stringify(output, null, 2));
            const validator = new Validator();
            const validation = validator.validate(
                'constraint',
                'perfDocument',
                '0.2.1',
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
            // await thaw(pk, nt_uw_1book);
            const pk2 = new Proskomma();
            const usfm = fse.readFileSync(path.resolve(path.join('test', 'test_data', 'usfms', 'webbe_mrk.usfm'))).toString();
            pk2.importDocument({'lang': 'eng', 'abbr': "web"}, "usfm", usfm);
            const docId = pk2.gqlQuerySync('{documents { id } }').data.documents[0].id;
            const cl = new PerfRenderFromProskomma({proskomma: pk2, actions: identityActions});
            const output = {};
            t.doesNotThrow(() => cl.renderDocument({docId, config: {}, output}));
            // console.log(JSON.stringify(output, null, 2));
            const validator = new Validator();
            const validation = validator.validate(
                'constraint',
                'perfDocument',
                '0.2.1',
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
    `Check for xrefs and wj in PERF (${testGroup})`,
    async function (t) {
        try {
            t.plan(5);
            const pk3 = new Proskomma();
            const usfm = fse.readFileSync(path.resolve(path.join('test', 'test_data', 'usfms', 'webbe_mrk.usfm'))).toString();
            pk3.importDocument({'lang': 'eng', 'abbr': "web"}, "usfm", usfm);
            const docId = pk3.gqlQuerySync('{documents { id } }').data.documents[0].id;
            const cl = new PerfRenderFromProskomma({proskomma: pk3, actions: identityActions});
            const output = {};
            t.doesNotThrow(
                () => cl.renderDocument(
                    {docId, config: {}, output}
                )
            );
            // console.log(JSON.stringify(output.perf, null, 2));
            const validator = new Validator();
            const validation = validator.validate(
                'constraint',
                'perfDocument',
                '0.2.1',
                output.perf
            );
            t.ok(validation.isValid);
            t.equal(validation.errors, null);
            const perfString = JSON.stringify(output.perf);
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
                pk5.importDocument({'lang': 'eng', 'abbr': "foo"}, "usx", usx);
                const docId = pk5.gqlQuerySync('{documents { id } }').data.documents[0].id;
                // console.log(pk5.gqlQuerySync(`{ document(id: "${docId}") { mainSequence { blocks { dump } } } }`).data.document.mainSequence);
                const cl = new PerfRenderFromProskomma({proskomma: pk5, actions: identityActions, debugLevel: 0});
                const output = {};
                t.doesNotThrow(
                    () => {
                        cl.renderDocument(
                            {docId, config: {}, output}
                        );
                        // console.log(JSON.stringify(output.perf, null, 2));
                    }
                );
                const validator = new Validator();
                const validation = validator.validate(
                    'constraint',
                    'perfDocument',
                    '0.3.0',
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

