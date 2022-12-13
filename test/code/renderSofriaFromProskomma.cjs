import test from 'tape';

import path from 'path';
import fse from 'fs-extra';
import SofriaRenderFromProskomma from '../../dist/SofriaRenderFromProskomma';
import identityActions from '../../dist/transforms/sofria2sofria/identityActions';
import {Proskomma} from 'proskomma';
import {Validator} from '../../dist/';

const testGroup = 'Render SOFRIA from Proskomma';

const pk = new Proskomma();

test(
    `Instantiate class (${testGroup})`,
    async function (t) {
        try {
            t.plan(1);
            t.doesNotThrow(() => new SofriaRenderFromProskomma({proskomma: pk}));
        } catch (err) {
            console.log(err);
        }
    },
);

test(
    `Render SOFRIA via identity actions (${testGroup})`,
    async function (t) {
        try {
            t.plan(3);
            const usfm = fse.readFileSync(path.resolve(path.join('test', 'test_data', 'usfms','webbe_mrk.usfm'))).toString();
            pk.importDocument({'lang': 'eng', 'abbr': 'web'}, 'usfm', usfm);
            const docId = pk.gqlQuerySync('{documents { id } }').data.documents[0].id;
            const cl = new SofriaRenderFromProskomma({proskomma: pk, actions: identityActions});
            const output = {};
            t.doesNotThrow(
                () => cl.renderDocument(
                    {docId, config: {}, output}
                )
            );
            // console.log(JSON.stringify(output, null, 2));
            const validator = new Validator();
            const validation = validator.validate(
                'constraint',
                'sofriaDocument',
                '0.2.1',
                output.sofria
            );
            t.ok(validation.isValid);
            t.equal(validation.errors, null);
        } catch (err) {
            console.log(err);
        }
    },
);

test(
    `Render 1 chapter of SOFRIA (${testGroup})`,
    async function (t) {
        try {
            t.plan(3);
            const docId = pk.gqlQuerySync('{documents { id } }').data.documents[0].id;
            const cl = new SofriaRenderFromProskomma({proskomma: pk, actions: identityActions});
            const output = {};
            t.doesNotThrow(
                () => cl.renderDocument(
                    {docId, config: {chapters: ['2']}, output}
                )
            );
            // console.log(JSON.stringify(output, null, 2));
            const validator = new Validator();
            const validation = validator.validate(
                'constraint',
                'sofriaDocument',
                '0.2.1',
                output.sofria
            );
            t.ok(validation.isValid);
            t.equal(validation.errors, null);
        } catch (err) {
            console.log(err);
        }
    },
);

test(
    `Render SOFRIA with atts via identity actions (${testGroup})`,
    async function (t) {
        try {
            t.plan(3);
            const pk2 = new Proskomma();
            const usfm = fse.readFileSync(path.resolve(path.join('test', 'test_data', 'usfms', 'ult_uw_mrk.usfm'))).toString();
            pk2.importDocument({'lang': 'eng', 'abbr': 'ult'}, 'usfm', usfm);
            const docId = pk2.gqlQuerySync('{documents { id } }').data.documents[0].id;
            const cl = new SofriaRenderFromProskomma({proskomma: pk2, actions: identityActions});
            const output = {};
            t.doesNotThrow(() => cl.renderDocument({docId, config: {}, output}));
            // console.log(JSON.stringify(output, null, 2));
            const validator = new Validator();
            const validation = validator.validate(
                'constraint',
                'sofriaDocument',
                '0.2.1',
                output.sofria
            );
            t.ok(validation.isValid);
            t.equal(validation.errors, null);
        } catch (err) {
            console.log(err);
        }
    },
);

test(
    `Render SOFRIA with multi-para verses (${testGroup})`,
    async function (t) {
        try {
            t.plan(3);
            const pk3 = new Proskomma();
            const usfm = fse.readFileSync(path.resolve(path.join('test', 'test_data', 'usfms', 'verse_over_para_boundary.usfm'))).toString();
            pk3.importDocument({'lang': 'eng', 'abbr': 'web'}, 'usfm', usfm);
            const docId = pk3.gqlQuerySync('{documents { id } }').data.documents[0].id;
            const cl = new SofriaRenderFromProskomma({proskomma: pk3, actions: identityActions});
            const output = {};
            t.doesNotThrow(
                () => cl.renderDocument(
                    {docId, config: {}, output}
                )
            );
            // console.log(JSON.stringify(output, null, 2));
            const validator = new Validator();
            const validation = validator.validate(
                'constraint',
                'sofriaDocument',
                '0.2.1',
                output.sofria
            );
            t.ok(validation.isValid);
            t.equal(validation.errors, null);
        } catch (err) {
            console.log(err);
        }
    },
);

