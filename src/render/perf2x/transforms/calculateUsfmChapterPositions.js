import PerfRenderFromJson from '../../../PerfRenderFromJson';
const { calculateUsfmChapterPositionsActions } = require('../renderActions/calculateUsfmChapterPositions');

const calculateUsfmChapterPositionsCode = function ({perf}) {
    const cl = new PerfRenderFromJson({srcJson: perf, actions: calculateUsfmChapterPositionsActions});
    const output = {};
    cl.renderDocument({docId: "", config: {maxLength: 60}, output});
    return {report: output.report};
}

const calculateUsfmChapterPositions = {
    name: "calculateUsfmChapterPositions",
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
    code: calculateUsfmChapterPositionsCode
}

module.exports = { calculateUsfmChapterPositions };
