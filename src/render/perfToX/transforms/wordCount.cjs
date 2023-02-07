const PerfRenderFromJson = require('../../../PerfRenderFromJson');
const { wordCountActions } = require('../renderActions/wordCount');

const wordCountCode = function ({perf}) {
    const cl = new PerfRenderFromJson({srcJson: perf, actions: wordCountActions});
    const output = {};
    cl.renderDocument({docId: "", config: {}, output});
    return {report: output.report};
}

const wordCount = {
    name: "wordCount",
    type: "Transform",
    description: "PERF=>JSON: Generates positions for inserting chapter numbers into USFM",
    inputs: [
        {
            name: "perf",
            type: "json",
            source: ""
        },
    ],
    outputs: [
        {
            name: "report",
            type: "json",
        }
    ],
    code: wordCountCode
}

module.exports = { wordCount };
