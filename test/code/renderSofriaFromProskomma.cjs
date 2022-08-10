import test from 'tape';

import path from 'path';
import fse from 'fs-extra';
import SofriaRenderFromProskomma from '../../src/SofriaRenderFromProskomma';
import identityActions from '../../src/transforms/sofria2sofria/identityActions';
import {UWProskomma} from 'uw-proskomma';
import {thaw} from 'proskomma-freeze';
import {nt_ebible_4book} from 'proskomma-frozen-archives';
import {nt_uw_1book} from 'proskomma-frozen-archives';
import {Validator} from "../../src/";

const testGroup = 'Render SOFRIA from Proskomma';

const pk = new UWProskomma();

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
            await thaw(pk, nt_ebible_4book);
            const cl = new SofriaRenderFromProskomma({proskomma: pk, actions: identityActions});
            const output = {};
            t.doesNotThrow(
                () => cl.renderDocument(
                    {docId: "YTM4ZjhlNGUt", config: {}, output}
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
            const cl = new SofriaRenderFromProskomma({proskomma: pk, actions: identityActions});
            const output = {};
            t.doesNotThrow(
                () => cl.renderDocument(
                    {docId: "YTM4ZjhlNGUt", config: {chapters:["2"]}, output}
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
            await thaw(pk, nt_uw_1book);
            const cl = new SofriaRenderFromProskomma({proskomma: pk, actions: identityActions});
            const output = {};
            t.doesNotThrow(() => cl.renderDocument({docId: "MWY3OWMwMTUt", config: {}, output}));
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
            const pk2 = new UWProskomma();
            const usfm = fse.readFileSync(path.resolve(path.join('test', 'test_data', 'verse_over_para_boundary.usfm'))).toString();
            console.log(usfm);
            pk2.importDocument({'org': 'eBible', 'lang': 'en', 'abbr': "web"}, "usfm", usfm);
            const docId = pk2.gqlQuerySync('{documents { id } }').data.documents[0].id;
            const cl = new SofriaRenderFromProskomma({proskomma: pk2, actions: identityActions});
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


