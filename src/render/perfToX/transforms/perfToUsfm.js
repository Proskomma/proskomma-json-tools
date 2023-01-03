import PerfRenderFromJson from '../../../PerfRenderFromJson';
const { perfToUsfmActions } = require('../renderActions/perfToUsfm');

const perfToUsfmCode = function ({perf, report}) {
    const cl = new PerfRenderFromJson({srcJson: perf, actions: perfToUsfmActions});
    const output = {};
    cl.renderDocument({docId: "", config: { report }, output});
    return {usfm: output.usfm};
}

const perfToUsfm = {
    name: "perfToUsfm",
    type: "Transform",
    description: "PERF=>USFM",
    inputs: [
        {
            name: "perf",
            type: "json",
            source: ""
        },
        {
            name: "report",
            type: "json",
            source: ""
        },
    ],
    outputs: [
        {
            name: "usfm",
            type: "text",
        }
    ],
    code: perfToUsfmCode
}

module.exports = { perfToUsfm };