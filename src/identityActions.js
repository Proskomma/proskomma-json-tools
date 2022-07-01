const ProskommaRenderAction = require('../src/ProskommaRenderAction');

const identityActions = {
    startDocument: [
        new ProskommaRenderAction({
            description: "identity",
            test: () => true,
            action: ({config, context, workspace, output}) => {
                output.schema = context.document.schema;
                output.metadata = context.document.metadata;
                output.sequences = {};
            }
        }),
    ],
    endDocument: [
        new ProskommaRenderAction({
            description: "identity",
            test: () => true,
            action: ({config, context, workspace, output}) => {}
        }),
    ],
    startSequence: [
        new ProskommaRenderAction({
            description: "identity",
            test: () => true,
            action: ({config, context, workspace, output}) => {
                workspace.currentSequence = context.sequences[0];
                output.sequences[context.sequences[0].id] = {
                    type: workspace.currentSequence.type
                }
            }
        }),
    ],
    endSequence: [
        new ProskommaRenderAction({
            description: "identity",
            test: () => true,
            action: ({config, context, workspace, output}) => {}
        }),
    ],
    blockGraft: [
        new ProskommaRenderAction({
            description: "identity",
            test: () => true,
            action: ({config, context, workspace, output}) => {}
        }),
    ],
    startParagraph: [
        new ProskommaRenderAction({
            description: "identity",
            test: () => true,
            action: ({config, context, workspace, output}) => {}
        }),
    ],
    endParagraph: [
        new ProskommaRenderAction({
            description: "identity",
            test: () => true,
            action: ({config, context, workspace, output}) => {}
        }),
    ],
    metaContent: [
        new ProskommaRenderAction({
            description: "identity",
            test: () => true,
            action: ({config, context, workspace, output}) => {}
        }),
    ],
    mark: [
        new ProskommaRenderAction({
            description: "identity",
            test: () => true,
            action: ({config, context, workspace, output}) => {}
        }),
    ],
    inlineGraft: [
        new ProskommaRenderAction({
            description: "identity",
            test: () => true,
            action: ({config, context, workspace, output}) => {}
        }),
    ],
    startWrapper: [
        new ProskommaRenderAction({
            description: "identity",
            test: () => true,
            action: ({config, context, workspace, output}) => {}
        }),
    ],
    endWrapper: [
        new ProskommaRenderAction({
            description: "identity",
            test: () => true,
            action: ({config, context, workspace, output}) => {}
        }),
    ],
    startMilestone: [
        new ProskommaRenderAction({
            description: "identity",
            test: () => true,
            action: ({config, context, workspace, output}) => {}
        }),
    ],
    endMilestone: [
        new ProskommaRenderAction({
            description: "identity",
            test: () => true,
            action: ({config, context, workspace, output}) => {}
        }),
    ],
    text: [
        new ProskommaRenderAction({
            description: "identity",
            test: () => true,
            action: ({config, context, workspace, output}) => {}
        }),
    ]
};

module.exports = identityActions;
