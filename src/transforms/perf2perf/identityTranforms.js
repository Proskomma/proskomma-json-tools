import identityActions from "./identityActions";

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

const identityTransforms = {
    name: "identityTransforms",
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

export default identityTransforms;
