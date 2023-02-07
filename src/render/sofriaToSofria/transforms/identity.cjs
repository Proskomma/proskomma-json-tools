const { identityActions } = require('../renderActions/identity');

const identityActionsCode = function ({ perf }) {
    const cl = new PerfRenderFromJson(
        {
            srcJson: perf,
            actions: identityActions
        }
    );
    const output = {};
    cl.renderDocument({ docId: "", config: {}, output });
    return { verseWords: output.cv };
}

const identity = {
    name: "identity",
    type: "Transform",
    description: "identity operation",
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
    code: identityActionsCode
}

module.exports = {
    identity,
};
