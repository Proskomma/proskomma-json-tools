import test from 'tape';
import path from 'path';
import fse from 'fs-extra';
import {perf2usfm} from '../../src/index.js';

const testGroup = 'perf2usfm';

test(
    `LSG JON (${testGroup})`,
    async function (t) {
        try {
            const perf = fse.readJsonSync(
                path.resolve(
                    path.join(__dirname, '..', 'test_data', 'fra_lsg_jon_doc.json')
                )
            )
            t.doesNotThrow(() => perf2usfm(perf));
        } catch (err) {
            console.log(err);
        }
    },
);
