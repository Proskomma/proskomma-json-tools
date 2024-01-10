import PerfRenderFromJson from '../../../PerfRenderFromJson';
import mergeActions from '../../../mergeActions';

const {identityActions} = require('../../perfToPerf/renderActions/identity');
const {addUwAlignmentOccurrencesActions} = require('../../perfToPerf/renderActions/addUwAlignmentOccurrences');

const addUwAlignmentOccurrencesCode = function ({perf, occurrences}) {
    const cl = new PerfRenderFromJson(
        {
            srcJson: perf,
            actions: mergeActions(
                [
                    addUwAlignmentOccurrencesActions,
                    identityActions
                ]
            )
        }
    );
    const output = {};
    cl.renderDocument({docId: "", config: {occurrences}, output});
    return {perf: output.perf};
}

const addUwAlignmentOccurrences = {
    name: "addUwAlignmentOccurrences",
    type: "Transform",
    description: "PERF=>PERF: Adds uW alignment markup from usfmJs",
    documentation: "This transform adds uW alignment from an equivalent usfmJs document.",
    inputs: [
        {
            name: "perf",
            type: "json",
            source: ""
        },
        {
            name: "occurrences",
            type: "json",
            source: ""
        }
    ],
    outputs: [
        {
            name: "perf",
            type: "json",
        }
    ],
    code: addUwAlignmentOccurrencesCode
}
module.exports = {
    addUwAlignmentOccurrences,
};
