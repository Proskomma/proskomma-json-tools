const test = require('tape');
const path = require('path');
const fse = require('fs-extra');
const {perf2usfm} = require('../../src/index.js');

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