test(
    `Check for xrefs and wj in SOFRIA (${testGroup})`,
    async function (t) {
        try {
            t.plan(5);
            const pk4 = new Proskomma();
            const usfm = fse.readFileSync(path.resolve(path.join('test', 'test_data', 'usfms', 'webbe_mrk.usfm'))).toString();
            pk4.importDocument({'lang': 'eng', 'abbr': 'web'}, 'usfm', usfm);
            const docId = pk4.gqlQuerySync('{documents { id } }').data.documents[0].id;
            const cl = new SofriaRenderFromProskomma({proskomma: pk4, actions: identityActions});
            const output = {};
            t.doesNotThrow(
                () => cl.renderDocument(
                    {docId, config: {}, output}
                )
            );
            // console.log(JSON.stringify(output.sofria, null, 2));
            const validator = new Validator();
            const validation = validator.validate(
                'constraint',
                'sofriaDocument',
                '0.2.1',
                output.sofria
            );
            t.ok(validation.isValid);
            t.equal(validation.errors, null);
            const sofriaString = JSON.stringify(output.sofria);
            t.ok(sofriaString.includes('footnote'));
            t.ok(sofriaString.includes('usfm:wj'));
        } catch (err) {
            console.log(err);
        }
    },
);

test(
    `Handle conjunction of note and straddle para for SOFRIA (${testGroup})`,
    async function (t) {
        try {
            const usxLeaves = ['sofria_note', 'sofria_verse_straddles_para', 'sofria_note_plus_verse_straddles_paras'];
            t.plan(usxLeaves.length);
            for (const usxLeaf of usxLeaves) {
                const pk5 = new Proskomma();
                const usx = fse.readFileSync(path.resolve(path.join('test', 'test_data', 'sofria_export_usx', `${usxLeaf}.usx`))).toString();
                pk5.importDocument({'lang': 'eng', 'abbr': 'foo'}, 'usx', usx);
                const docId = pk5.gqlQuerySync('{documents { id } }').data.documents[0].id;
                const cl = new SofriaRenderFromProskomma({proskomma: pk5, actions: identityActions, debugLevel: 0});
                const output = {};
                t.doesNotThrow(
                    () => {
                        cl.renderDocument(
                            {docId, config: {}, output}
                        );
                        // console.log(JSON.stringify(output.sofria, null, 2));
                    }
                );
            }
        } catch (err) {
            console.log(err);
        }
    },
);

test(
    `SOFRIA rems (${testGroup})`,
    async function (t) {
        try {
            t.plan(3);
            const usfm = fse.readFileSync(path.resolve(path.join('test', 'test_data', 'usfms', 'rems.usfm'))).toString();
            const pk6 = new Proskomma();
            pk6.importDocument({'lang': 'eng', 'abbr': 'web'}, 'usfm', usfm);
            const docId = pk6.gqlQuerySync('{documents { id } }').data.documents[0].id;
            const cl = new SofriaRenderFromProskomma({proskomma: pk6, actions: identityActions});
            const output = {};
            t.doesNotThrow(
                () => cl.renderDocument(
                    {docId, config: {}, output}
                )
            );
            // console.log(JSON.stringify(output, null, 2));
            const validator = new Validator();
            const validation = validator.validate(
                'constraint',
                'sofriaDocument',
                '0.2.1',
                output.sofria
            );
            t.ok(validation.isValid);
            t.equal(validation.errors, null);
        } catch (err) {
            console.log(err);
        }
    },
);

test(
    `Handle alternative chapter/verse for SOFRIA (${testGroup})`,
    async function (t) {
        try {
            const usxLeaves = ['sofria_ca'];
            t.plan(usxLeaves.length * 6);
            for (const usxLeaf of usxLeaves) {
                const pk5 = new Proskomma();
                const usx = fse.readFileSync(path.resolve(path.join('test', 'test_data', 'sofria_export_usx', `${usxLeaf}.usx`))).toString();
                pk5.importDocument({'lang': 'eng', 'abbr': 'foo'}, 'usx', usx);
                const docId = pk5.gqlQuerySync('{documents { id } }').data.documents[0].id;
                // console.log(pk5.gqlQuerySync(`{ document(id: '${docId}') { mainSequence { blocks { dump } } } }`).data.document.mainSequence);
                const cl = new SofriaRenderFromProskomma({proskomma: pk5, actions: identityActions, debugLevel: 0});
                const output = {};
                t.doesNotThrow(
                    () => {
                        cl.renderDocument(
                            {docId, config: {}, output}
                        );
                        // console.log(JSON.stringify(output.sofria, null, 2));
                    }
                );
                const validator = new Validator();
                const validation = validator.validate(
                    'constraint',
                    'sofriaDocument',
                    '0.3.0',
                    output.sofria
                );
                t.ok(validation.isValid);
                t.equal(validation.errors, null);
                const sofriaString = JSON.stringify(output.sofria);
                t.ok(sofriaString.includes('alt_chapter'));
                t.ok(sofriaString.includes('alt_verse'));
                t.ok(sofriaString.includes('pub_verse'));
            }
        } catch (err) {
            console.log(err);
        }
    },
);
