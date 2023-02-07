const PerfRenderFromJson = require('../../../PerfRenderFromJson');
const mergeActions = require('../../../mergeActions');

const { identityActions } = require('../renderActions/identity');
const { justTheBibleActions } = require('../renderActions/justTheBible');

const justTheBibleCode = function ({perf}) {
    const cl = new PerfRenderFromJson(
        {
            srcJson: perf,
            actions: mergeActions(
                    [
                        justTheBibleActions,
                        identityActions
                    ]
                )
            }
    );
    const output = {};
    cl.renderDocument({docId: "", config: {}, output});
    return {perf: output.perf}; // identityActions currently put PERF directly in output
}

const justTheBible = {
    name: "justTheBible",
    type: "Transform",
    description: "PERF=>PERF: Strips most markup",
    documentation: "This transform removes milestones, wrappers and most marks. It has been used in several pipelines. It may also be stripping metaContent.",
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
    code: justTheBibleCode
}
module.exports = {
    justTheBible,
};
