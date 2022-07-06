import test from 'tape';

const fse = require('fs-extra');
import path from 'path';
import ProskommaRenderFromProskomma from '../../src/ProskommaRenderFromProskomma';
import identityActions from '../../src/identityActions';
import equal from 'deep-equal';
import {UWProskomma} from 'uw-proskomma';
import {thaw} from 'proskomma-freeze';
import {nt_ebible_4book} from 'proskomma-frozen-archives';
const testGroup = 'Render from Proskomma';

const pk = new UWProskomma();

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
    `Render PERF with identity actions (${testGroup})`,
    async function (t) {
        try {
            t.plan(1);
            await thaw(pk, nt_ebible_4book);
            const cl = new ProskommaRenderFromProskomma({proskomma: pk, actions: identityActions});
            const output = {};
            t.doesNotThrow(() => cl.renderDocument({docId: "YTM4ZjhlNGUt", config: {}, output}));
            console.log(JSON.stringify(output, null, 2));
        } catch (err) {
            console.log(err);
        }
    },
);
