import PerfRenderFromJson from '../../../PerfRenderFromJson';
import mergeActions from '../../../mergeActions';

const { identityActions } = require('../../perfToPerf/renderActions/identity');
const { stripUwAlignmentActions } = require('../../perfToPerf/renderActions/stripUwAlignment');

const stripUwAlignmentCode = function ({perf}) {
    const cl = new PerfRenderFromJson(
        {
            srcJson: perf,
            actions: mergeActions(
                    [
                        stripUwAlignmentActions,
                        identityActions
                    ]
                )
            }
    );
    const output = {};
    cl.renderDocument({docId: "", config: {}, output});
    return {perf: output.perf}; // identityActions currently put PERF directly in output
}

const stripUwAlignment = {
    name: "stripUwAlignment",
    type: "Transform",
    description: "PERF=>PERF: Strips uW alignment markup",
    documentation: "This transform removes zaln milestones and w wrappers and most marks.",
    inputs: [
        {
            name: "perf",
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
    code: stripUwAlignmentCode
}
module.exports = {
    stripUwAlignment,
};
