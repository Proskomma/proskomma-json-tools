import PerfRenderFromJson from '../../../PerfRenderFromJson';
import mergeActions from '../../../mergeActions';

const { identityActions } = require('../../perfToPerf/renderActions/identity');
const { mergeUwAlignmentActions } = require('../../perfToPerf/renderActions/mergeUwAlignment');

const mergeUwAlignmentCode = function ({perf, usfmJs}) {
    const cl = new PerfRenderFromJson(
        {
            srcJson: perf,
            actions: mergeActions(
                    [
                        mergeUwAlignmentActions,
                        identityActions
                    ]
                )
            }
    );
    const output = {};
    cl.renderDocument({docId: "", config: {usfmJs}, output});
    return {perf: output.perf}; // identityActions currently put PERF directly in output
}

const mergeUwAlignment = {
    name: "mergeUwAlignment",
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
            name: "usfmJs",
            type: "json",
            source: ""
        },
    ],
    outputs: [
        {
            name: "perf",
            type: "json",
        }
    ],
    code: mergeUwAlignmentCode
}
module.exports = {
    mergeUwAlignment,
};
