import test from 'tape';
import usfmHelps from '../../src/usfmHelps.js';

const testGroup = 'usfmHelps';

test(
    `Data present (${testGroup})`,
    async function (t) {
        try {
            t.plan(10);
            for (const v of ['characterTags', 'bodyTags', 'headingTags', 'introHeadingTags', 'introBodyTags']) {
                t.ok(v in usfmHelps);
                t.ok(usfmHelps[v].length > 0);
            }
        } catch (err) {
            console.log(err);
        }
    },
);
