import PerfRenderFromJson from '../../../PerfRenderFromJson';
import mergeActions from '../../../mergeActions';

const { identityActions } = require('../../perfToPerf/renderActions/identity');
const { mergeAlignmentActions } = require('../renderActions/mergeAlignement');

const mergeAlignmentCode = function ({
    perf,
    verseWords: totalOccurrences,
    strippedAlignment,
}) {
    const cl = new PerfRenderFromJson({
        srcJson: perf,
        actions: mergeActions([
            mergeAlignmentActions,
            identityActions,
        ]),
    });
    const output = {};
    cl.renderDocument({
        docId: "",
        config: {
            totalOccurrences,
            strippedAlignment,
        },
        output,
    });
    return { perf: output.perf }; // identityActions currently put PERF directly in output
};

const mergeAlignment = {
    name: "mergeAlignment",
    type: "Transform",
    description: "PERF=>PERF adds report to verses",
    inputs: [
        {
            name: "perf",
            type: "json",
            source: "",
        },
        {
            name: "strippedAlignment",
            type: "json",
            source: "",
        },
        {
            name: "verseWords",
            type: "json",
            source: "",
        },
    ],
    outputs: [
        {
            name: "perf",
            type: "json",
        },
    ],
    code: mergeAlignmentCode,
};
module.exports = { mergeAlignment };
