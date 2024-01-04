import PerfRenderFromJson from '../../../PerfRenderFromJson';
const { perfToUsfmJsActions } = require('../renderActions/perfToUsfmJs');

const perfToUsfmJsCode = function ({perf, report}) {
    const cl = new PerfRenderFromJson({srcJson: perf, actions: perfToUsfmJsActions});
    const output = {};
    cl.renderDocument({docId: "", config: { report }, output});
    return {usfmJs: output.usfmJs};
}

const perfToUsfmJs = {
    name: "perfToUsfmJs",
    type: "Transform",
    description: "PERF=>USFMJS",
    inputs: [
        {
            name: "perf",
            type: "json",
            source: ""
        }
    ],
    outputs: [
        {
            name: "usfmJs",
            type: "json",
        }
    ],
    code: perfToUsfmJsCode
}

module.exports = { perfToUsfmJs };
