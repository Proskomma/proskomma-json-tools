import test from 'tape';

const fse = require('fs-extra');
import path from 'path';
import ProskommaRenderFromProskomma from '../../src/ProskommaRenderFromProskomma';
import identityActions from '../../src/identityActions';
import equal from 'deep-equal';
import {UWProskomma} from 'uw-proskomma';
import {thaw} from 'proskomma-freeze';
import {nt_ebible_4book} from 'proskomma-frozen-archives';
import {nt_uw_1book} from 'proskomma-frozen-archives';
import {Validator} from "../../src/";

const testGroup = 'Render from Proskomma';

const pk = new UWProskomma();
const pk2 = new UWProskomma();

test(
    `Instantiate class (${testGroup})`,
    async function (t) {
        try {
            t.plan(1);
            t.doesNotThrow(() => new ProskommaRenderFromProskomma({proskomma: pk}));
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
            await thaw(pk, nt_ebible_4book);
            const cl = new ProskommaRenderFromProskomma({proskomma: pk, actions: identityActions});
            const output = {};
            t.doesNotThrow(() => cl.renderDocument({docId: "YTM4ZjhlNGUt", config: {}, output}));
            // console.log(JSON.stringify(output, null, 2));
            const validator = new Validator();
            const validation = validator.validate(
                'constraint',
                'perfDocument',
                '0.2.0',
                output
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
            await thaw(pk, nt_uw_1book);
            const cl = new ProskommaRenderFromProskomma({proskomma: pk, actions: identityActions});
            const output = {};
            t.doesNotThrow(() => cl.renderDocument({docId: "MWY3OWMwMTUt", config: {}, output}));
            // console.log(JSON.stringify(output, null, 2));
            const validator = new Validator();
            const validation = validator.validate(
                'constraint',
                'perfDocument',
                '0.2.0',
                output
            );
            t.ok(validation.isValid);
            t.equal(validation.errors, null);
        } catch (err) {
            console.log(err);
        }
    },
);
